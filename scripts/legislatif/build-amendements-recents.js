/* ============================================================================
   build-amendements-recents.js — Amendements récents pour la recherche par
   mot-clé (module Suivi législatif).

   Étend le pipeline amendements existant (scripts/deputes/build-amendements.js
   agrège par député ; ici on produit une liste plate des amendements les plus
   récents, tous auteurs confondus, avec exposé sommaire pour la recherche
   plein texte côté client).

   Fenêtre glissante : 60 jours par défaut ; si le JSON dépasse 800 Ko, on
   resserre (30, puis 14, puis 7 jours). La fenêtre retenue est publiée dans
   le champ `fenetre_jours`.

   URL publique d'un amendement (vérifiée séance et commission) :
     https://www.assemblee-nationale.fr/dyn/<leg>/amendements/
       <n° du texte>/<prefixeOrganeExamen>/<numeroLong>

   Sortie : public/data/legislatif/amendements-recents.json
   Usage  : node --max-old-space-size=6144 scripts/legislatif/build-amendements-recents.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, LEGISLATURE, download, zipEntries, val, stripPA, decodeEntities, truncate } = require('../deputes/lib');

const OUT_DIR = path.join(ROOT, 'public', 'data', 'legislatif');
const OUT_FILE = path.join(OUT_DIR, 'amendements-recents.json');
const FENETRES_JOURS = [60, 30, 14, 7];
const POIDS_MAX = 800 * 1024;

/* Exposé sommaire : HTML → texte brut compact. */
function htmlToText(html) {
  if (!html) return null;
  return decodeEntities(String(html).replace(/<[^>]+>/g, ' ')) || null;
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function main() {
  console.log('▶ build-amendements-recents');
  fs.mkdirSync(OUT_DIR, { recursive: true });

  /* ── 1. Correspondance document → dossier (export Dossiers) ───────────── */
  const docToDossier = {};
  for (const { json } of zipEntries(download('dossiers'), n => n.includes('/document/'))) {
    const doc = json.document;
    if (doc && String(doc.legislature) === LEGISLATURE && doc.uid && doc.dossierRef) {
      docToDossier[doc.uid] = doc.dossierRef;
    }
  }

  /* Titres des dossiers pour le filtre « par dossier » du frontend : on lit
     l'index produit par build-dossiers.js (mêmes données, déjà arbitrées). */
  const titresDossiers = {};
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'dossiers-index.json'), 'utf8'));
    for (const d of idx.dossiers) titresDossiers[d.id] = d.titre_court || d.titre;
  } catch {
    console.log('   ⚠ dossiers-index.json absent : filtre dossier sans libellés');
  }

  /* ── 2. Noms et groupes des députés (deputes.json, ids sans préfixe PA) ── */
  const deputes = {};
  try {
    const dj = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'deputes.json'), 'utf8'));
    for (const d of dj.deputes) deputes[d.id] = { nom: d.nomComplet, groupe: d.groupe && d.groupe.short };
  } catch {
    console.log('   ⚠ deputes.json illisible : auteurs sans nom/groupe');
  }

  /* ── 3. Scan de l'export Amendements sur la fenêtre la plus large ──────── */
  const cutoffLarge = isoDaysAgo(FENETRES_JOURS[0]);
  const recents = [];
  for (const { json } of zipEntries(download('amendements'))) {
    const am = json.amendement;
    if (!am || String(am.legislature) !== LEGISLATURE) continue;
    const date = (am.cycleDeVie && val(am.cycleDeVie.dateDepot)) || null;
    if (!date || date < cutoffLarge) continue;

    const ident = am.identification || {};
    const auteurRaw = (am.signataires && am.signataires.auteur) || {};
    const type = val(auteurRaw.typeAuteur);
    let auteur;
    if (type === 'Député') {
      const id = stripPA(val(auteurRaw.acteurRef));
      const fiche = deputes[id] || {};
      auteur = { id, nom: fiche.nom || null, groupe: fiche.groupe || null };
    } else {
      /* Gouvernement, rapporteur au nom d'une commission… */
      auteur = { id: null, nom: type || 'Autre', groupe: null };
    }

    const division = am.pointeurFragmentTexte && am.pointeurFragmentTexte.division;
    const texteRef = val(am.texteLegislatifRef) || '';
    const numTexte = (texteRef.match(/(\d+)$/) || [])[1];
    const prefixe = val(ident.prefixeOrganeExamen);
    const numero = val(ident.numeroLong);

    recents.push({
      id: am.uid,
      numero,
      date,
      auteur,
      dossier_id: docToDossier[texteRef] || null,
      article_vise: decodeEntities(val(division && division.articleDesignationCourte) || '') || null,
      sort: (am.cycleDeVie && val(am.cycleDeVie.sort)) || 'En cours',
      resume: truncate(htmlToText(val(am.corps && am.corps.contenuAuteur && am.corps.contenuAuteur.exposeSommaire)), 200),
      url: numTexte && prefixe && numero
        ? `https://www.assemblee-nationale.fr/dyn/${LEGISLATURE}/amendements/${numTexte}/${prefixe}/${numero}`
        : null,
    });
  }
  recents.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
  console.log(`   ${recents.length} amendements sur ${FENETRES_JOURS[0]} jours`);

  /* ── 4. Resserrage de la fenêtre jusqu'à passer sous 800 Ko ────────────── */
  let sortie = null;
  for (const jours of FENETRES_JOURS) {
    const cutoff = isoDaysAgo(jours);
    const liste = recents.filter(a => a.date >= cutoff);
    /* Le filtre dossier n'embarque que les dossiers réellement cités. */
    const dossiers = {};
    for (const a of liste) {
      if (a.dossier_id && titresDossiers[a.dossier_id]) dossiers[a.dossier_id] = titresDossiers[a.dossier_id];
    }
    const contenu = JSON.stringify({
      updatedAt: new Date().toISOString(),
      fenetre_jours: jours,
      dossiers,
      amendements: liste,
    });
    console.log(`   fenêtre ${jours} j : ${liste.length} amendements, ${(contenu.length / 1024).toFixed(0)} Ko`);
    sortie = contenu;
    if (contenu.length <= POIDS_MAX) break;
  }

  fs.writeFileSync(OUT_FILE, sortie);
  const poids = fs.statSync(OUT_FILE).size;
  console.log(`   ↳ amendements-recents.json : ${(poids / 1024).toFixed(0)} Ko ${poids > POIDS_MAX ? '⚠ > 800 Ko malgré la fenêtre minimale' : '(ok)'}`);
}

main();
