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
  /* Module Ciblage — après l'assemblage : ces étapes lisent les fiches
     publiées. Ordre imposé : groupes-etudes avant index (l'index intègre
     les GE), cosignatures en dernier (lit l'index de ciblage et ré-écrit
     les fiches avec top_cosignataires). Les ZIP sont déjà en cache tmp/. */
  { nom: 'ciblage-groupes-etudes', module: '../ciblage/build-groupes-etudes', bloquant: false },
  { nom: 'ciblage-index', module: '../ciblage/build-index', bloquant: false },
  { nom: 'ciblage-cosignatures', module: '../ciblage/build-cosignatures', bloquant: false },
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
