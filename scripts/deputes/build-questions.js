/* ============================================================================
   build-questions.js — Questions écrites (QE), orales sans débat (QOSD) et
   questions au gouvernement (QG) par député.

   Trois exports distincts, même schéma "question" : auteur (acteurRef),
   ministère interrogé (minInt), rubrique d'indexation, statut de clôture
   (cloture.libelleCloture, ex. « Réponse publiée ») sinon en attente.

   Sortie : tmp/build/questions.json
     { deputes: { id: { nb_ecrites, nb_orales, nb_gouvernement,
                        nb_reponses, liste: [100 max] } } }
   Usage : node scripts/deputes/build-questions.js
   ============================================================================ */

const { download, zipEntries, toArr, val, stripPA, writeBuild, decodeEntities, truncate } = require('./lib');

const MAX_LISTE = 100;
const SOURCES_Q = ['qe', 'qosd', 'qg'];

function main() {
  console.log('▶ build-questions');
  const deputes = {};
  const get = (id) => deputes[id] || (deputes[id] = {
    nb_ecrites: 0, nb_orales: 0, nb_gouvernement: 0, nb_reponses: 0, liste: [],
  });

  for (const key of SOURCES_Q) {
    let zipPath;
    try {
      zipPath = download(key);
    } catch (e) {
      console.error(`   ⚠ source ${key} indisponible : ${e.message} — section ignorée`);
      continue;
    }
    let n = 0;
    for (const { json } of zipEntries(zipPath)) {
      const q = json.question;
      if (!q) continue;
      const auteurId = stripPA(val(q.auteur && q.auteur.identite && q.auteur.identite.acteurRef));
      if (!auteurId) continue; // questions posées par des sénateurs… inexistant ici, mais prudence
      n++;

      const type = val(q.type) || key.toUpperCase(); // QE / QOSD / QG
      const idx = q.indexationAN || {};
      const analyses = idx.analyses || {};
      const titre = decodeEntities(val(toArr(analyses.analyse)[0]) || '') || null;
      const cloture = q.cloture ? toArr(q.cloture)[0] : null;
      const statut = cloture ? val(cloture.libelleCloture) : null;
      const aReponse = !!(q.textesReponse && val(q.textesReponse.texteReponse));

      // date de dépôt = date JO du texte de la question
      const tq = toArr(q.textesQuestion && q.textesQuestion.texteQuestion)[0];
      const date = val(tq && tq.infoJO && tq.infoJO.dateJO) || null;

      const d = get(auteurId);
      if (type === 'QE') d.nb_ecrites++;
      else if (type === 'QG') d.nb_gouvernement++;
      else d.nb_orales++;
      if (aReponse) d.nb_reponses++;

      d.liste.push({
        ty: type,
        num: val(q.identifiant && q.identifiant.numero) || null,
        d: date,
        t: truncate(titre, 180),
        r: truncate(decodeEntities(val(idx.rubrique)) || null, 60),
        m: truncate(decodeEntities(val(q.minInt && q.minInt.abrege)) || null, 80),
        s: statut || (aReponse ? 'Réponse publiée' : 'En attente de réponse'),
      });
    }
    console.log(`   ${key.toUpperCase()} : ${n} questions`);
  }

  for (const d of Object.values(deputes)) {
    d.nb_total_liste = d.liste.length;
    d.liste.sort((a, b) => String(b.d || '').localeCompare(String(a.d || '')));
    d.liste = d.liste.slice(0, MAX_LISTE);
  }

  writeBuild('questions.json', {
    updatedAt: new Date().toISOString(),
    deputes,
  });
  console.log(`   ${Object.keys(deputes).length} députés avec questions`);
  console.log('✅ build-questions terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-questions :', e.message); process.exit(1); }
}
module.exports = { main };
