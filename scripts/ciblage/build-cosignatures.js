/* ============================================================================
   build-cosignatures.js — Réseau de cosignatures + index de recherche
   d'amendements (module Ciblage, parties C et E).

   L'export Amendements (~300 Mo zippé) n'est parcouru qu'UNE fois pour
   produire :

   1. public/data/ciblage/amendements-recherche.json  (cartographie, mot-clé)
      { textes: [...], deputes: { id: [idxTexte, ...] } }
      - texte = exposé sommaire (sinon dispositif) nettoyé du HTML et
        tronqué à 150 caractères ; les 200 amendements les plus récents
        par auteur.
      - les amendements identiques déposés en masse par un groupe partagent
        exactement le même exposé : les textes sont dédupliqués et référencés
        par index, ce qui divise le poids par ~3.

   2. public/data/ciblage/reseau-cosignatures.json  (onglet Réseau, < 500 Ko)
      { seuil, noeuds: [{ id, nom, g }], liens: [[iA, iB, poids]] }
      - une paire = deux députés signataires du même amendement (auteur ou
        cosignataire) ; seules les paires avec ≥ SEUIL_LIENS amendements
        communs sont conservées.

   3. tmp/build/top-cosignataires.json  (encart "Travaille avec" des fiches)
      { deputes: { id: [{ id, nom, groupe, nb, hors_groupe? }] } } — top 15,
      hors_groupe = true quand le partenaire n'est pas du groupe actuel du
      député (les ponts trans-groupes sont l'info stratégique).

   Prérequis : public/data/ciblage/index.json (noms/groupes des députés).
   Usage : node --max-old-space-size=6144 scripts/ciblage/build-cosignatures.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, LEGISLATURE, download, zipEntries, toArr, val, stripPA, writeBuild, readBuild, decodeEntities, truncate } = require('../deputes/lib');

const OUT_DIR = path.join(ROOT, 'public', 'data', 'ciblage');
const MAX_TEXTES_PAR_DEPUTE = 200;
const TEXTE_MAX = 150;
const SEUIL_LIENS = 10;   // paires < 10 amendements communs exclues du graphe
const TOP_COSIGNATAIRES = 15;

/* Exposé sommaire → texte de recherche : sans HTML, entités décodées. */
function nettoie(html) {
  if (!html || typeof html !== 'string') return null;
  const txt = decodeEntities(html.replace(/<[^>]*>/g, ' '));
  return txt ? truncate(txt, TEXTE_MAX) : null;
}

function main() {
  console.log('▶ build-cosignatures');

  const index = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'index.json'), 'utf8'));
  const infos = {}; // id → { nom, groupe }
  for (const d of index.deputes) infos[d.id] = { nom: d.prenom + ' ' + d.nom, groupe: d.groupe };

  /* ── Passe unique sur l'export ──────────────────────────────────────── */
  const zipPath = download('amendements');

  const textes = [];            // textes dédupliqués
  const texteIdx = new Map();   // texte → index
  const parAuteur = {};         // id → [[idxTexte, date], ...]
  const paires = new Map();     // min*1e6+max → nb d'amendements communs
  let total = 0;

  for (const { json } of zipEntries(zipPath)) {
    const am = json.amendement;
    if (!am || String(am.legislature) !== LEGISLATURE) continue;

    const sig = am.signataires || {};
    const auteur = sig.auteur || {};
    if (val(auteur.typeAuteur) !== 'Député') continue;
    const auteurId = stripPA(val(auteur.acteurRef));
    if (!auteurId) continue;
    total++;

    /* Index de recherche (auteur uniquement : "a déposé"). */
    const corps = (am.corps && am.corps.contenuAuteur) || {};
    const texte = nettoie(val(corps.exposeSommaire)) || nettoie(val(corps.dispositif));
    if (texte) {
      let ti = texteIdx.get(texte);
      if (ti === undefined) { ti = textes.length; textes.push(texte); texteIdx.set(texte, ti); }
      (parAuteur[auteurId] = parAuteur[auteurId] || []).push([ti, val(am.cycleDeVie && am.cycleDeVie.dateDepot) || '']);
    }

    /* Paires de signataires (auteur + cosignataires, dédupliqués). */
    const ids = [...new Set([auteurId, ...toArr(sig.cosignataires && sig.cosignataires.acteurRef)
      .map(r => stripPA(val(r))).filter(Boolean)])]
      .map(Number).filter(n => n > 0).sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const k = ids[i] * 1e6 + ids[j];
        paires.set(k, (paires.get(k) || 0) + 1);
      }
    }
  }
  console.log(`   ${total} amendements (législature ${LEGISLATURE}), ${textes.length} textes uniques, ${paires.size} paires`);

  /* ── 1. amendements-recherche.json ──────────────────────────────────── */
  const deputes = {};
  for (const [id, liste] of Object.entries(parAuteur)) {
    if (!infos[id]) continue; // ex-députés : inutiles pour la cartographie
    liste.sort((a, b) => b[1].localeCompare(a[1]));
    deputes[id] = liste.slice(0, MAX_TEXTES_PAR_DEPUTE).map(x => x[0]);
  }
  /* Ne garder que les textes encore référencés, en réindexant. */
  const garde = new Map();
  for (const l of Object.values(deputes)) for (const t of l) if (!garde.has(t)) garde.set(t, garde.size);
  const textesFinaux = new Array(garde.size);
  for (const [ancien, nouveau] of garde) textesFinaux[nouveau] = textes[ancien];
  for (const l of Object.values(deputes)) for (let i = 0; i < l.length; i++) l[i] = garde.get(l[i]);

  const pRech = path.join(OUT_DIR, 'amendements-recherche.json');
  fs.writeFileSync(pRech, JSON.stringify({ updatedAt: new Date().toISOString(), textes: textesFinaux, deputes }));
  console.log(`   ↳ amendements-recherche.json : ${(fs.statSync(pRech).size / 1e6).toFixed(2)} Mo (${textesFinaux.length} textes, ${Object.keys(deputes).length} députés)`);

  /* ── 2. reseau-cosignatures.json (graphe filtré) ────────────────────── */
  const liensBruts = [];
  for (const [k, w] of paires) {
    if (w < SEUIL_LIENS) continue;
    const a = String(Math.floor(k / 1e6)), b = String(k % 1e6);
    if (infos[a] && infos[b]) liensBruts.push([a, b, w]);
  }
  const noeudsIds = [...new Set(liensBruts.flatMap(l => [l[0], l[1]]))];
  const noeudIdx = new Map(noeudsIds.map((id, i) => [id, i]));
  const reseau = {
    updatedAt: new Date().toISOString(),
    seuil: SEUIL_LIENS,
    noeuds: noeudsIds.map(id => ({ id, nom: infos[id].nom, g: infos[id].groupe })),
    liens: liensBruts.map(([a, b, w]) => [noeudIdx.get(a), noeudIdx.get(b), w]),
  };
  const pReseau = path.join(OUT_DIR, 'reseau-cosignatures.json');
  fs.writeFileSync(pReseau, JSON.stringify(reseau));
  const koReseau = fs.statSync(pReseau).size / 1e3;
  console.log(`   ↳ reseau-cosignatures.json : ${koReseau.toFixed(0)} Ko (${reseau.noeuds.length} nœuds, ${reseau.liens.length} liens ≥ ${SEUIL_LIENS})${koReseau > 500 ? '  ⚠ > 500 Ko !' : ''}`);

  /* ── 3. top-cosignataires.json (pour les fiches députés) ────────────── */
  const partenaires = {}; // id → [{ id, nb }]
  for (const [k, w] of paires) {
    const a = String(Math.floor(k / 1e6)), b = String(k % 1e6);
    if (!infos[a] || !infos[b]) continue;
    (partenaires[a] = partenaires[a] || []).push({ id: b, nb: w });
    (partenaires[b] = partenaires[b] || []).push({ id: a, nb: w });
  }
  /* On garde une marge : 40 premiers partenaires + 10 meilleurs hors groupe
     (dans les groupes qui cosignent en masse, le top 40 est entièrement
     intra-groupe : sans ce complément, l'injection 12 + 3 des fiches ne
     trouverait jamais de pont trans-groupe à afficher). */
  const top = {};
  for (const [id, liste] of Object.entries(partenaires)) {
    liste.sort((x, y) => y.nb - x.nb);
    const enrichi = (p) => ({
      id: p.id,
      nom: infos[p.id].nom,
      groupe: infos[p.id].groupe,
      nb: p.nb,
      ...(infos[p.id].groupe !== infos[id].groupe ? { hors_groupe: true } : {}),
    });
    const premiers = liste.slice(0, 40);
    const dedans = new Set(premiers.map(p => p.id));
    const horsGroupe = liste.filter(p => infos[p.id].groupe !== infos[id].groupe && !dedans.has(p.id)).slice(0, 10);
    top[id] = [...premiers, ...horsGroupe].map(enrichi);
  }
  writeBuild('top-cosignataires.json', { updatedAt: new Date().toISOString(), deputes: top });

  injecterFiches();
  console.log('✅ build-cosignatures terminé');
}

/* Ajoute "top_cosignataires" dans chaque fiche publique PAxxxxxx.json
   (les fiches sont déjà assemblées quand ce script tourne — le champ est
   remplacé à chaque exécution, l'opération est idempotente). */
function injecterFiches() {
  const top = readBuild('top-cosignataires.json');
  if (!top) { console.log('   ⚠ tmp/build/top-cosignataires.json absent : fiches non enrichies'); return; }
  const dir = path.join(ROOT, 'public', 'data', 'deputes');
  let n = 0;
  for (const [id, liste] of Object.entries(top.deputes)) {
    const p = path.join(dir, 'PA' + id + '.json');
    if (!fs.existsSync(p)) continue;
    /* 12 premiers + 3 meilleurs hors groupe : sans ce quota, les
       cosignatures de masse intra-groupe évincent tous les ponts
       trans-groupes, qui sont l'information stratégique. */
    const principal = liste.slice(0, TOP_COSIGNATAIRES - 3);
    const dejaLa = new Set(principal.map(x => x.id));
    const horsGroupe = liste.filter(x => x.hors_groupe && !dejaLa.has(x.id)).slice(0, 3);
    const fiche = JSON.parse(fs.readFileSync(p, 'utf8'));
    fiche.top_cosignataires = [...principal, ...horsGroupe];
    fs.writeFileSync(p, JSON.stringify(fiche));
    n++;
  }
  console.log(`   ${n} fiches députés enrichies de top_cosignataires (12 + 3 hors groupe)`);
}

if (require.main === module) {
  try {
    /* --fiches : ré-injecte les tops dans les fiches sans reparser l'export. */
    if (process.argv.includes('--fiches')) { injecterFiches(); }
    else main();
  } catch (e) { console.error('❌ build-cosignatures :', e.message); process.exit(1); }
}
module.exports = { main, injecterFiches };
