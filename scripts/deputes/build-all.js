/* ============================================================================
   build-all.js — Enchaîne tout le pipeline "Fiches députés".

   Chaque étape est isolée : si une source est indisponible (site AN en
   maintenance…), l'étape échoue proprement et les fiches sont assemblées
   sans cette section (assemble-fiches gère les intermédiaires manquants).
   Seul l'échec du référentiel est bloquant : sans lui, pas de fiches.

   Usage : node scripts/deputes/build-all.js
   ============================================================================ */

const etapes = [
  { nom: 'referentiel', module: './build-referentiel', bloquant: true },
  { nom: 'votes', module: './build-votes', bloquant: false },
  { nom: 'amendements', module: './build-amendements', bloquant: false },
  { nom: 'questions', module: './build-questions', bloquant: false },
  { nom: 'rapports', module: './build-rapports', bloquant: false },
  { nom: 'assemblage', module: './assemble-fiches', bloquant: true },
];

const debut = Date.now();
let echecs = 0;

for (const etape of etapes) {
  try {
    require(etape.module).main();
  } catch (e) {
    echecs++;
    console.error(`❌ étape « ${etape.nom} » en échec : ${e.message}`);
    if (etape.bloquant) {
      console.error('   étape bloquante — arrêt du build');
      process.exit(1);
    }
    console.error('   étape non bloquante — le build continue sans cette section');
  }
}

console.log(`\n🏁 build terminé en ${((Date.now() - debut) / 60000).toFixed(1)} min${echecs ? ` (${echecs} étape(s) en échec)` : ''}`);
process.exit(echecs ? 2 : 0);
