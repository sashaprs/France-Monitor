const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('agenda.zip');
const entries = zip.getEntries();

let reunions = [];
const now = new Date();
const cutoff = new Date(now);
cutoff.setDate(cutoff.getDate() - 3); // garder 3 jours passés

function getTitle(r) {
  const odj = r.ODJ;
  if (!odj) return null;
  const resume = odj.resumeODJ;
  if (resume) {
    if (typeof resume === 'string') return resume;
    if (resume.item) return Array.isArray(resume.item) ? resume.item[0] : resume.item;
  }
  const conv = odj.convocationODJ;
  if (conv) {
    if (typeof conv === 'string') return conv;
    if (conv.item) return Array.isArray(conv.item) ? conv.item[0] : conv.item;
  }
  const pts = odj.pointsODJ;
  if (pts) {
    const pt = pts.pointODJ;
    if (pt) {
      const obj = Array.isArray(pt) ? pt[0] : pt;
      if (obj && obj.objet) return obj.objet;
    }
  }
  return null;
}

for (const entry of entries) {
  if (entry.entryName.endsWith('.json') && !entry.isDirectory) {
    try {
      const content = JSON.parse(entry.getData().toString('utf8'));
      const r = content?.reunion;
      if (!r) continue;

      // champ réel = timeStampDebut (S majuscule)
      const dateDebut = r.timeStampDebut || r.timestampDebut || r.calendrier?.dateDebut || null;
      if (!dateDebut) continue;

      const dateObj = new Date(dateDebut);
      if (isNaN(dateObj.getTime())) continue;
      if (dateObj < cutoff) continue;

      const xsiType = r['@xsi:type'] || r.xsiType || '';

      reunions.push({
        uid: r.uid,
        titre: getTitle(r),
        type: xsiType,
        dateDebut: dateObj.toISOString(),
        dateFin: r.timeStampFin ? new Date(r.timeStampFin).toISOString() : null,
        lieu: r.lieu?.libelleLong || r.lieu?.nomLieu || null,
        organisateur: r.organeReuniRef || r.organeRef || null,
      });
    } catch (e) {
      // skip
    }
  }
}

reunions.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));

const outDir = path.join('public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'agenda.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), reunions }, null, 2)
);

console.log(`✅ ${reunions.length} réunions écrites dans public/data/agenda.json`);
