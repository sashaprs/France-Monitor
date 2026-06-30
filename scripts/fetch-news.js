// Récupère les actualités récentes de chaque personnalité politique via le flux
// RSS de Google Actualités (exécuté côté serveur dans GitHub Actions, donc sans
// contrainte CORS). Écrit public/data/news_personnalites.json, lu en local par
// l'application (même origine → aucun proxy nécessaire, toujours à jour).

const fs = require('fs');
const path = require('path');

// `match` : termes (normalisés sans accent, en minuscules) dont AU MOINS UN doit
// figurer dans le titre de l'article pour qu'il soit retenu. Garantit que la news
// concerne bien la personnalité et non une autre du même cluster Google News.
const PERSOS = [
  { id: 'macron', name: 'Emmanuel Macron', match: ['macron'] },
  { id: 'lepen', name: 'Marine Le Pen', match: ['marine le pen', 'le pen'] },
  { id: 'melenchon', name: 'Jean-Luc Mélenchon', match: ['melenchon'] },
  { id: 'philippe', name: 'Édouard Philippe', match: ['edouard philippe'] },
  { id: 'bardella', name: 'Jordan Bardella', match: ['bardella'] },
  { id: 'bayrou', name: 'François Bayrou', match: ['bayrou'] },
  { id: 'faure', name: 'Olivier Faure', match: ['olivier faure', 'faure'] },
  { id: 'tondelier', name: 'Marine Tondelier', match: ['tondelier'] },
  { id: 'ciotti', name: 'Éric Ciotti', match: ['ciotti'] },
  { id: 'panot', name: 'Mathilde Panot', match: ['panot'] },
  { id: 'attal', name: 'Gabriel Attal', match: ['attal'] },
  { id: 'roussel', name: 'Fabien Roussel', match: ['fabien roussel', 'roussel'] },
  { id: 'glucksmann', name: 'Raphaël Glucksmann', match: ['glucksmann'] },
  { id: 'retailleau', name: 'Bruno Retailleau', match: ['retailleau'] },
  { id: 'vallaud', name: 'Boris Vallaud', match: ['vallaud'] },
  { id: 'jadot', name: 'Yannick Jadot', match: ['jadot'] },
  { id: 'wauquiez', name: 'Laurent Wauquiez', match: ['wauquiez'] },
  { id: 'sarkozy', name: 'Nicolas Sarkozy', match: ['sarkozy'] },
  { id: 'hollande', name: 'François Hollande', match: ['hollande'] },
  { id: 'bompard', name: 'Manuel Bompard', match: ['bompard'] },
];

function normalize(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const MAX_ITEMS = 6;
const UA = 'Mozilla/5.0 (compatible; FranceMonitorBot/1.0; +https://github.com/sashaprs/France-Monitor)';

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

async function fetchPerso(perso) {
  const q = encodeURIComponent(`"${perso.name}"`);
  const url = `https://news.google.com/rss/search?q=${q}&hl=fr&gl=FR&ceid=FR:fr`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
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
    // On ne retient que les titres mentionnant explicitement la personnalité.
    const nTitle = normalize(title);
    if (!perso.match.some((m) => nTitle.includes(m))) continue;
    news.push({
      date: formatDate(pubDate),
      title,
      source: source || 'Google Actualités',
      link,
      ts: new Date(pubDate).getTime() || 0,
    });
  }

  // Tri par date décroissante, déduplication par titre, on garde les plus récents.
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
  for (const perso of PERSOS) {
    try {
      out[perso.id] = await fetchPerso(perso);
      console.log(`✅ ${perso.name} : ${out[perso.id].length} actualités`);
    } catch (e) {
      out[perso.id] = [];
      console.warn(`⚠️  ${perso.name} : ${e.message}`);
    }
    // Petite pause pour rester courtois avec Google News.
    await new Promise((r) => setTimeout(r, 800));
  }

  const outDir = path.join('public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'news_personnalites.json'),
    JSON.stringify({ updatedAt: new Date().toISOString(), news: out }, null, 0)
  );

  const total = Object.values(out).reduce((s, a) => s + a.length, 0);
  console.log(`\n✅ ${total} actualités → public/data/news_personnalites.json`);
}

main();
