const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('scrutins.zip');
const entries = zip.getEntries();

const allScrutins = [];
// depId (without PA prefix) → { pour, contre, abstention, absent, votes: [{...}] }
const deputeStats = {};

function toArr(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

function extractId(ref) {
  // acteurRef is like "PA795998" → "795998"
  return ref ? String(ref).replace(/^PA/, '') : null;
}

const POS_CODE = { pour:'p', contre:'c', abstention:'a', absent:'x' };

function registerVote(acteurRef, scrutinInfo, position, parDelegation) {
  const id = extractId(acteurRef);
  if (!id) return;
  if (!deputeStats[id]) {
    deputeStats[id] = { p: 0, c: 0, a: 0, x: 0, v: [] };
  }
  const s = deputeStats[id];
  const key = POS_CODE[position] || 'x';
  s[key]++;
  s.v.push({
    d: scrutinInfo.date,
    t: scrutinInfo.titre,
    p: key,
    ...(parDelegation === 'true' ? { del: true } : {}),
  });
}

for (const entry of entries) {
  if (!entry.entryName.endsWith('.json') || entry.isDirectory) continue;
  try {
    const content = JSON.parse(entry.getData().toString('utf8'));
    const scrutin = content?.scrutin;
    if (!scrutin) continue;

    const scrutinInfo = {
      numero: scrutin.numero,
      titre: scrutin.titre,
      date: scrutin.dateScrutin,
      sort: scrutin.sort?.value || null,
    };

    allScrutins.push({
      ...scrutinInfo,
      nombreVotants: scrutin.syntheseVote?.nombreVotants || 0,
      pour: scrutin.syntheseVote?.decompte?.pour || 0,
      contre: scrutin.syntheseVote?.decompte?.contre || 0,
      abstentions: scrutin.syntheseVote?.decompte?.abstentions || 0,
      nonVotants: scrutin.syntheseVote?.decompte?.nonVotants || 0,
    });

    // Per-deputy votes extraction
    const vent = scrutin.ventilationVotes?.organe;
    const groupes = toArr(vent?.groupes?.groupe);
    for (const g of groupes) {
      const nom = g?.vote?.decompteNominatif;
      if (!nom) continue;
      for (const v of toArr(nom.pours?.votant)) {
        registerVote(v.acteurRef, scrutinInfo, 'pour', v.parDelegation);
      }
      for (const v of toArr(nom.contres?.votant)) {
        registerVote(v.acteurRef, scrutinInfo, 'contre', v.parDelegation);
      }
      for (const v of toArr(nom.abstentions?.votant)) {
        registerVote(v.acteurRef, scrutinInfo, 'abstention', v.parDelegation);
      }
      for (const v of toArr(nom.nonVotants?.votant)) {
        registerVote(v.acteurRef, scrutinInfo, 'absent', v.parDelegation);
      }
    }
  } catch (e) {
    // skip malformed files
  }
}

// Sort scrutins by date descending, keep 50 most recent
allScrutins.sort((a, b) => new Date(b.date) - new Date(a.date));
const recentScrutins = allScrutins.slice(0, 50);

// For each deputy: sort votes by date desc, keep last 30
for (const id of Object.keys(deputeStats)) {
  const s = deputeStats[id];
  s.v.sort((a, b) => new Date(b.d) - new Date(a.d));
  s.v = s.v.slice(0, 30);
}

const outDir = path.join('public', 'data');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'scrutins.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), scrutins: recentScrutins }, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'votes_deputes.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), deputes: deputeStats }, null, 0)
);

console.log(`✅ ${recentScrutins.length} scrutins → public/data/scrutins.json`);
console.log(`✅ ${Object.keys(deputeStats).length} députés avec votes → public/data/votes_deputes.json`);
