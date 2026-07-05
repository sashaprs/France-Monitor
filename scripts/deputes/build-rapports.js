/* ============================================================================
   build-rapports.js — Fonctions de rapporteur par député.

   Source : export Dossiers législatifs, dossier json/document/. Un député
   est rapporteur quand il apparaît dans document.auteurs.auteur[].acteur
   avec une qualite contenant « rapporteur » (rapporteur, rapporteur général,
   rapporteur pour avis, co-rapporteur…).

   Sortie : tmp/build/rapports.json
     { deputes: { id: { nb, liste: [{ d, t, ty, q }] } } }
   Usage : node scripts/deputes/build-rapports.js
   ============================================================================ */

const { LEGISLATURE, download, zipEntries, toArr, val, stripPA, writeBuild, decodeEntities, truncate } = require('./lib');

function main() {
  console.log('▶ build-rapports');
  const zipPath = download('dossiers');

  const deputes = {};
  let total = 0;
  for (const { json } of zipEntries(zipPath, n => n.includes('/document/'))) {
    const doc = json.document;
    if (!doc || String(doc.legislature) !== LEGISLATURE) continue;

    const auteurs = toArr(doc.auteurs && doc.auteurs.auteur);
    const rapporteurs = auteurs
      .map(a => a.acteur)
      .filter(a => a && /rapporteur/i.test(val(a.qualite) || ''));
    if (!rapporteurs.length) continue;

    const titres = doc.titres || {};
    const titre = truncate(decodeEntities(val(titres.titrePrincipalCourt) || val(titres.titrePrincipal) || ''), 200);
    const classif = doc.classification || {};
    const type = val(classif.type && classif.type.libelle) || null;
    const chrono = (doc.cycleDeVie && doc.cycleDeVie.chrono) || {};
    const date = String(val(chrono.dateDepot) || val(chrono.dateCreation) || '').slice(0, 10) || null;

    total++;
    for (const r of rapporteurs) {
      const id = stripPA(val(r.acteurRef));
      if (!id) continue;
      const d = deputes[id] || (deputes[id] = { nb: 0, liste: [] });
      d.nb++;
      d.liste.push({
        d: date,
        t: titre,
        ty: type,
        q: decodeEntities(val(r.qualite)),
      });
    }
  }

  for (const d of Object.values(deputes)) {
    d.liste.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    d.liste = d.liste.slice(0, 50);
  }

  writeBuild('rapports.json', { updatedAt: new Date().toISOString(), deputes });
  console.log(`   ${total} documents avec rapporteur, ${Object.keys(deputes).length} députés concernés`);
  console.log('✅ build-rapports terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-rapports :', e.message); process.exit(1); }
}
module.exports = { main };
