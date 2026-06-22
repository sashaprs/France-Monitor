const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

const zip = new AdmZip('agenda.zip');
const entries = zip.getEntries();

let reunions = [];
const now = new Date();
const cutoff = new Date(now);
cutoff.setDate(cutoff.getDate() - 7); // garder aussi 7 jours passés

for (const entry of entries) {
  if (entry.entryName.endsWith('.json') && !entry.isDirectory) {
    try {
      const content = JSON.parse(entry.getData().toString('utf8'));
      const r = content?.reunion;
      if (!r) continue;

      const dateDebut = r.timestampDebut || r.calendrier?.dateDebut || null;
      if (!dateDebut) continue;

      const dateObj = new Date(dateDebut);
      if (dateObj < cutoff) continue;

      reunions.push({
        uid: r.uid,
        titre: r.objet?.libelle || r.objet || null,
        type: r.xsiType || null,
        dateDebut: dateDebut,
        dateFin: r.timestampFin || r.calendrier?.dateFin || null,
        lieu: r.lieu?.nomLieu || null,
        organisateur: r.organeRef || null,
      });
    } catch (e) {
      // skip
    }
  }
}

// Trier par date croissante
reunions.sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));

const outDir = path.join('public', 'data');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'agenda.json'),
  JSON.stringify({ updatedAt: new Date().toISOString(), reunions }, null, 2)
);

console.log(`✅ ${reunions.length} réunions écrites dans public/data/agenda.json`);
