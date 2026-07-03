// Récupère les actualités récentes de chaque parti politique via le flux RSS de
// Google Actualités (exécuté côté serveur dans GitHub Actions, donc sans
// contrainte CORS). Écrit public/data/news_partis.json, lu par l'application.
//
// Même principe que scripts/fetch-news.js (personnalités). Comme certains noms
// de partis sont ambigus (« Renaissance », « Horizons »…), on cible la requête
// avec des termes de contexte et on filtre les titres par des termes obligatoires.

const fs = require('fs');
const path = require('path');

// `q` : requête envoyée à Google Actualités. `match` : au moins un de ces termes
// (normalisés, sans accent) doit figurer dans le titre pour retenir l'article.
const PARTIS = [
  { id: 're',    q: 'Renaissance parti Attal Macron',        match: ['renaissance'] },
  { id: 'rn',    q: '"Rassemblement National"',              match: ['rassemblement national', 'le rn', 'du rn'] },
  { id: 'lfi',   q: '"La France insoumise"',                 match: ['france insoumise', 'insoumis', 'lfi'] },
  { id: 'lr',    q: '"Les Républicains" parti Wauquiez',     match: ['republicains'] },
  { id: 'ps',    q: '"Parti socialiste" Faure',              match: ['parti socialiste', 'socialiste'] },
  { id: 'eco',   q: '"Les Écologistes" parti EELV',          match: ['ecologistes', 'eelv', 'ecologiste'] },
  { id: 'hor',   q: 'Horizons parti "Édouard Philippe"',     match: ['horizons'] },
  { id: 'modem', q: 'MoDem Bayrou "Mouvement démocrate"',    match: ['modem', 'mouvement democrate', 'democrate'] },
  { id: 'pcf',   q: '"Parti communiste français" Roussel',   match: ['communiste', 'pcf'] },
  { id: 'pp',    q: '"Place publique" Glucksmann',           match: ['place publique'] },
];

const MAX_ITEMS = 6;
const UA = 'Mozilla/5.0 (compatible; FranceMonitorBot/1.0; +https://github.com/sashaprs/France-Monitor)';

function normalize(str) {
  return (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
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

async function fetchParti(parti) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(parti.q)}&hl=fr&gl=FR&ceid=FR:fr`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
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
    if (!parti.match.some((m) => nTitle.includes(m))) continue;
    news.push({
      date: formatDate(pubDate), title,
      source: source || 'Google Actualités', link,
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

async function main() {
  const out = {};
  for (const parti of PARTIS) {
    try {
      out[parti.id] = await fetchParti(parti);
      console.log(`✅ ${parti.id} : ${out[parti.id].length} actualités`);
    } catch (e) {
      out[parti.id] = [];
      console.warn(`⚠️  ${parti.id} : ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  const outDir = path.join('public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'news_partis.json'),
    JSON.stringify({ updatedAt: new Date().toISOString(), news: out }, null, 0)
  );

  const total = Object.values(out).reduce((s, a) => s + a.length, 0);
  console.log(`\n✅ ${total} actualités → public/data/news_partis.json`);
}

main();
