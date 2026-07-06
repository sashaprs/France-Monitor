/* ============================================================================
   build-calendrier.js — Calendrier parlementaire consolidé (module Suivi
   législatif).

   Sources :
   - AN : export open data Agenda (réunions + ordres du jour). Un événement
     par point d'ODJ confirmé (les séances portent plusieurs textes), ou par
     réunion quand l'ODJ n'est pas détaillé.
   - Sénat : AUCUNE source exploitable à ce jour (vérifié juillet 2026 :
     data.senat.fr ne publie pas l'agenda, senat.fr n'expose ni RSS ni ICS,
     l'application Aglae est du HTML par jour). Le JSON porte
     `senat: "indisponible"` et le frontend affiche un encadré dédié.

   Rattachement aux dossiers législatifs : référence directe
   (pointODJ.dossiersLegislatifsRefs) puis matching de titres normalisés
   contre dossiers-index.json (même technique que les scrutins).

   Sortie : public/data/legislatif/calendrier.json (21 prochains jours)
   Usage  : node scripts/legislatif/build-calendrier.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, download, zipEntries, toArr, val, decodeEntities, truncate } = require('../deputes/lib');

const OUT_FILE = path.join(ROOT, 'public', 'data', 'legislatif', 'calendrier.json');
const JOURS = 21;

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/* Heure locale Paris (l'export donne des timestamps avec fuseau). */
function heureParis(ts) {
  return new Date(ts).toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' });
}
function dateParis(ts) {
  return new Date(ts).toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ
}

function main() {
  console.log('▶ build-calendrier');

  /* ── 1. Libellés des organes (commissions, délégations…) ───────────────── */
  const organes = {};
  for (const { json } of zipEntries(download('amo'), n => n.includes('/organe/'))) {
    const o = json.organe;
    if (o && o.uid) organes[o.uid] = decodeEntities(val(o.libelleAbrege) || val(o.libelle) || '');
  }

  /* ── 2. Titres normalisés des dossiers actifs (matching de repli) ──────── */
  const titresNorm = [];
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'legislatif', 'dossiers-index.json'), 'utf8'));
    for (const d of idx.dossiers) {
      for (const t of [d.titre, d.titre_court]) {
        const n = normalize(t);
        if (n.length >= 25) titresNorm.push([n, d.id]);
      }
    }
    titresNorm.sort((a, b) => b[0].length - a[0].length);
  } catch {
    console.log('   ⚠ dossiers-index.json absent : rattachement par référence directe uniquement');
  }
  const matchDossier = (objet) => {
    const n = normalize(objet);
    const hit = titresNorm.find(([t]) => n.includes(t));
    return hit ? hit[1] : null;
  };

  /* Les commissions spéciales sont créées pour UN texte : quand l'objet est
     vague (« suite de l'examen des articles du projet de loi. »), on rattache
     par le nom de la commission saisie au fond figurant dans l'index. */
  const dossierParCommission = {};
  try {
    const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'data', 'legislatif', 'dossiers-index.json'), 'utf8'));
    for (const d of idx.dossiers) {
      if (d.commission && d.commission.startsWith('CS ')) {
        /* En cas de collision (réutilisation d'un nom de CS), le dossier le
           plus récent gagne — l'index est trié par date décroissante. */
        if (!dossierParCommission[d.commission]) dossierParCommission[d.commission] = d.id;
      }
    }
  } catch { /* index absent : repli déjà signalé plus haut */ }

  /* ── 3. Réunions AN des 21 prochains jours ─────────────────────────────── */
  /* Le workflow horaire fetch-an-data.yml télécharge déjà agenda.zip à la
     racine : on le réutilise s'il est présent pour éviter un double
     téléchargement. */
  const racineZip = path.join(ROOT, 'agenda.zip');
  const zipPath = fs.existsSync(racineZip) ? racineZip : download('agenda');

  const debutIso = new Date().toISOString();
  const fin = new Date();
  fin.setDate(fin.getDate() + JOURS);
  const finIso = fin.toISOString();

  const evenements = [];
  let reunions = 0, directs = 0, matches = 0;
  for (const { json } of zipEntries(zipPath)) {
    const r = json.reunion;
    if (!r || !r.timeStampDebut) continue;
    if (r.timeStampDebut < debutIso || r.timeStampDebut > finIso) continue;
    const etatReunion = (r.cycleDeVie && val(r.cycleDeVie.etat)) || '';
    if (etatReunion === 'Supprimé' || etatReunion === 'Annulé') continue;
    reunions++;

    const type = r['@xsi:type'] === 'seance_type' ? 'seance' : 'commission';
    const base = {
      date: dateParis(r.timeStampDebut),
      heure: heureParis(r.timeStampDebut),
      chambre: 'AN',
      type,
      organe: organes[val(r.organeReuniRef) || val(r.organeRef)] || (type === 'seance' ? 'Séance publique' : null),
      eventuel: etatReunion === 'Eventuel',
      lieu: (r.lieu && decodeEntities(val(r.lieu.libelleLong) || val(r.lieu.nomLieu) || '')) || null,
    };

    /* Un événement par point d'ODJ vivant ; sinon l'ODJ résumé ; sinon la
       réunion nue (fréquent pour les commissions dont l'ODJ n'est pas saisi). */
    const points = toArr(r.ODJ && r.ODJ.pointsODJ && r.ODJ.pointsODJ.pointODJ)
      .filter(p => p && !['Supprimé', 'Annulé'].includes((p.cycleDeVie && val(p.cycleDeVie.etat)) || ''));
    if (points.length) {
      for (const p of points) {
        const objet = decodeEntities(val(p.objet) || '') || null;
        let dossierId = null;
        for (const ref of toArr(p.dossiersLegislatifsRefs)) {
          const dr = val(ref && ref.dossierRef) || (typeof ref === 'string' ? ref : null);
          if (dr) { dossierId = dr; directs++; break; }
        }
        if (!dossierId && objet) { dossierId = matchDossier(objet); if (dossierId) matches++; }
        if (!dossierId && base.organe && dossierParCommission[base.organe]) { dossierId = dossierParCommission[base.organe]; matches++; }
        evenements.push({ ...base, objet: truncate(objet, 220), dossier_id: dossierId });
      }
    } else {
      const resume = r.ODJ && (val(r.ODJ.resumeODJ && r.ODJ.resumeODJ.item) || val(r.ODJ.resumeODJ)
        || val(r.ODJ.convocationODJ && r.ODJ.convocationODJ.item) || val(r.ODJ.convocationODJ));
      const objet = decodeEntities(Array.isArray(resume) ? resume[0] : resume || '') || null;
      let dossierId = objet ? matchDossier(objet) : null;
      if (!dossierId && base.organe && dossierParCommission[base.organe]) dossierId = dossierParCommission[base.organe];
      if (dossierId) matches++;
      evenements.push({ ...base, objet: truncate(objet, 220), dossier_id: dossierId });
    }
  }

  evenements.sort((a, b) => (a.date + a.heure) < (b.date + b.heure) ? -1 : 1);
  console.log(`   ${reunions} réunions AN sur ${JOURS} jours → ${evenements.length} événements`);
  console.log(`   rattachés à un dossier : ${directs} directs + ${matches} par titre`);

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({
    updatedAt: new Date().toISOString(),
    jours: JOURS,
    senat: 'indisponible', // voir l'en-tête : aucune source agenda Sénat exploitable
    evenements,
  }));
  console.log(`   ↳ calendrier.json : ${(fs.statSync(OUT_FILE).size / 1024).toFixed(0)} Ko`);
}

main();
