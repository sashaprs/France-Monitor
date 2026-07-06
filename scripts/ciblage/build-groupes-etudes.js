/* ============================================================================
   build-groupes-etudes.js — Groupes d'études de l'Assemblée nationale.

   Les groupes d'études sont des organes officiels (export AMO, codeType "GE",
   codes POxxxxxx) ; l'adhésion de chaque député figure dans ses mandats
   (typeOrgane "GE") avec sa fonction (Président, Co-Président,
   Vice-Président, Secrétaire, Membre).

   Sortie : public/data/ciblage/groupes-etudes.json
     { updatedAt, groupes: [{ id, nom, membres: [{ id, f? }] }] }
     - f absent = simple membre ; sinon 'P' | 'CP' | 'VP' | 'S'
     - les noms/groupes des députés ne sont PAS dupliqués ici : le frontend
       fait la jointure avec l'index de ciblage (déjà en cache).

   Hors périmètre : les "clubs parlementaires" (structures privées, aucune
   source open data). Usage : node scripts/ciblage/build-groupes-etudes.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, download, zipEntries, toArr, val, stripPA, decodeEntities } = require('../deputes/lib');

const OUT = path.join(ROOT, 'public', 'data', 'ciblage', 'groupes-etudes.json');

/* Fonction abrégée ; les simples membres n'ont pas de champ f. */
const QUALITES = { 'Président': 'P', 'Co-Président': 'CP', 'Vice-Président': 'VP', 'Secrétaire': 'S' };
/* Ordre d'affichage : bureau d'abord. */
const ORDRE_F = { P: 0, CP: 1, VP: 2, S: 3, undefined: 4 };

function main() {
  console.log('▶ build-groupes-etudes');
  const zipPath = download('amo');

  const groupes = {}; // PO → { id, nom, membres: [] }
  const adhesions = []; // { po, depId, f }

  for (const { json, name } of zipEntries(zipPath)) {
    if (name.includes('/organe/')) {
      const o = json.organe;
      if (o && o.codeType === 'GE' && o.uid) {
        groupes[o.uid] = { id: o.uid, nom: decodeEntities(val(o.libelle) || o.uid), membres: [] };
      }
      continue;
    }
    const a = json.acteur;
    if (!a) continue;
    const depId = stripPA(val(a.uid && (a.uid['#text'] || a.uid)));
    if (!depId) continue;
    for (const m of toArr(a.mandats && a.mandats.mandat)) {
      if (m.typeOrgane !== 'GE' || val(m.dateFin)) continue; // mandats GE en cours
      const po = val(m.organes && m.organes.organeRef);
      if (!po) continue;
      const f = QUALITES[val(m.infosQualite && m.infosQualite.codeQualite)];
      adhesions.push({ po, depId, f });
    }
  }

  /* Un député peut cumuler plusieurs mandats actifs dans le même groupe
     (ex. membre + vice-président) : on ne garde que la fonction la plus
     élevée pour éviter les doublons à l'affichage. */
  let orphelins = 0;
  const parGroupe = {}; // po → { depId → f }
  for (const { po, depId, f } of adhesions) {
    if (!groupes[po]) { orphelins++; continue; } // organe absent de l'export (GE clos)
    const m = parGroupe[po] || (parGroupe[po] = {});
    if (!(depId in m) || ORDRE_F[f] < ORDRE_F[m[depId]]) m[depId] = f;
  }
  for (const [po, membres] of Object.entries(parGroupe)) {
    for (const [depId, f] of Object.entries(membres)) {
      groupes[po].membres.push(f ? { id: depId, f } : { id: depId });
    }
  }
  if (orphelins) console.log(`   ⚠ ${orphelins} adhésions vers des organes GE absents de l'export (ignorées)`);

  const liste = Object.values(groupes)
    .filter(g => g.membres.length > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  for (const g of liste) g.membres.sort((a, b) => ORDRE_F[a.f] - ORDRE_F[b.f]);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), groupes: liste }));
  const nbMembres = liste.reduce((s, g) => s + g.membres.length, 0);
  console.log(`   ${liste.length} groupes d'études, ${nbMembres} adhésions → ${(fs.statSync(OUT).size / 1e3).toFixed(0)} Ko`);
  console.log('✅ build-groupes-etudes terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-groupes-etudes :', e.message); process.exit(1); }
}
module.exports = { main };
