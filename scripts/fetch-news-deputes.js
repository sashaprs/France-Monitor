// Récupère les actualités récentes de chaque député via le flux RSS de Google
// Actualités (exécuté côté serveur dans GitHub Actions, donc sans contrainte
// CORS). Écrit public/data/news_deputes.json, lu en local par l'application.
//
// Même principe que scripts/fetch-news.js (personnalités), mais appliqué aux
// 577 députés listés dans public/data/deputes.json. Comme le volume de requêtes
// est élevé, on espace les appels et on tolère les échecs individuels (le député
// concerné affichera simplement « Aucune actualité »).

const fs = require('fs');
const path = require('path');

const MAX_ITEMS = 5;
const DELAY_MS = 550;            // pause entre deux requêtes (courtoisie / anti-429)
const UA = 'Mozilla/5.0 (compatible; NomosLabBot/1.0; +https://github.com/sashaprs/France-Monitor)';

function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '[^>]*>([\\s\\S]*?)</' + name + '>'));
  return m ? m[1] : '';
}

function formatDate(pubDate) {
  const d = new Date(pubDate);
  if (isNaN(d)) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getUTCFullYear()}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Récupère jusqu'à MAX_ITEMS actualités pour un député.
// `match` : au moins un de ces termes (normalisés) doit figurer dans le titre.
async function fetchDepute(dep, match, attempt = 0) {
  const q = encodeURIComponent(`"${dep.nomComplet}"`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=fr&gl=FR&ceid=FR:fr`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (res.status === 429 && attempt < 2) {
    await sleep(4000 * (attempt + 1));
    return fetchDepute(dep, match, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const news = [];
  for (const block of items) {
    const source = decodeEntities(tag(block, 'source'));
    let title = decodeEntities(tag(block, 'title'));
    if (source && title.endsWith(' - ' + source)) {
      title = title.slice(0, -(source.length + 3)).trim();
    } else {
      title = title.replace(/ - [^-]+$/, '').trim();
    }
    const link = decodeEntities(tag(block, 'link'));
    const pubDate = tag(block, 'pubDate').trim();
    if (!title || !link) continue;
    const nTitle = normalize(title);
    if (!match.some((m) => nTitle.includes(m))) continue;
    news.push({
      date: formatDate(pubDate),
      title,
      source: source || 'Google Actualités',
      link,
      ts: new Date(pubDate).getTime() || 0,
    });
  }

  news.sort((a, b) => b.ts - a.ts);
  const seen = new Set();
  const deduped = [];
  for (const n of news) {
    const key = n.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ date: n.date, title: n.title, source: n.source, link: n.link });
    if (deduped.length >= MAX_ITEMS) break;
  }
  return deduped;
}

// Termes de pertinence : le nom de famille (assez distinctif) ou, s'il est court
// et donc ambigu, le nom complet. Garantit que l'article concerne bien le député.
function matchTerms(dep) {
  const nom = normalize(dep.nom || '');
  const full = normalize(dep.nomComplet || '');
  if (nom.length >= 5) return [nom];
  return [full];
}

async function main() {
  const depFile = path.join('public', 'data', 'deputes.json');
  const { deputes = [] } = JSON.parse(fs.readFileSync(depFile, 'utf8'));

  const out = {};
  let ok = 0, empty = 0, fail = 0;
  for (let i = 0; i < deputes.length; i++) {
    const dep = deputes[i];
    try {
      const items = await fetchDepute(dep, matchTerms(dep));
      out[dep.id] = items;
      if (items.length) ok++; else empty++;
    } catch (e) {
      out[dep.id] = [];
      fail++;
      console.warn(`⚠️  ${dep.nomComplet} : ${e.message}`);
    }
    if ((i + 1) % 50 === 0) console.log(`… ${i + 1}/${deputes.length}`);
    await sleep(DELAY_MS);
  }

  const outDir = path.join('public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'news_deputes.json'),
    JSON.stringify({ updatedAt: new Date().toISOString(), news: out }, null, 0)
  );

  const total = Object.values(out).reduce((s, a) => s + a.length, 0);
  console.log(`\n✅ ${total} actualités (${ok} députés avec actus, ${empty} sans, ${fail} erreurs) → public/data/news_deputes.json`);
}

main();
