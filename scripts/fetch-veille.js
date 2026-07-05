// Récupère les actualités générales par rubrique via les flux RSS de Google
// Actualités (exécuté côté serveur dans GitHub Actions, donc sans contrainte
// CORS). Écrit public/data/veille_generale.json, lu par le module « Veille
// médiatique » de l'application.
//
// Même principe que scripts/fetch-news.js (personnalités). Chaque rubrique est
// soit un flux thématique officiel de Google News (`topic`), soit une recherche
// (`q`), soit le flux « À la une » France (`feed`).

const fs = require('fs');
const path = require('path');

const RUBRIQUES = [
  { id: 'une',           label: 'À la une',        feed: 'https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr' },
  { id: 'politique',     label: 'Politique',       q: 'politique France gouvernement Assemblée' },
  { id: 'economie',      label: 'Économie',        topic: 'BUSINESS' },
  { id: 'international', label: 'International',   topic: 'WORLD' },
  { id: 'ecologie',      label: 'Écologie',        q: 'écologie OR climat OR "transition énergétique" France' },
  { id: 'societe',       label: 'Société',         topic: 'NATION' },
  { id: 'sante',         label: 'Santé',           topic: 'HEALTH' },
  { id: 'tech',          label: 'Tech & Sciences', topic: 'TECHNOLOGY' },
];

const MAX_ITEMS = 12;
const UA = 'Mozilla/5.0 (compatible; NomosLabBot/1.0; +https://github.com/sashaprs/France-Monitor)';

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

function rubriqueUrl(r) {
  if (r.feed) return r.feed;
  if (r.topic) return `https://news.google.com/rss/headlines/section/topic/${r.topic}?hl=fr&gl=FR&ceid=FR:fr`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(r.q)}&hl=fr&gl=FR&ceid=FR:fr`;
}

async function fetchRubrique(rubrique) {
  const res = await fetch(rubriqueUrl(rubrique), { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();

  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const news = [];
  for (const block of items) {
    const source = decodeEntities(tag(block, 'source'));
    let title = decodeEntities(tag(block, 'title'));
    // Google News suffixe le titre par " - <source>" ; on retire le doublon.
    if (source && title.endsWith(' - ' + source)) {
      title = title.slice(0, -(source.length + 3)).trim();
    } else {
      title = title.replace(/ - [^-]+$/, '').trim();
    }
    const link = decodeEntities(tag(block, 'link'));
    const pubDate = tag(block, 'pubDate').trim();
    if (!title || !link) continue;
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
    deduped.push(n);
    if (deduped.length >= MAX_ITEMS) break;
  }
  return deduped;
}

async function main() {
  const out = {};
  for (const rubrique of RUBRIQUES) {
    try {
      out[rubrique.id] = await fetchRubrique(rubrique);
      console.log(`✅ ${rubrique.label} : ${out[rubrique.id].length} actualités`);
    } catch (e) {
      out[rubrique.id] = [];
      console.warn(`⚠️  ${rubrique.label} : ${e.message}`);
    }
    // Petite pause pour rester courtois avec Google News.
    await new Promise((r) => setTimeout(r, 800));
  }

  const outDir = path.join('public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'veille_generale.json'),
    JSON.stringify({ updatedAt: new Date().toISOString(), rubriques: out }, null, 0)
  );

  const total = Object.values(out).reduce((s, a) => s + a.length, 0);
  console.log(`\n✅ ${total} actualités → public/data/veille_generale.json`);
}

main();
