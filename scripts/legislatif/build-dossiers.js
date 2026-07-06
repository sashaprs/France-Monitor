/* ============================================================================
   build-dossiers.js — Timelines des dossiers législatifs (module Suivi
   législatif).

   Source : export open data AN « Dossiers législatifs » (~10 Mo zippé),
   complété par Scrutins (rattachement scrutin → dossier), AMO10 (noms des
   commissions et des rapporteurs) et Amendements (compteurs par sort,
   optionnel car l'export pèse ~280 Mo).

   Pour chaque dossier de la législature courante, on aplatit la hiérarchie
   d'actes législatifs (actesLegislatifs récursif) en une timeline normalisée
   d'étapes { date, chambre, type, libelle, url_document } et on en déduit le
   statut courant.

   Correspondance codes d'actes → chambre :
     AN*  → AN            SN* → Sénat        CMP* → CMP
     PROM → Gouvernement  CC* → CC (Conseil constitutionnel, extension à
                                    l'énumération du cahier des charges)

   Sorties :
     public/data/legislatif/dossiers-index.json   (liste légère, < 400 Ko)
     public/data/legislatif/dossiers/<id>.json    (timeline + scrutins +
                                                   compteurs d'amendements)

   Usage : node --max-old-space-size=6144 scripts/legislatif/build-dossiers.js
           [--skip-amendements]  (saute le scan de l'export Amendements)
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, LEGISLATURE, download, zipEntries, toArr, val, decodeEntities, truncate } = require('../deputes/lib');

const OUT_DIR = path.join(ROOT, 'public', 'data', 'legislatif');
const OUT_DOSSIERS = path.join(OUT_DIR, 'dossiers');
const SKIP_AMENDEMENTS = process.argv.includes('--skip-amendements');

/* Fenêtre d'activité de l'index : dossiers ayant eu une étape datée dans les
   N derniers mois. 12 mois (et non 24 comme initialement prévu) pour tenir
   l'objectif de poids : à 24 mois, l'index de la législature 17 pèse ~790 Ko,
   à 12 mois ~390 Ko. */
const FENETRE_MOIS = 12;

/* ── Normalisation texte (matching de titres, insensible casse/accents) ──── */
function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* ── Chambre et type d'étape à partir du code d'acte ─────────────────────── */
function chambreOf(code) {
  if (code.startsWith('CMP')) return 'CMP';
  if (code.startsWith('PROM')) return 'Gouvernement';
  if (code.startsWith('CC')) return 'CC';
  if (code.startsWith('SN')) return 'Sénat';
  if (code.startsWith('AN')) return 'AN';
  return 'Gouvernement';
}

/* Retourne le type d'étape normalisé, ou null si l'acte n'est pas une étape
   de timeline (nœuds conteneurs, procédure accélérée…). */
function typeOf(code, statut) {
  if (code === 'PROM-PUB') return 'promulgation';
  if (code.startsWith('CC')) return 'cc';
  if (/-DEC(-|$)/.test(code)) {
    const lib = normalize(statut && statut.libelle);
    if (lib.includes('rejet')) return 'rejet';
    if (lib.includes('retir') || lib.includes('retrait') || lib.includes('caduc')) return 'retrait';
    return 'adoption'; // adopté / modifié / adopté définitivement…
  }
  if (code.includes('RETRAIT') || code.endsWith('-RTRINI')) return 'retrait';
  if (code.startsWith('CMP')) return 'cmp';
  if (code.endsWith('-DEPOT') || code.endsWith('-DPTLETTRECT')) return 'depot';
  if (code.includes('-COM-') || code.includes('-COMENQ-') || code.includes('-MISINF-') || code.endsWith('-RAPPORT')) return 'commission';
  if (code.includes('-DEBATS') || code.includes('-MOTION') || code.endsWith('-DGVT')) return 'seance';
  return null; // annexes du dépôt (avis CE, étude d'impact…) : hors timeline
}

/* ── Statut courant du dossier ────────────────────────────────────────────
   Priorité aux états terminaux (promulgué / retiré), sinon on interprète la
   dernière étape datée. Une adoption « définitive » ou « sans modification »
   (navette conclue) vaut adoption du texte ; une adoption en cours de navette
   renvoie le texte à l'autre chambre. */
function statutOf(etapes) {
  if (etapes.some(e => e.type === 'promulgation')) return 'promulgue';
  if (etapes.some(e => e.type === 'retrait')) return 'retire';
  const last = etapes[etapes.length - 1];
  if (!last) return 'en_commission';
  switch (last.type) {
    case 'rejet': return 'rejete';
    case 'adoption': {
      const lib = normalize(last.libelle);
      if (lib.includes('definitiv') || lib.includes('sans modification')
          || last.code.startsWith('ANLDEF') || last.code.startsWith('ANLUNI')) return 'adopte';
      return 'en_navette'; // adopté/modifié par une chambre : la navette continue
    }
    case 'cmp': return 'en_navette';
    case 'cc': return 'adopte'; // texte adopté, en examen constitutionnel
    case 'depot': return /^(AN|SN)1-/.test(last.code) ? 'en_commission' : 'en_navette';
    case 'commission': return 'en_commission';
    case 'seance': return 'en_seance';
    default: return 'en_commission';
  }
}

function main() {
  console.log('▶ build-dossiers');
  fs.mkdirSync(OUT_DOSSIERS, { recursive: true });

  /* ── 1. Référentiel organes + acteurs (AMO10) ───────────────────────────
     Noms des commissions (organeRef) et des rapporteurs (acteurRef). */
  const organes = {}; // uid → libellé
  const acteurs = {}; // uid (avec préfixe PA) → « Prénom Nom »
  const amoZip = download('amo');
  for (const { json } of zipEntries(amoZip, n => n.includes('/organe/'))) {
    const o = json.organe;
    if (o && o.uid) organes[o.uid] = decodeEntities(val(o.libelleAbrege) || val(o.libelle) || '');
  }
  for (const { json } of zipEntries(amoZip, n => n.includes('/acteur/'))) {
    const a = json.acteur;
    if (!a || !a.uid) continue;
    const ec = a.etatCivil && a.etatCivil.ident;
    if (ec) acteurs[val(a.uid['#text'] ? a.uid['#text'] : a.uid)] = `${val(ec.prenom) || ''} ${val(ec.nom) || ''}`.trim();
  }
  console.log(`   ${Object.keys(organes).length} organes, ${Object.keys(acteurs).length} acteurs (AMO10)`);

  /* ── 2. Dossiers législatifs : timelines ──────────────────────────────── */
  const dossiersZip = download('dossiers');
  const dossiers = {};      // uid → objet dossier complet
  const docToDossier = {};  // uid document → uid dossier (liens amendements/scrutins)
  const docTitres = {};     // uid document → titre court (matching scrutins)

  for (const { json } of zipEntries(dossiersZip, n => n.includes('/document/'))) {
    const doc = json.document;
    if (!doc || String(doc.legislature) !== LEGISLATURE) continue;
    if (doc.uid && doc.dossierRef) {
      docToDossier[doc.uid] = doc.dossierRef;
      const t = val(doc.titres && doc.titres.titrePrincipalCourt);
      if (t) docTitres[doc.uid] = decodeEntities(t);
    }
  }

  const codesInconnus = new Set();
  for (const { json } of zipEntries(dossiersZip, n => n.includes('/dossierParlementaire/'))) {
    const d = json.dossierParlementaire;
    if (!d || String(d.legislature) !== LEGISLATURE || !d.uid) continue;

    const etapes = [];
    let commission = null, rapporteur = null, procAcc = false, infoLoi = null;

    (function walk(a) {
      for (const acte of toArr(a)) {
        if (!acte) continue;
        const code = String(acte.codeActe || '');
        if (code.endsWith('-PROCACC')) procAcc = true;
        /* Commission saisie au fond : premier renvoi AN (ou Sénat à défaut). */
        if (code.endsWith('-COM-FOND-SAISIE') && acte.organeRef && (!commission || code.startsWith('AN'))) {
          if (!commission || code.startsWith('AN')) commission = organes[acte.organeRef] || null;
        }
        /* Rapporteur de la commission au fond (côté AN en priorité). */
        if (code.endsWith('-COM-FOND-NOMIN') && acte.rapporteurs && (!rapporteur || code.startsWith('AN'))) {
          const r = toArr(acte.rapporteurs.rapporteur)[0];
          const ref = r && val(r.acteurRef);
          if (ref && acteurs[ref]) rapporteur = acteurs[ref];
        }
        if (code === 'PROM-PUB') {
          infoLoi = {
            code_loi: val(acte.codeLoi) || null,
            titre_loi: decodeEntities(val(acte.titreLoi) || '') || null,
            url_legifrance: (acte.infoJO && val(acte.infoJO.urlLegifrance)) || null,
            date_jo: (acte.infoJO && val(acte.infoJO.dateJO)) || null,
          };
        }
        const date = acte.dateActe ? String(acte.dateActe).slice(0, 10) : null;
        const type = date ? typeOf(code, acte.statutConclusion) : null;
        if (date && type) {
          let libelle = decodeEntities(val(acte.libelleActe && acte.libelleActe.nomCanonique) || code);
          const conclusion = acte.statutConclusion && val(acte.statutConclusion.libelle);
          if (conclusion) libelle += ` — ${decodeEntities(conclusion)}`;
          etapes.push({
            date, code,
            chambre: chambreOf(code),
            type,
            libelle: truncate(libelle, 140),
            url_document: code === 'PROM-PUB' && acte.infoJO ? val(acte.infoJO.urlLegifrance) : null,
          });
        } else if (date && !type && !codesInconnus.has(code)) {
          codesInconnus.add(code);
        }
        if (acte.actesLegislatifs) walk(acte.actesLegislatifs.acteLegislatif);
      }
    })(d.actesLegislatifs && d.actesLegislatifs.acteLegislatif);

    etapes.sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
    if (!etapes.length) continue; // dossier sans aucune étape datée : inutilisable

    dossiers[d.uid] = {
      id: d.uid,
      titre: decodeEntities(val(d.titreDossier && d.titreDossier.titre) || ''),
      chemin: val(d.titreDossier && d.titreDossier.titreChemin) || null,
      url_senat: val(d.titreDossier && d.titreDossier.senatChemin) || null,
      procedure: decodeEntities(val(d.procedureParlementaire && d.procedureParlementaire.libelle) || ''),
      procedure_acceleree: procAcc,
      commission, rapporteur,
      loi: infoLoi,
      statut: statutOf(etapes),
      date_derniere_etape: etapes[etapes.length - 1].date,
      etapes,
      scrutins: [],
      amendements: null, // rempli à l'étape 4 si l'export est scanné
    };
  }
  console.log(`   ${Object.keys(dossiers).length} dossiers L${LEGISLATURE} avec timeline`);
  if (codesInconnus.size) console.log(`   codes d'actes ignorés : ${[...codesInconnus].sort().join(', ')}`);

  /* Titre court : celui du premier document déposé du dossier. */
  const titreCourtParDossier = {};
  for (const [docUid, dosUid] of Object.entries(docToDossier)) {
    if (docTitres[docUid] && !titreCourtParDossier[dosUid]) titreCourtParDossier[dosUid] = docTitres[docUid];
  }

  /* ── 3. Rattachement des scrutins ───────────────────────────────────────
     Lien direct (objet.dossierLegislatif.dossierRef, ~28 % des scrutins) puis
     repli : le titre court d'un document du dossier apparaît dans le libellé
     du scrutin (insensible casse/accents). */
  const titresNorm = []; // [titre normalisé, uid dossier] triés du + long au + court
  for (const [docUid, dosUid] of Object.entries(docToDossier)) {
    const t = normalize(docTitres[docUid]);
    if (t && t.length >= 25 && dossiers[dosUid]) titresNorm.push([t, dosUid]);
  }
  for (const [uid, d] of Object.entries(dossiers)) {
    const t = normalize(d.titre);
    if (t.length >= 25) titresNorm.push([t, uid]);
  }
  titresNorm.sort((a, b) => b[0].length - a[0].length);

  let scrutinsLies = 0, scrutinsDirects = 0, scrutinsTotal = 0;
  for (const { json } of zipEntries(download('scrutins'))) {
    const s = json.scrutin;
    if (!s || String(s.legislature) !== LEGISLATURE) continue;
    scrutinsTotal++;
    const libelle = decodeEntities(val(s.objet && s.objet.libelle) || val(s.titre) || '');
    let dosUid = s.objet && s.objet.dossierLegislatif && val(s.objet.dossierLegislatif.dossierRef);
    if (dosUid && dossiers[dosUid]) scrutinsDirects++;
    if (!dosUid || !dossiers[dosUid]) {
      const norm = normalize(libelle);
      const hit = titresNorm.find(([t]) => norm.includes(t));
      dosUid = hit ? hit[1] : null;
    }
    if (!dosUid || !dossiers[dosUid]) continue;
    scrutinsLies++;
    const synthese = s.syntheseVote || {};
    const decompte = synthese.decompte || {};
    dossiers[dosUid].scrutins.push({
      numero: String(val(s.numero) || ''),
      date: val(s.dateScrutin) || null,
      titre: truncate(libelle, 180),
      sort: (s.sort && decodeEntities(val(s.sort.code) || '')) || null,
      pour: val(decompte.pour) || null,
      contre: val(decompte.contre) || null,
      abstentions: val(decompte.abstentions) || null,
    });
  }
  for (const d of Object.values(dossiers)) {
    d.scrutins.sort((a, b) => (a.date || '') < (b.date || '') ? -1 : 1);
    /* Les gros textes accumulent des centaines de scrutins d'amendements :
       on garde les 60 plus récents pour contenir le poids des fiches. */
    if (d.scrutins.length > 60) d.scrutins = d.scrutins.slice(-60);
  }
  console.log(`   scrutins rattachés : ${scrutinsLies}/${scrutinsTotal} (directs : ${scrutinsDirects})`);

  /* ── 4. Compteurs d'amendements par sort ────────────────────────────────
     Export volumineux : toute erreur ici est non bloquante (les fiches
     sortent alors sans compteurs plutôt que pas du tout). */
  if (!SKIP_AMENDEMENTS) {
    try {
      let comptes = 0;
      for (const { json } of zipEntries(download('amendements'))) {
        const am = json.amendement;
        if (!am || String(am.legislature) !== LEGISLATURE) continue;
        const dosUid = docToDossier[val(am.texteLegislatifRef)];
        const d = dosUid && dossiers[dosUid];
        if (!d) continue;
        const sort = (am.cycleDeVie && val(am.cycleDeVie.sort)) || 'En cours';
        if (!d.amendements) d.amendements = { total: 0, par_sort: {} };
        d.amendements.total++;
        d.amendements.par_sort[sort] = (d.amendements.par_sort[sort] || 0) + 1;
        comptes++;
      }
      console.log(`   ${comptes} amendements comptés`);
    } catch (e) {
      console.error(`   ⚠ scan amendements échoué (fiches sans compteurs) : ${e.message}`);
    }
  } else {
    console.log('   scan amendements sauté (--skip-amendements)');
  }

  /* ── 5. Écriture des sorties ────────────────────────────────────────── */
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - FENETRE_MOIS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const actifs = Object.values(dossiers)
    .filter(d => d.date_derniere_etape >= cutoffIso)
    .sort((a, b) => a.date_derniere_etape < b.date_derniere_etape ? 1 : -1);

  /* Fiches détaillées (une par dossier actif). On purge d'abord les fiches
     existantes pour ne pas laisser traîner des dossiers sortis de la fenêtre. */
  for (const f of fs.readdirSync(OUT_DOSSIERS)) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(OUT_DOSSIERS, f));
  }
  let poidsFiches = 0;
  for (const d of actifs) {
    const fiche = {
      id: d.id,
      titre: d.titre,
      titre_court: titreCourtParDossier[d.id] || null,
      url: d.chemin ? `https://www.assemblee-nationale.fr/dyn/${LEGISLATURE}/dossiers/${d.chemin}` : null,
      url_senat: d.url_senat,
      procedure: d.procedure,
      procedure_acceleree: d.procedure_acceleree,
      commission: d.commission,
      rapporteur: d.rapporteur,
      statut: d.statut,
      loi: d.loi,
      date_derniere_etape: d.date_derniere_etape,
      etapes: d.etapes.map(({ code, ...e }) => e), // code interne non publié
      scrutins: d.scrutins,
      amendements: d.amendements,
    };
    const p = path.join(OUT_DOSSIERS, `${d.id}.json`);
    fs.writeFileSync(p, JSON.stringify(fiche));
    poidsFiches += fs.statSync(p).size;
  }

  /* Index léger. */
  const index = {
    updatedAt: new Date().toISOString(),
    fenetre_mois: FENETRE_MOIS,
    dossiers: actifs.map(d => {
      /* titre_court omis quand il ne fait que répéter le titre (≈ 100 Ko
         économisés sur l'index) ; la fiche détaillée le porte toujours. */
      const court = truncate(titreCourtParDossier[d.id] || '', 120) || null;
      const redondant = court && (normalize(d.titre).includes(normalize(court))
        || normalize(court).includes(normalize(d.titre).slice(0, 60)));
      return {
        id: d.id,
        titre: truncate(d.titre, 160),
        titre_court: redondant ? null : court,
        statut: d.statut,
        date: d.date_derniere_etape,
        commission: d.commission,
        rapporteur: d.rapporteur,
      };
    }),
  };
  const indexPath = path.join(OUT_DIR, 'dossiers-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index));

  const poidsIndex = fs.statSync(indexPath).size;
  console.log(`   ↳ ${actifs.length} dossiers actifs (fenêtre ${FENETRE_MOIS} mois)`);
  console.log(`   ↳ dossiers-index.json : ${(poidsIndex / 1024).toFixed(0)} Ko ${poidsIndex > 400 * 1024 ? '⚠ > 400 Ko' : '(ok)'}`);
  console.log(`   ↳ fiches dossiers : ${(poidsFiches / 1e6).toFixed(1)} Mo au total`);
}

main();
