// Construit les "Profils de circonscription" : pour chacune des 577
// circonscriptions législatives, un portrait socio-économique croisé avec les
// résultats des législatives 2024 et des "signaux d'influence" calculés
// automatiquement (comparaison à la moyenne nationale).
//
// Sorties :
//   public/data/circos/index.json          — synthèse des 577 circos
//   public/data/circos/<DEPT>-<NN>.json    — un fichier par circonscription
//
// Sources (open data, téléchargées avec cache local, voir SOURCES) :
//   - INSEE circo_composition.xlsx : composition officielle communes → circos
//   - INSEE indic-stat-circonscriptions-legislatives-2022.xlsx : population
//     légale 2019 par circo (sert à calibrer la répartition des 130 communes
//     fractionnées entre plusieurs circos, dont Paris/Lyon/Marseille)
//   - INSEE RP 2022 : base-cc-evol-struct-pop (population, âges, CSP) et
//     base-cc-emploi-pop-active (actifs, chômage, emplois par grand secteur)
//   - INSEE Filosofi 2021 : niveau de vie médian, taux de pauvreté (secret
//     statistique : valeurs absentes pour les petites communes, traitées
//     comme manquantes — jamais comme zéro)
//   - Ministère de l'Intérieur : résultats définitifs des législatives 2024
//     (1er et 2nd tours, par circonscription)
//
// Limites documentées (V1) :
//   - Communes fractionnées : répartition au prorata de la population estimée
//     de chaque fragment (population légale 2019 des circos INSEE, méthode
//     résiduelle). Approximation, part de population concernée ~9 %.
//   - Revenu médian / pauvreté par circo : moyenne des valeurs communales
//     pondérée par la population (estimation, pas un calcul sur fichier
//     fiscal exhaustif).
//   - Dénombrement SIRENE des établissements par secteur : reporté en V2
//     (pas de fichier communal léger ; la base complète fait plusieurs Go).
//     Les emplois par grand secteur du recensement portent le signal sectoriel.
//   - Les 11 circos des Français de l'étranger n'ont pas de données INSEE :
//     profil électoral uniquement.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'circos');
const CACHE = process.env.CIRCO_CACHE_DIR || path.join(ROOT, 'data-cache', 'circos');

const SOURCES = {
  composition: {
    file: 'circo_composition.xlsx',
    url: 'https://www.insee.fr/fr/statistiques/fichier/6436476/circo_composition.xlsx',
  },
  indicCirco: {
    file: 'indic-stat-circos-2022.xlsx',
    url: 'https://www.insee.fr/fr/statistiques/fichier/6436476/indic-stat-circonscriptions-legislatives-2022.xlsx',
  },
  pop: {
    file: 'evol-struct-pop.zip',
    url: 'https://www.insee.fr/fr/statistiques/fichier/8581696/base-cc-evol-struct-pop-2022_csv.zip',
    inner: 'base-cc-evol-struct-pop-2022.CSV',
  },
  emploi: {
    file: 'emploi-pop-active.zip',
    url: 'https://www.insee.fr/fr/statistiques/fichier/8581444/base-cc-emploi-pop-active-2022_csv.zip',
    inner: 'base-cc-emploi-pop-active-2022.CSV',
  },
  filosofi: {
    file: 'filosofi.zip',
    url: 'https://www.insee.fr/fr/statistiques/fichier/7756729/base-cc-filosofi-2021-geo2025_csv.zip',
    inner: 'DS_FILOSOFI_CC_data.csv',
  },
  legT1: {
    file: 'leg2024_t1_circos.csv',
    url: 'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/20240710-171413/resultats-definitifs-par-circonscriptions-legislatives.csv',
  },
  legT2: {
    file: 'leg2024_t2_circos.csv',
    url: 'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-2nd-tour/20240710-170728/resultats-definitifs-par-circonscription.csv',
  },
  mvtCommunes: {
    file: 'v_mvt_commune_2025.csv',
    url: 'https://www.insee.fr/fr/statistiques/fichier/8377162/v_mvt_commune_2025.csv',
  },
};

const MILLESIMES = {
  recensement: 'RP 2022 (Insee, géographie au 01/01/2025)',
  filosofi: 'Filosofi 2021 (Insee-DGFiP-Cnaf-Cnav-Ccmsa)',
  elections: 'Législatives 2024, résultats définitifs (Ministère de l\'Intérieur)',
  composition: 'Composition des circonscriptions (Insee, découpage 2010 en vigueur)',
};

// ---------------------------------------------------------------------------
// Utilitaires : téléchargement, CSV, XLSX
// ---------------------------------------------------------------------------

function log(...args) { console.log('[build-circos]', ...args); }

function download(src) {
  const dest = path.join(CACHE, src.file);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    log('cache OK :', src.file);
    return dest;
  }
  log('téléchargement :', src.url);
  execFileSync('curl', ['-sL', '--fail', '--retry', '3', '-o', dest, src.url], { stdio: 'inherit' });
  return dest;
}

// Extrait un fichier d'un zip vers le cache (via `unzip`, présent sur macOS
// et sur les runners GitHub Actions).
function unzipInner(zipPath, innerName) {
  const dest = path.join(CACHE, innerName);
  if (!fs.existsSync(dest)) {
    execFileSync('unzip', ['-o', '-q', zipPath, innerName, '-d', CACHE]);
  }
  return dest;
}

// Parseur CSV minimal (séparateur ; guillemets doubles, comme les fichiers
// INSEE / Intérieur). Retourne un tableau de tableaux de chaînes.
function parseCSV(text, sep = ';') {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === sep) { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Lit une feuille d'un .xlsx sans dépendance : dézippe les XML et les parse
// par expressions régulières (suffisant pour les fichiers plats de l'INSEE).
function readXlsxSheet(xlsxPath, sheetName) {
  const readEntry = (name) =>
    execFileSync('unzip', ['-p', xlsxPath, name], { maxBuffer: 256 * 1024 * 1024 }).toString('utf-8');
  const workbook = readEntry('xl/workbook.xml');
  const rels = readEntry('xl/_rels/workbook.xml.rels');
  const sheets = [...workbook.matchAll(/<sheet name="([^"]+)"[^>]*r:id="(rId\d+)"/g)];
  const sheet = sheets.find(([, n]) => n === sheetName);
  if (!sheet) throw new Error(`feuille "${sheetName}" absente de ${path.basename(xlsxPath)}`);
  const relMap = Object.fromEntries([...rels.matchAll(/Id="(rId\d+)"[^>]*Target="([^"]+)"/g)].map(m => [m[1], m[2]]));
  const target = relMap[sheet[2]].replace(/^\/?(xl\/)?/, 'xl/');

  let strings = [];
  try {
    const ss = readEntry('xl/sharedStrings.xml');
    strings = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m =>
      [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => decodeXml(t[1])).join(''));
  } catch { /* pas de sharedStrings */ }

  const xml = readEntry(target);
  const rows = [];
  for (const rm of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = {};
    for (const cm of rm[1].matchAll(/<c([^>]*?)\/?>(?:<v>([\s\S]*?)<\/v>)?(?:<\/c>)?/g)) {
      const ref = /r="([A-Z]+)\d+"/.exec(cm[1]);
      if (!ref) continue;
      const isStr = /t="s"/.test(cm[1]);
      const v = cm[2];
      cells[ref[1]] = isStr && v !== undefined ? strings[+v] : (v !== undefined ? decodeXml(v) : '');
    }
    rows.push(cells);
  }
  return rows;
}

function decodeXml(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
}

const num = (v) => {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(n) ? n : null;
};
const round1 = (v) => v === null ? null : Math.round(v * 10) / 10;

// ---------------------------------------------------------------------------
// Identifiants de circonscription
// Canonique : "<DEPT>-<NN>" — "01-04", "2A-01", "971-02", "ZZ-05".
// ---------------------------------------------------------------------------

// Le Ministère de l'Intérieur utilise ZX pour Saint-Barthélemy/Saint-Martin ;
// l'INSEE rattache ces communes à la circo 97801.
const DEPT_ALIAS = { ZX: '978' };

const pad2 = (n) => String(parseInt(n, 10)).padStart(2, '0');

// Décompose un code circo INSEE/Intérieur ("01004", "0101", "101", "2A01",
// "97101", "ZZ01") connaissant éventuellement le département. Les fichiers
// du Ministère n'ont pas de zéro initial ("1", "101") ; la composition INSEE
// contient quelques circos rattachées à un autre département que celui de la
// commune (le code fait alors foi, pas le département).
function circoId(dept, rawCode) {
  const code = String(rawCode).trim();
  let d = dept ? String(dept).trim() : '';
  d = DEPT_ALIAS[d] || d;
  if (/^\d$/.test(d)) d = '0' + d;                        // "1" → "01"
  if (d) {
    let rest = null;
    if (code.startsWith(d)) rest = code.slice(d.length);
    else if (/^\d/.test(d) && code.startsWith(String(parseInt(d, 10))))
      rest = code.slice(String(parseInt(d, 10)).length);  // "101" avec dept "1"
    else if (/^[A-Z]/.test(code) && /^\d+$/.test(code.replace(/^[A-Z]+/, '')))
      rest = code.replace(/^[A-Z]+/, '');                 // "ZX01" avec dept 978
    if (rest !== null && /^\d{1,3}$/.test(rest)) return `${d}-${pad2(rest)}`;
  }
  // Le code n'appartient pas au département indiqué : on le décode seul.
  let m = /^(2A|2B|ZZ|ZX)0*(\d{1,3})$/.exec(code);
  if (m) return `${DEPT_ALIAS[m[1]] || m[1]}-${pad2(m[2])}`;
  m = /^(97\d|98\d)(\d{1,2})$/.exec(code);
  if (m) return `${m[1]}-${pad2(m[2])}`;
  if (/^\d{5}$/.test(code)) return `${code.slice(0, 2)}-${pad2(code.slice(2))}`;
  if (/^\d{4}$/.test(code)) return `0${code[0]}-${pad2(code.slice(1))}`; // dept sans zéro initial
  throw new Error('code circo illisible : ' + code + ' (dept ' + dept + ')');
}

// ---------------------------------------------------------------------------
// 1. Composition des circonscriptions (communes → circos)
// ---------------------------------------------------------------------------

function loadComposition() {
  const file = download(SOURCES.composition);
  const communes = new Map();   // codeInsee → { nom, circos: [{ id, partiel }] }
  const circoMeta = new Map();  // id → { dept, deptNom, region }

  const add = (codeCommune, nomCommune, id, partiel, dept, deptNom, region) => {
    if (!communes.has(codeCommune)) communes.set(codeCommune, { nom: nomCommune, circos: [] });
    communes.get(codeCommune).circos.push({ id, partiel });
    if (!circoMeta.has(id)) circoMeta.set(id, { dept, deptNom, region });
  };

  for (const r of readXlsxSheet(file, 'table').slice(1)) {
    if (!r.E || !r.G) continue;
    const dept = r.A, id = circoId(dept, r.G);
    add(r.E, r.F, id, r.H !== 'entière', dept, r.B, r.D || '');
  }
  // Collectivités d'outre-mer (975, 977/978, 986, 987, 988)
  for (const r of readXlsxSheet(file, 'table COM').slice(1)) {
    if (!r.C || !r.E) continue;
    const dept = String(r.E).slice(0, 3);
    add(r.C, r.D, circoId(dept, r.E), (r.F || 'entière') !== 'entière', dept, r.B, 'Outre-mer');
  }
  log('composition :', communes.size, 'communes,', circoMeta.size, 'circonscriptions');
  return { communes, circoMeta };
}

// Population légale 2019 par circo (fichier "portraits" INSEE) — sert
// uniquement à calibrer les poids des communes fractionnées.
function loadPop19() {
  const file = download(SOURCES.indicCirco);
  const rows = readXlsxSheet(file, 'indicateurs_circonscriptions');
  const header = rows.find(r => Object.values(r).some(v => String(v).trim() === 'circo'));
  if (!header) throw new Error('en-tête introuvable dans indic-stat');
  const colCirco = Object.keys(header).find(k => String(header[k]).trim() === 'circo');
  const colPop = Object.keys(header).find(k => /pop_l[ée]gal_19/i.test(String(header[k])));
  const pop19 = new Map();
  for (const r of rows.slice(rows.indexOf(header) + 1)) {
    const code = String(r[colCirco] || '').trim();
    if (!/^\w{4,5}$/.test(code)) continue;
    const p = num(r[colPop]);
    if (p !== null) pop19.set(circoId(null, code), p);
  }
  log('pop légale 2019 :', pop19.size, 'circonscriptions');
  return pop19;
}

// ---------------------------------------------------------------------------
// 2. Bases communales INSEE
// ---------------------------------------------------------------------------

// CSP : nomenclature PCS 2020 du RP2022 (GSEC 11_21 = agriculteurs,
// 12_22 = artisans/commerçants, 13_23 = cadres, 14_24 = prof. intermédiaires,
// 15_25 = employés, 16_26 = ouvriers, 32 = retraités, 40 = autres inactifs).
const CSP_VARS = {
  agriculteurs: 'C22_POP15P_STAT_GSEC11_21',
  artisansCommercants: 'C22_POP15P_STAT_GSEC12_22',
  cadres: 'C22_POP15P_STAT_GSEC13_23',
  profIntermediaires: 'C22_POP15P_STAT_GSEC14_24',
  employes: 'C22_POP15P_STAT_GSEC15_25',
  ouvriers: 'C22_POP15P_STAT_GSEC16_26',
  retraites: 'C22_POP15P_STAT_GSEC32',
};
const POP_VARS = ['P22_POP', 'P22_POP0014', 'P22_POP1529', 'P22_POP3044', 'P22_POP4559',
  'P22_POP6074', 'P22_POP7589', 'P22_POP90P', 'C22_POP15P', ...Object.values(CSP_VARS)];
const EMP_VARS = ['P22_ACT1564', 'P22_CHOM1564', 'C22_EMPLT', 'C22_EMPLT_SAL',
  'C22_EMPLT_AGRI', 'C22_EMPLT_INDUS', 'C22_EMPLT_CONST', 'C22_EMPLT_CTS', 'C22_EMPLT_APESAS'];

function loadBase(src, vars) {
  const csvPath = unzipInner(download(src), src.inner);
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  const header = rows[0];
  const idx = { CODGEO: header.indexOf('CODGEO') };
  for (const v of vars) idx[v] = header.indexOf(v);
  const missing = vars.filter(v => idx[v] === -1);
  if (missing.length) log('ATTENTION variables absentes de', src.inner, ':', missing.join(', '));
  const map = new Map();
  for (const r of rows.slice(1)) {
    const code = r[idx.CODGEO];
    if (!code) continue;
    const o = {};
    for (const v of vars) o[v] = idx[v] === -1 ? null : num(r[idx[v]]);
    map.set(code, o);
  }
  log(src.inner, ':', map.size, 'communes');
  return map;
}

// Table des communes fusionnées (COG) : code ancien → code actuel, pour les
// communes de la composition (établie avant 2025) absentes des bases RP.
function loadFusions() {
  const csvPath = download(SOURCES.mvtCommunes);
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'), ',');
  const h = rows[0];
  const iMod = h.indexOf('MOD'), iTypAv = h.indexOf('TYPECOM_AV'), iComAv = h.indexOf('COM_AV'),
    iTypAp = h.indexOf('TYPECOM_AP'), iComAp = h.indexOf('COM_AP');
  const next = new Map();
  for (const r of rows.slice(1)) {
    // 32 = fusion (commune nouvelle), 41/50 = changement de code
    if (!['32', '41', '50'].includes(r[iMod])) continue;
    if (r[iTypAv] !== 'COM' || r[iTypAp] !== 'COM') continue;
    if (r[iComAv] && r[iComAp] && r[iComAv] !== r[iComAp]) next.set(r[iComAv], r[iComAp]);
  }
  const resolve = (code) => {
    let c = code, hops = 0;
    while (next.has(c) && hops++ < 5) c = next.get(c);
    return c;
  };
  log('COG : ', next.size, 'changements de code commune');
  return resolve;
}

function loadFilosofi() {
  const csvPath = unzipInner(download(SOURCES.filosofi), SOURCES.filosofi.inner);
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  const h = rows[0].map(s => s.replace(/"/g, ''));
  const iGeo = h.indexOf('GEO'), iObj = h.indexOf('GEO_OBJECT'),
    iMes = h.indexOf('FILOSOFI_MEASURE'), iVal = h.indexOf('OBS_VALUE');
  const map = new Map(); // code → { med, pauvrete }
  for (const r of rows.slice(1)) {
    if (r[iObj] !== 'COM') continue;
    const mes = r[iMes];
    if (mes !== 'MED_SL' && mes !== 'PR_MD60') continue;
    const v = num(r[iVal]);
    if (v === null) continue; // secret statistique → manquant, pas zéro
    const code = r[iGeo];
    if (!map.has(code)) map.set(code, {});
    map.get(code)[mes === 'MED_SL' ? 'med' : 'pauvrete'] = v;
  }
  log('Filosofi :', map.size, 'communes avec au moins un indicateur');
  return map;
}

// ---------------------------------------------------------------------------
// 3. Poids des communes fractionnées
// ---------------------------------------------------------------------------
// Méthode résiduelle : pour chaque circo, population 2019 INSEE moins la
// population des communes entières = population des fragments. Le poids d'un
// fragment est sa part du résidu, normalisée au sein de la commune. Si le
// calcul est impossible (résidus nuls), répartition égale (loggée).

function computeWeights(communes, popBase, pop19) {
  const residual = new Map();      // circoId → résidu
  const partialByCirco = new Map(); // circoId → [codes communes partielles]

  for (const [code, c] of communes) {
    const pop = popBase.get(code) ? popBase.get(code).P22_POP || 0 : 0;
    for (const { id, partiel } of c.circos) {
      if (partiel) {
        if (!partialByCirco.has(id)) partialByCirco.set(id, []);
        partialByCirco.get(id).push(code);
      } else {
        residual.set(id, (residual.get(id) ?? (pop19.get(id) || 0)) - pop);
      }
    }
  }
  for (const id of partialByCirco.keys()) {
    if (!residual.has(id)) residual.set(id, pop19.get(id) || 0);
  }

  const weights = new Map(); // `${commune}|${circo}` → poids [0..1]
  let fallbackEqual = 0;
  for (const [code, c] of communes) {
    const partials = c.circos.filter(x => x.partiel);
    for (const { id, partiel } of c.circos) {
      if (!partiel) { weights.set(`${code}|${id}`, 1); continue; }
      const popX = popBase.get(code) ? popBase.get(code).P22_POP || 0 : 0;
      // part du résidu de la circo attribuable à cette commune (si plusieurs
      // communes partielles se partagent la circo, prorata de leur population)
      const share = (cid) => {
        const others = partialByCirco.get(cid) || [code];
        const totPop = others.reduce((s, o) => s + (popBase.get(o) ? popBase.get(o).P22_POP || 0 : 0), 0);
        const res = Math.max(0, residual.get(cid) || 0);
        return totPop > 0 ? res * (popX / totPop) : res / others.length;
      };
      const raws = partials.map(x => share(x.id));
      const tot = raws.reduce((a, b) => a + b, 0);
      let w;
      if (tot > 0) w = share(id) / tot;
      else { w = 1 / partials.length; fallbackEqual++; }
      weights.set(`${code}|${id}`, w);
    }
  }
  if (fallbackEqual) log('poids : répartition égale faute de calibrage pour', fallbackEqual, 'fragments');
  return weights;
}

// ---------------------------------------------------------------------------
// 4. Élections législatives 2024
// ---------------------------------------------------------------------------

function parseElectionFile(csvPath) {
  const rows = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  const h = rows[0];
  const iDept = h.indexOf('Code département'), iDeptNom = h.indexOf('Libellé département'),
    iCode = h.findIndex(c => /Code circonscription/.test(c)),
    iLib = h.findIndex(c => /Libellé circonscription/.test(c)),
    iInscrits = h.indexOf('Inscrits'), iVotants = h.indexOf('Votants'),
    iExprimes = h.indexOf('Exprimés'), iBlancs = h.indexOf('Blancs'), iNuls = h.indexOf('Nuls');
  const firstCand = h.findIndex(c => /^Numéro de panneau 1$/.test(c));
  const CAND_W = 9; // panneau, nuance, nom, prénom, sexe, voix, %ins, %exp, élu

  const out = new Map();
  for (const r of rows.slice(1)) {
    if (!r[iCode] || !/\d/.test(r[iCode])) continue;
    let dept = r[iDept].trim();
    dept = DEPT_ALIAS[dept] || dept;
    const id = circoId(dept, r[iCode].trim().replace(/^ZX/, '978').replace(/^Z/, 'Z'));
    const candidats = [];
    for (let i = firstCand; i + 8 < r.length; i += CAND_W) {
      if (!r[i + 1] && !r[i + 2]) continue;
      const voix = num(r[i + 5]);
      if (voix === null) continue;
      candidats.push({
        nuance: r[i + 1] || '',
        nom: r[i + 2] || '',
        prenom: r[i + 3] || '',
        voix,
        pct: num(r[i + 7]), // % voix / exprimés
        elu: /élu/i.test(r[i + 8] || ''),
      });
    }
    candidats.sort((a, b) => b.voix - a.voix);
    out.set(id, {
      deptNom: r[iDeptNom],
      libelle: r[iLib],
      inscrits: num(r[iInscrits]),
      votants: num(r[iVotants]),
      exprimes: num(r[iExprimes]),
      blancs: num(r[iBlancs]),
      nuls: num(r[iNuls]),
      candidats,
    });
  }
  return out;
}

function buildElections() {
  const t1 = parseElectionFile(download(SOURCES.legT1));
  const t2 = parseElectionFile(download(SOURCES.legT2));
  const out = new Map();
  for (const [id, r1] of t1) {
    const r2 = t2.get(id);
    const eluT1 = r1.candidats.find(c => c.elu);
    const decisif = eluT1 ? r1 : r2;
    const tourDecisif = eluT1 ? 1 : 2;
    let elu = null, second = null, marge = null;
    if (decisif) {
      const cands = decisif.candidats;
      elu = cands.find(c => c.elu) || cands[0] || null;
      second = cands.filter(c => c !== elu)[0] || null;
      if (elu) marge = second ? round1((elu.pct ?? 0) - (second.pct ?? 0)) : 100;
    }
    const participation = (r) => r && r.inscrits ? round1(r.votants / r.inscrits * 100) : null;
    out.set(id, {
      deptNom: r1.deptNom,
      libelle: r1.libelle,
      tourDecisif,
      inscrits: r1.inscrits,
      participationT1: participation(r1),
      participationT2: participation(r2),
      elu: elu && { nom: elu.nom, prenom: elu.prenom, nuance: elu.nuance, voix: elu.voix, pct: elu.pct },
      second: second && { nom: second.nom, prenom: second.prenom, nuance: second.nuance, voix: second.voix, pct: second.pct },
      marge,
      // paysage du 1er tour : toutes les nuances, pour lire les rapports de force
      nuancesT1: r1.candidats.slice(0, 8).map(c => ({ nuance: c.nuance, nom: c.nom, prenom: c.prenom, voix: c.voix, pct: c.pct })),
    });
  }
  log('élections :', out.size, 'circonscriptions (T1),', t2.size, 'au 2nd tour');
  return out;
}

// ---------------------------------------------------------------------------
// 5. Agrégation communes → circonscriptions
// ---------------------------------------------------------------------------

const SECTEURS = [
  { key: 'agriculture', var: 'C22_EMPLT_AGRI', label: 'Agriculture', fem: true },
  { key: 'industrie', var: 'C22_EMPLT_INDUS', label: 'Industrie', fem: true },
  { key: 'construction', var: 'C22_EMPLT_CONST', label: 'Construction', fem: true },
  { key: 'commerceServices', var: 'C22_EMPLT_CTS', label: 'Commerce, transports, services', fem: false },
  { key: 'adminSanteSocial', var: 'C22_EMPLT_APESAS', label: 'Administration, enseignement, santé, social', fem: true },
];

function aggregate(communes, popBase, empBase, filosofi, weights, resolveFusion) {
  const acc = new Map();

  // 1. Plan d'allocation : code commune RP → [{ circo, poids, nomAffiche }].
  //    Les communes de la composition absentes du RP (fusionnées depuis) sont
  //    remappées via le COG ; les fragments d'une même commune nouvelle se
  //    partagent ses données à parts égales (approximation loggée).
  const alloc = new Map(); // rpCode → [{ id, w, nom, partiel }]
  const unresolved = [];
  const fusionGroups = new Map(); // rpCode → [{ oldCode, circos }]

  for (const [code, c] of communes) {
    if (popBase.has(code)) {
      const list = alloc.get(code) || [];
      for (const { id } of c.circos) {
        const w = weights.get(`${code}|${id}`) ?? 0;
        if (w > 0) list.push({ id, w, nom: c.nom, partiel: c.circos.length > 1 });
      }
      alloc.set(code, list);
    } else {
      const rp = resolveFusion(code);
      if (rp !== code && popBase.has(rp)) {
        if (!fusionGroups.has(rp)) fusionGroups.set(rp, []);
        fusionGroups.get(rp).push({ oldCode: code, c });
      } else unresolved.push(code);
    }
  }
  let fusionRemapped = 0;
  for (const [rp, frags] of fusionGroups) {
    const existing = alloc.get(rp) || [];
    const n = frags.length + (existing.length ? 1 : 0);
    const scaled = existing.map(x => ({ ...x, w: x.w / n }));
    for (const { oldCode, c } of frags) {
      fusionRemapped++;
      for (const { id } of c.circos) {
        const w = (weights.get(`${oldCode}|${id}`) ?? 0) / n;
        if (w > 0) scaled.push({ id, w, nom: c.nom, partiel: c.circos.length > 1 || n > 1 });
      }
    }
    alloc.set(rp, scaled);
  }

  // 2. Agrégation pondérée.
  const getAcc = (id) => {
    if (!acc.has(id)) acc.set(id, {
      vars: {}, medSum: 0, medPop: 0, pauvSum: 0, pauvPop: 0,
      pop: 0, nbCommunes: 0, communes: [],
    });
    return acc.get(id);
  };
  let popAllocated = 0;
  for (const [rpCode, list] of alloc) {
    const p = popBase.get(rpCode);
    const e = empBase.get(rpCode);
    const f = filosofi.get(rpCode);
    for (const { id, w, nom, partiel } of list) {
      const a = getAcc(id);
      const popW = (p.P22_POP || 0) * w;
      popAllocated += popW;
      a.pop += popW;
      a.nbCommunes++;
      a.communes.push({ code: rpCode, nom, pop: Math.round(popW), partiel });
      for (const v of POP_VARS) a.vars[v] = (a.vars[v] || 0) + (p[v] || 0) * w;
      if (e) for (const v of EMP_VARS) a.vars[v] = (a.vars[v] || 0) + (e[v] || 0) * w;
      if (f) {
        if (f.med !== undefined) { a.medSum += f.med * popW; a.medPop += popW; }
        if (f.pauvrete !== undefined) { a.pauvSum += f.pauvrete * popW; a.pauvPop += popW; }
      }
    }
  }

  // 3. Taux de couverture : population allouée / population France des bases
  //    RP (hors arrondissements municipaux, déjà portés par leur commune).
  const isArm = (code) => /^(751\d\d|6938\d|132\d\d)$/.test(code);
  let popFrance = 0;
  for (const [code, p] of popBase) if (!isArm(code)) popFrance += p.P22_POP || 0;
  const couverture = popFrance ? popAllocated / popFrance * 100 : 0;
  log(`agrégation : couverture ${couverture.toFixed(2)} % de la population RP ` +
    `(${Math.round(popAllocated).toLocaleString('fr-FR')} / ${Math.round(popFrance).toLocaleString('fr-FR')})`);
  log('communes fusionnées remappées via COG :', fusionRemapped);
  if (unresolved.length) {
    const depts = {};
    for (const c of unresolved) { const d = c.slice(0, c.startsWith('97') || c.startsWith('98') ? 3 : 2); depts[d] = (depts[d] || 0) + 1; }
    log('communes sans données RP (Mayotte et COM : pas de RP 2022) :', unresolved.length, JSON.stringify(depts));
  }
  if (couverture < 99) log('ATTENTION : couverture < 99 % (hors Mayotte/COM, vérifier les fusions)');
  return { acc, couverture: Math.round(couverture * 100) / 100 };
}

// ---------------------------------------------------------------------------
// 6. Moyennes nationales et signaux d'influence
// ---------------------------------------------------------------------------

function nationalReference(acc) {
  const tot = {};
  let medSum = 0, medPop = 0, pauvSum = 0, pauvPop = 0;
  for (const a of acc.values()) {
    for (const [k, v] of Object.entries(a.vars)) tot[k] = (tot[k] || 0) + v;
    medSum += a.medSum; medPop += a.medPop; pauvSum += a.pauvSum; pauvPop += a.pauvPop;
  }
  const secteurs = {};
  for (const s of SECTEURS) secteurs[s.key] = tot.C22_EMPLT ? (tot[s.var] || 0) / tot.C22_EMPLT * 100 : 0;
  return {
    pop: Math.round(tot.P22_POP || 0),
    tauxChomage: tot.P22_ACT1564 ? round1(tot.P22_CHOM1564 / tot.P22_ACT1564 * 100) : null,
    partSecteurs: Object.fromEntries(Object.entries(secteurs).map(([k, v]) => [k, round1(v)])),
    part60Plus: tot.P22_POP ? round1((tot.P22_POP6074 + tot.P22_POP7589 + tot.P22_POP90P) / tot.P22_POP * 100) : null,
    partMoins30: tot.P22_POP ? round1((tot.P22_POP0014 + tot.P22_POP1529) / tot.P22_POP * 100) : null,
    partCadres: tot.C22_POP15P ? round1((tot[CSP_VARS.cadres] || 0) / tot.C22_POP15P * 100) : null,
    partOuvriers: tot.C22_POP15P ? round1((tot[CSP_VARS.ouvriers] || 0) / tot.C22_POP15P * 100) : null,
    partAgriculteurs: tot.C22_POP15P ? round1((tot[CSP_VARS.agriculteurs] || 0) / tot.C22_POP15P * 100) : null,
    nivVieMedian: medPop ? Math.round(medSum / medPop) : null,
    tauxPauvrete: pauvPop ? round1(pauvSum / pauvPop) : null,
  };
}

function buildSignaux(profil, natl) {
  const s = [];
  const el = profil.elections;

  // — Signaux électoraux (sensibilité du siège) —
  if (el && el.marge !== null && el.marge !== undefined) {
    if (el.tourDecisif === 1) {
      s.push({
        type: 'electoral', force: 1,
        titre: 'Siège solide : élu dès le 1er tour',
        detail: `${el.elu ? el.elu.prenom + ' ' + el.elu.nom : 'Le député'} a été élu dès le premier tour avec ${el.elu && el.elu.pct != null ? el.elu.pct.toFixed(1).replace('.', ',') + ' % des exprimés' : 'une large avance'}. Position locale forte, moins sensible à la pression territoriale.`,
      });
    } else if (el.marge < 2) {
      s.push({
        type: 'electoral', force: 3,
        titre: `Siège ultra-disputé : ${String(el.marge).replace('.', ',')} pt d'écart au 2nd tour`,
        detail: `Élu avec seulement ${el.elu && el.elu.pct != null ? el.elu.pct.toFixed(1).replace('.', ',') : '—'} % contre ${el.second ? el.second.pct.toFixed(1).replace('.', ',') + ' % (' + el.second.nuance + ')' : '—'}. Très forte sensibilité attendue aux enjeux locaux et aux mobilisations de terrain.`,
      });
    } else if (el.marge < 5) {
      s.push({
        type: 'electoral', force: 3,
        titre: `Siège disputé : ${String(el.marge).replace('.', ',')} pts d'écart au 2nd tour`,
        detail: `Victoire courte face à ${el.second ? el.second.nuance : 'l\'opposition'}. Un argumentaire territorial chiffré a un fort impact sur un élu en situation de fragilité électorale.`,
      });
    } else if (el.marge < 10) {
      s.push({
        type: 'electoral', force: 2,
        titre: `Siège compétitif : ${String(el.marge).replace('.', ',')} pts d'écart au 2nd tour`,
        detail: 'Marge de victoire inférieure à 10 points : les enjeux d\'emploi et d\'activité locale pèsent dans les arbitrages du député.',
      });
    }
    if (el.participationT1 !== null && el.participationT1 < 60) {
      s.push({
        type: 'electoral', force: 1,
        titre: `Participation faible (${String(el.participationT1).replace('.', ',')} % au 1er tour)`,
        detail: 'Un corps électoral démobilisé : les relais d\'opinion locaux (associations, filières économiques) y ont un poids relatif accru.',
      });
    }
  }

  const sec = profil.emploi && profil.emploi.secteurs;
  if (sec) {
    for (const { key, label, fem } of SECTEURS) {
      const d = sec[key];
      if (!d || !d.emplois || !natl.partSecteurs[key]) continue;
      const ratio = d.part / natl.partSecteurs[key];
      if (ratio >= 1.4 && d.emplois >= 400) {
        s.push({
          type: 'economie', force: ratio >= 2 ? 3 : 2,
          titre: `${label} surreprésenté${fem ? 'e' : ''} : ${d.emplois.toLocaleString('fr-FR')} emplois (${ratio.toFixed(1).replace('.', ',')}× la moyenne nationale)`,
          detail: `Le secteur pèse ${d.part.toFixed(1).replace('.', ',')} % de l'emploi local contre ${natl.partSecteurs[key].toFixed(1).replace('.', ',')} % en France. Tout argument touchant à cette filière a une résonance territoriale directe.`,
        });
      }
    }
  }

  const emp = profil.emploi;
  if (emp && emp.tauxChomage !== null && natl.tauxChomage !== null) {
    const ecart = round1(emp.tauxChomage - natl.tauxChomage);
    if (ecart >= 2.5) {
      s.push({
        type: 'social', force: ecart >= 5 ? 3 : 2,
        titre: `Chômage élevé : ${String(emp.tauxChomage).replace('.', ',')} % (${ecart > 0 ? '+' : ''}${String(ecart).replace('.', ',')} pts vs national)`,
        detail: 'L\'emploi est l\'angle d\'attaque prioritaire : toute promesse d\'implantation, d\'investissement ou de maintien d\'activité est un levier puissant.',
      });
    } else if (ecart <= -2.5) {
      s.push({
        type: 'social', force: 1,
        titre: `Quasi plein-emploi : ${String(emp.tauxChomage).replace('.', ',')} % de chômage`,
        detail: 'Territoire en tension de main-d\'œuvre : les arguments porteront davantage sur l\'attractivité, le logement et les compétences que sur la création d\'emplois.',
      });
    }
  }

  const rev = profil.revenus;
  if (rev) {
    if (rev.tauxPauvrete !== null && natl.tauxPauvrete !== null && rev.tauxPauvrete - natl.tauxPauvrete >= 5) {
      s.push({
        type: 'social', force: rev.tauxPauvrete - natl.tauxPauvrete >= 10 ? 3 : 2,
        titre: `Pauvreté marquée : ${String(rev.tauxPauvrete).replace('.', ',')} % de taux de pauvreté`,
        detail: `Contre ${String(natl.tauxPauvrete).replace('.', ',')} % au niveau national. Les thématiques de pouvoir d'achat, de services publics et de cohésion sociale dominent l'agenda local.`,
      });
    }
    if (rev.nivVieMedian !== null && natl.nivVieMedian !== null) {
      if (rev.nivVieMedian >= natl.nivVieMedian * 1.15) {
        s.push({
          type: 'social', force: 1,
          titre: `Territoire aisé : niveau de vie médian de ${rev.nivVieMedian.toLocaleString('fr-FR')} €/an`,
          detail: `Soit ${Math.round((rev.nivVieMedian / natl.nivVieMedian - 1) * 100)} % au-dessus de la médiane nationale. Électorat sensible à la fiscalité, au patrimoine et au cadre de vie.`,
        });
      } else if (rev.nivVieMedian <= natl.nivVieMedian * 0.85) {
        s.push({
          type: 'social', force: 2,
          titre: `Revenus modestes : niveau de vie médian de ${rev.nivVieMedian.toLocaleString('fr-FR')} €/an`,
          detail: `Soit ${Math.round((1 - rev.nivVieMedian / natl.nivVieMedian) * 100)} % en dessous de la médiane nationale. Fort écho des arguments sur l'emploi local et le coût de la vie.`,
        });
      }
    }
  }

  const demo = profil.demographie;
  if (demo) {
    if (demo.part60Plus !== null && natl.part60Plus !== null && demo.part60Plus - natl.part60Plus >= 6) {
      s.push({
        type: 'demographie', force: 2,
        titre: `Population vieillissante : ${String(demo.part60Plus).replace('.', ',')} % de 60 ans ou plus`,
        detail: `Contre ${String(natl.part60Plus).replace('.', ',')} % au national. Santé, dépendance, présence médicale et services de proximité sont des angles porteurs.`,
      });
    }
    if (demo.partMoins30 !== null && natl.partMoins30 !== null && demo.partMoins30 - natl.partMoins30 >= 4) {
      s.push({
        type: 'demographie', force: 1,
        titre: `Population jeune : ${String(demo.partMoins30).replace('.', ',')} % de moins de 30 ans`,
        detail: `Contre ${String(natl.partMoins30).replace('.', ',')} % au national. Formation, premier emploi, logement des jeunes actifs : des thématiques à fort rendement local.`,
      });
    }
    const csp = demo.csp;
    if (csp) {
      const check = (part, ref, label, detail) => {
        if (part !== null && ref && part / ref >= 1.3) s.push({ type: 'demographie', force: 1, titre: label(part), detail });
      };
      check(csp.partAgriculteurs, natl.partAgriculteurs,
        p => `Poids agricole : ${String(p).replace('.', ',')} % d'agriculteurs exploitants (vs ${String(natl.partAgriculteurs).replace('.', ',')} % au national)`,
        'Le monde agricole structure la sociologie locale : filières, foncier et normes environnementales sont des sujets sensibles.');
      check(csp.partOuvriers, natl.partOuvriers,
        p => `Sociologie ouvrière : ${String(p).replace('.', ',')} % d'ouvriers (vs ${String(natl.partOuvriers).replace('.', ',')} % au national)`,
        'Emploi industriel, conditions de travail et pouvoir d\'achat dominent les préoccupations de l\'électorat.');
      check(csp.partCadres, natl.partCadres,
        p => `Profil cadres/CSP+ : ${String(p).replace('.', ',')} % de cadres (vs ${String(natl.partCadres).replace('.', ',')} % au national)`,
        'Électorat diplômé et urbain : innovation, transition écologique et attractivité économique sont les angles efficaces.');
    }
  }

  const force = { 3: 0, 2: 1, 1: 2 };
  s.sort((a, b) => force[b.force] === force[a.force] ? 0 : force[a.force] - force[b.force]);
  return s;
}

// ---------------------------------------------------------------------------
// 7. Assemblage et écriture
// ---------------------------------------------------------------------------

function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { communes, circoMeta } = loadComposition();
  const pop19 = loadPop19();
  const popBase = loadBase(SOURCES.pop, POP_VARS);
  const empBase = loadBase(SOURCES.emploi, EMP_VARS);
  const filosofi = loadFilosofi();
  const elections = buildElections();
  const resolveFusion = loadFusions();

  const weights = computeWeights(communes, popBase, pop19);
  const { acc, couverture } = aggregate(communes, popBase, empBase, filosofi, weights, resolveFusion);
  const natl = nationalReference(acc);
  log('référence nationale :', JSON.stringify(natl));

  const allIds = new Set([...circoMeta.keys(), ...elections.keys()]);
  const index = [];
  let written = 0;

  for (const id of [...allIds].sort()) {
    const meta = circoMeta.get(id) || {};
    const a = acc.get(id);
    const el = elections.get(id) || null;
    const [deptCode, numStr] = id.split('-');
    const numCirco = parseInt(numStr, 10);
    const deptNom = (el && el.deptNom) || meta.deptNom || deptCode;
    const nom = `${numCirco}${numCirco === 1 ? 're' : 'e'} circonscription — ${deptNom}`;

    const v = a ? a.vars : null;
    const pct = (n, d) => (v && d && v[d]) ? round1((v[n] || 0) / v[d] * 100) : null;

    const secteurs = {};
    if (v && v.C22_EMPLT) {
      for (const sdef of SECTEURS) {
        const emplois = Math.round(v[sdef.var] || 0);
        const part = round1((v[sdef.var] || 0) / v.C22_EMPLT * 100);
        secteurs[sdef.key] = {
          label: sdef.label, emplois, part,
          partNationale: natl.partSecteurs[sdef.key],
          ratio: natl.partSecteurs[sdef.key] ? round1(part / natl.partSecteurs[sdef.key]) : null,
        };
      }
    }

    const profil = {
      id,
      nom,
      dept: { code: deptCode, nom: deptNom },
      region: meta.region || null,
      numero: numCirco,
      updatedAt: new Date().toISOString().slice(0, 10),
      sources: MILLESIMES,
      demographie: a ? {
        pop: Math.round(a.pop),
        parAge: {
          moins15: pct('P22_POP0014', 'P22_POP'),
          de15a29: pct('P22_POP1529', 'P22_POP'),
          de30a44: pct('P22_POP3044', 'P22_POP'),
          de45a59: pct('P22_POP4559', 'P22_POP'),
          de60a74: pct('P22_POP6074', 'P22_POP'),
          plus75: v.P22_POP ? round1(((v.P22_POP7589 || 0) + (v.P22_POP90P || 0)) / v.P22_POP * 100) : null,
        },
        partMoins30: v.P22_POP ? round1(((v.P22_POP0014 || 0) + (v.P22_POP1529 || 0)) / v.P22_POP * 100) : null,
        part60Plus: v.P22_POP ? round1(((v.P22_POP6074 || 0) + (v.P22_POP7589 || 0) + (v.P22_POP90P || 0)) / v.P22_POP * 100) : null,
        csp: {
          partAgriculteurs: pct(CSP_VARS.agriculteurs, 'C22_POP15P'),
          partArtisansCommercants: pct(CSP_VARS.artisansCommercants, 'C22_POP15P'),
          partCadres: pct(CSP_VARS.cadres, 'C22_POP15P'),
          partProfIntermediaires: pct(CSP_VARS.profIntermediaires, 'C22_POP15P'),
          partEmployes: pct(CSP_VARS.employes, 'C22_POP15P'),
          partOuvriers: pct(CSP_VARS.ouvriers, 'C22_POP15P'),
          partRetraites: pct(CSP_VARS.retraites, 'C22_POP15P'),
        },
      } : null,
      emploi: a && v.C22_EMPLT ? {
        actifs: Math.round(v.P22_ACT1564 || 0),
        tauxChomage: pct('P22_CHOM1564', 'P22_ACT1564'),
        tauxChomageNational: natl.tauxChomage,
        emploisTotal: Math.round(v.C22_EMPLT || 0),
        partSalaries: pct('C22_EMPLT_SAL', 'C22_EMPLT'),
        secteurs,
      } : null,
      revenus: a && (a.medPop > 0 || a.pauvPop > 0) ? {
        nivVieMedian: a.medPop ? Math.round(a.medSum / a.medPop) : null,
        nivVieMedianNational: natl.nivVieMedian,
        tauxPauvrete: a.pauvPop ? round1(a.pauvSum / a.pauvPop) : null,
        tauxPauvreteNational: natl.tauxPauvrete,
        couverturePop: a.pop ? round1(Math.min(100, a.medPop / a.pop * 100)) : null,
        methode: 'Moyenne des indicateurs communaux pondérée par la population (estimation). Communes sous secret statistique exclues.',
      } : null,
      elections: el ? {
        tourDecisif: el.tourDecisif,
        inscrits: el.inscrits,
        participationT1: el.participationT1,
        participationT2: el.participationT2,
        elu: el.elu,
        second: el.second,
        marge: el.marge,
        nuancesT1: el.nuancesT1,
      } : null,
      communes: a ? {
        nb: a.nbCommunes,
        principales: a.communes.sort((x, y) => y.pop - x.pop).slice(0, 8),
        nbFractionnees: a.communes.filter(c => c.partiel).length,
      } : null,
      meta: {
        methodeFractionnees: 'Les communes réparties sur plusieurs circonscriptions sont ventilées au prorata de la population de chaque fragment (calibrage : populations légales 2019 des circonscriptions, Insee).',
        sirene: 'Dénombrement des établissements par secteur (SIRENE) : prévu en V2. Les volumes sectoriels affichés sont les emplois au lieu de travail du recensement.',
      },
    };

    profil.signaux = buildSignaux(profil, natl);

    fs.writeFileSync(path.join(OUT_DIR, id + '.json'), JSON.stringify(profil));
    written++;

    index.push({
      id,
      dept: deptCode,
      deptNom,
      numero: numCirco,
      nom,
      pop: profil.demographie ? profil.demographie.pop : null,
      tauxChomage: profil.emploi ? profil.emploi.tauxChomage : null,
      nivVieMedian: profil.revenus ? profil.revenus.nivVieMedian : null,
      marge: el ? el.marge : null,
      tourDecisif: el ? el.tourDecisif : null,
      eluNom: el && el.elu ? el.elu.prenom + ' ' + el.elu.nom : null,
      nuanceElu: el && el.elu ? el.elu.nuance : null,
      nbSignaux: profil.signaux.length,
      signauxForts: profil.signaux.filter(s => s.force === 3).length,
    });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify({
    updatedAt: new Date().toISOString().slice(0, 10),
    sources: MILLESIMES,
    couverturePop: couverture,
    national: natl,
    circos: index,
  }));

  log('écrit :', written, 'profils +', 'index.json', '→', OUT_DIR);

  // Contrôles finaux
  const sansSocio = index.filter(c => c.pop === null);
  log('circos sans données socio-éco (attendu : 11 Français de l\'étranger) :',
    sansSocio.length, sansSocio.map(c => c.id).join(' '));
  const sansElections = index.filter(c => !elections.get(c.id));
  if (sansElections.length) log('ATTENTION circos sans élections :', sansElections.map(c => c.id).join(' '));
  if (written < 570) throw new Error('nombre de circonscriptions anormalement bas : ' + written);
}

main();
