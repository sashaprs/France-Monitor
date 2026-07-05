/* ============================================================================
   build-amendements.js — Amendements déposés et cosignés par député.

   L'export Amendements (~300 Mo zippé, ~120 000 fichiers) contient aussi des
   dossiers de la législature précédente : on filtre sur legislature === '17'.
   Le titre du texte visé est résolu via l'export Dossiers législatifs
   (document.titres.titrePrincipalCourt), beaucoup plus léger.

   Sortie : tmp/build/amendements.json
     { deputes: { id: { nb, nb_adoptes, nb_sort_connu, nb_cosignes,
                        nb_cosignes_adoptes, liste: [200 max] } } }
   Usage : node scripts/deputes/build-amendements.js
   ============================================================================ */

const { LEGISLATURE, download, zipEntries, toArr, val, stripPA, writeBuild, decodeEntities, truncate } = require('./lib');

const MAX_LISTE = 200;

function main() {
  console.log('▶ build-amendements');

  /* ── 1. Titres des textes législatifs (uid document → titre court) ───── */
  const titres = {};
  const dossiersZip = download('dossiers');
  for (const { json } of zipEntries(dossiersZip, n => n.includes('/document/'))) {
    const doc = json.document;
    if (!doc || String(doc.legislature) !== LEGISLATURE) continue;
    const t = val(doc.titres && doc.titres.titrePrincipalCourt) || val(doc.titres && doc.titres.titrePrincipal);
    if (doc.uid && t) titres[doc.uid] = truncate(decodeEntities(t), 160);
  }
  console.log(`   ${Object.keys(titres).length} titres de textes résolus`);

  /* ── 2. Parcours des amendements ─────────────────────────────────────── */
  const zipPath = download('amendements');
  const deputes = {}; // id → agrégat
  const get = (id) => deputes[id] || (deputes[id] = {
    nb: 0, nb_adoptes: 0, nb_sort_connu: 0,
    nb_cosignes: 0, nb_cosignes_adoptes: 0, liste: [],
  });

  let total = 0;
  for (const { json } of zipEntries(zipPath)) {
    const am = json.amendement;
    if (!am || String(am.legislature) !== LEGISLATURE) continue;
    total++;

    const sig = am.signataires || {};
    const auteur = sig.auteur || {};
    if (val(auteur.typeAuteur) !== 'Député') continue; // amendements du Gouvernement etc.
    const auteurId = stripPA(val(auteur.acteurRef));
    if (!auteurId) continue;

    const cycleDeVie = am.cycleDeVie || {};
    const sort = val(cycleDeVie.sort) || null; // Adopté / Rejeté / Irrecevable / Retiré / Non soutenu / Tombé / null
    const date = val(cycleDeVie.dateDepot) || null;
    const cosign = toArr(sig.cosignataires && sig.cosignataires.acteurRef)
      .map(r => stripPA(val(r))).filter(Boolean);

    const d = get(auteurId);
    d.nb++;
    if (sort) {
      d.nb_sort_connu++;
      if (sort === 'Adopté') d.nb_adoptes++;
    }
    d.liste.push({
      num: val(am.identification && am.identification.numeroLong) || null,
      d: date,
      s: sort || 'En cours',
      t: titres[val(am.texteLegislatifRef)] || null,
      div: truncate(decodeEntities(val(am.pointeurFragmentTexte && am.pointeurFragmentTexte.division
        && am.pointeurFragmentTexte.division.articleDesignationCourte)) || null, 40),
      nc: cosign.length,
    });

    for (const cid of cosign) {
      const c = get(cid);
      c.nb_cosignes++;
      if (sort === 'Adopté') c.nb_cosignes_adoptes++;
    }
  }
  console.log(`   ${total} amendements (législature ${LEGISLATURE})`);

  /* ── 3. Tri et troncature des listes ─────────────────────────────────── */
  for (const d of Object.values(deputes)) {
    d.nb_total_liste = d.liste.length;
    d.liste.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    d.liste = d.liste.slice(0, MAX_LISTE);
  }

  writeBuild('amendements.json', {
    updatedAt: new Date().toISOString(),
    nbAmendements: total,
    deputes,
  });
  console.log(`   ${Object.keys(deputes).length} députés (auteurs ou cosignataires)`);
  console.log('✅ build-amendements terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-amendements :', e.message); process.exit(1); }
}
module.exports = { main };
