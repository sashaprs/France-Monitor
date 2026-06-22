const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('scrutins.zip');
const entries = zip.getEntries();

let allScrutins = [];

for (const entry of entries) {
  if (entry.entryName.endsWith('.json') && !entry.isDirectory) {
    try {
      const content = JSON.parse(entry.getData().toString('utf8'));
      const scrutin = content?.scrutin;
      if (!scrutin) continue;

      allScrutins.push({
        numero: scrutin.numero,
        titre: scrutin.titre,
        date: scrutin.dateScrutin,
        sort: scrutin.sort?.value || null,
        nombreVotants: scrutin.syntheseVote?.nombreVotants || 0,
        pour: scrutin.syntheseVote?.decompte?.pour || 0,
        contre: scrutin.syntheseVote?.decompte?.contre || 0,
        abstentions: scrutin.syntheseVote?.decompte?.abstentions || 0,
        nonVotants: scrutin.syntheseVote?.decompte?.nonVotants || 0,
      });
    } catch (e) {
      // fichier malformé, on skip
    }
  }
}

// Trier par date décroissante, garder les 50 derniers
allScrutins.sort((a, b) => new Date(b.date) - new Date(a.date));
allScrutins = allScrutins.slice(0, 50);

const outDir = path.join('public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'scrutins.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), scrutins: allScrutins }, null, 2)
);

console.log(`✅ ${allScrutins.length} scrutins écrits dans public/data/scrutins.json`);
