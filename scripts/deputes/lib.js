/* ============================================================================
   Utilitaires partagés des scripts "Fiches députés".

   Conventions :
   - Les ZIP open data de l'AN sont téléchargés dans tmp/ (jamais commités,
     voir .gitignore). Un ZIP déjà présent est réutilisé tel quel : en local
     on évite de re-télécharger, en CI le dossier tmp/ est vide donc tout est
     téléchargé à chaque exécution.
   - Chaque script build-*.js écrit un JSON intermédiaire dans tmp/build/,
     assemble-fiches.js fusionne le tout vers public/data/deputes/.
   - Les identifiants députés sont stockés SANS le préfixe "PA" pour rester
     compatibles avec deputes.json / news_deputes.json / public/photos/.
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const AdmZip = require('adm-zip');

const ROOT = path.join(__dirname, '..', '..');
const TMP = path.join(ROOT, 'tmp');
const BUILD = path.join(TMP, 'build');
const OUT = path.join(ROOT, 'public', 'data', 'deputes');

const LEGISLATURE = '17';
const AN_BASE = `https://data.assemblee-nationale.fr/static/openData/repository/${LEGISLATURE}`;

const SOURCES = {
  amo: `${AN_BASE}/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip`,
  scrutins: `${AN_BASE}/loi/scrutins/Scrutins.json.zip`,
  amendements: `${AN_BASE}/loi/amendements_div_legis/Amendements.json.zip`,
  dossiers: `${AN_BASE}/loi/dossiers_legislatifs/Dossiers_Legislatifs.json.zip`,
  qe: `${AN_BASE}/questions/questions_ecrites/Questions_ecrites.json.zip`,
  qosd: `${AN_BASE}/questions/questions_orales_sans_debat/Questions_orales_sans_debat.json.zip`,
  qg: `${AN_BASE}/questions/questions_gouvernement/Questions_gouvernement.json.zip`,
  agenda: `${AN_BASE}/vp/reunions/Agenda.json.zip`,
};

function ensureDirs() {
  fs.mkdirSync(TMP, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });
}

/* Téléchargement en streaming via curl (pas de buffer intégral en mémoire),
   avec cache : si le fichier existe déjà dans tmp/, on le réutilise. */
function download(sourceKey) {
  ensureDirs();
  const url = SOURCES[sourceKey];
  const dest = path.join(TMP, path.basename(url).replace(/\.json\.zip$/, '.zip').replace(/^AMO10_.*$/, 'AMO10.zip'));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`   ↳ cache : ${path.basename(dest)} (${(fs.statSync(dest).size / 1e6).toFixed(1)} Mo)`);
    return dest;
  }
  console.log(`   ↳ téléchargement : ${url}`);
  execFileSync('curl', ['-sSfL', '--retry', '3', '--retry-delay', '5', url, '-o', dest + '.part'], { stdio: 'inherit' });
  fs.renameSync(dest + '.part', dest);
  console.log(`   ↳ ok : ${(fs.statSync(dest).size / 1e6).toFixed(1)} Mo`);
  return dest;
}

/* Itère sur les entrées JSON d'un ZIP (décompression entrée par entrée). */
function* zipEntries(zipPath, filterFn) {
  const zip = new AdmZip(zipPath);
  for (const entry of zip.getEntries()) {
    if (entry.isDirectory || !entry.entryName.endsWith('.json')) continue;
    if (filterFn && !filterFn(entry.entryName)) continue;
    let parsed;
    try {
      parsed = JSON.parse(entry.getData().toString('utf8'));
    } catch (e) {
      continue; // fichier malformé : ignoré
    }
    yield { name: entry.entryName, json: parsed };
  }
}

function toArr(v) {
  if (v === null || v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/* Les champs "vides" des exports AN sont des objets {} ou {"@xsi:nil":"true"}. */
function val(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object') {
    if (v['#text'] !== undefined) return v['#text'];
    if (Array.isArray(v)) return v.length ? v : null;
    return Object.keys(v).some(k => !k.startsWith('@')) ? v : null;
  }
  return v;
}

function stripPA(ref) {
  return ref ? String(ref).replace(/^PA/, '') : null;
}

function writeBuild(name, data) {
  ensureDirs();
  const p = path.join(BUILD, name);
  fs.writeFileSync(p, JSON.stringify(data));
  console.log(`   ↳ écrit : tmp/build/${name} (${(fs.statSync(p).size / 1e6).toFixed(2)} Mo)`);
}

function readBuild(name) {
  const p = path.join(BUILD, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/* Décode les entités HTML fréquentes dans les libellés AN. */
function decodeEntities(s) {
  if (!s) return s;
  return String(s)
    .replace(/&#x?([0-9a-fA-F]+);/g, (m, code) => {
      try { return String.fromCodePoint(parseInt(code, m.includes('x') || m.includes('X') ? 16 : 10)); }
      catch { return m; }
    })
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s;
}

module.exports = {
  ROOT, TMP, BUILD, OUT, LEGISLATURE, SOURCES,
  ensureDirs, download, zipEntries, toArr, val, stripPA,
  writeBuild, readBuild, decodeEntities, truncate,
};
