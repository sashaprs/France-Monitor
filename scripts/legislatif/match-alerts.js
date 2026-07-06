/* ============================================================================
   match-alerts.js — Rattachement des événements aux profils clients
   (moteur d'alertes, étape 2/3).

   Un événement matche un profil si :
   - son dossier_id figure dans profil.dossiers_suivis, OU
   - un des mots_cles du profil apparaît dans texte_matchable
     (insensible à la casse et aux accents) ;
   ET si son type figure dans profil.alertes.types.

   Le fichier d'événements est annoté en place (champ `profils` par événement,
   utilisé par notify.js et par la page « Alertes » du frontend) et l'index
   data/alertes/events/index.json est régénéré pour le frontend.

   Usage : node scripts/legislatif/match-alerts.js [--events <chemin>]
           (par défaut : le fichier d'événements le plus récent)
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const EVENTS_DIR = path.join(ROOT, 'data', 'alertes', 'events');
const CONFIG = path.join(ROOT, 'config', 'veille-profils.json');

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/\s+/g, ' ');
}

function dernierFichierEvents() {
  if (!fs.existsSync(EVENTS_DIR)) return null;
  const fichiers = fs.readdirSync(EVENTS_DIR).filter(f => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f)).sort();
  return fichiers.length ? path.join(EVENTS_DIR, fichiers[fichiers.length - 1]) : null;
}

function regenererIndex() {
  const fichiers = fs.readdirSync(EVENTS_DIR).filter(f => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f)).sort().reverse();
  /* L'index frontend ne garde que les 30 derniers lots. Les fichiers plus
     anciens restent dans le dépôt (historique) mais sortent de l'interface. */
  const lots = [];
  for (const f of fichiers.slice(0, 30)) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(EVENTS_DIR, f), 'utf8'));
      lots.push({
        fichier: f,
        genere_le: j.genere_le,
        nb_evenements: j.evenements.length,
        nb_matches: j.evenements.filter(e => e.profils && e.profils.length).length,
      });
    } catch { /* lot illisible : ignoré */ }
  }
  fs.writeFileSync(path.join(EVENTS_DIR, 'index.json'), JSON.stringify({ lots }, null, 1));
}

function main() {
  console.log('▶ match-alerts');

  const argIdx = process.argv.indexOf('--events');
  const fichier = argIdx > -1 ? path.resolve(process.argv[argIdx + 1]) : dernierFichierEvents();
  if (!fichier || !fs.existsSync(fichier)) {
    console.log('   aucun fichier d\'événements — rien à matcher');
    if (fs.existsSync(EVENTS_DIR)) regenererIndex();
    return;
  }

  const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  const profils = (config.profils || []).map(p => ({
    ...p,
    motsNorm: (p.mots_cles || []).map(normalize).filter(Boolean),
    dossiersSuivis: new Set(p.dossiers_suivis || []),
    types: new Set((p.alertes && p.alertes.types) || []),
  }));

  const lot = JSON.parse(fs.readFileSync(fichier, 'utf8'));
  let matches = 0;
  for (const e of lot.evenements) {
    const texte = normalize(e.texte_matchable);
    e.profils = profils
      .filter(p => p.types.has(e.type)
        && ((e.dossier_id && p.dossiersSuivis.has(e.dossier_id)) || p.motsNorm.some(m => texte.includes(m))))
      .map(p => p.id);
    if (e.profils.length) matches++;
  }

  fs.writeFileSync(fichier, JSON.stringify(lot, null, 1));
  regenererIndex();
  console.log(`   ${matches}/${lot.evenements.length} événements matchés (${profils.length} profil(s)) → ${path.basename(fichier)}`);
}

main();
