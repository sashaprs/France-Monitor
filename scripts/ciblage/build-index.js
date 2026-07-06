/* ============================================================================
   build-index.js — Index de ciblage multi-critères (module "Ciblage").

   Fusionne les données déjà produites par le pipeline (fiches députés +
   profils de circonscription) en un index unique chargé une seule fois par
   le frontend. Toute la recherche multi-critères se fait côté client sur ce
   fichier ; seul le filtre "position sur un scrutin" charge un shard de
   positions à la demande.

   Sorties :
   - public/data/ciblage/index.json          (< 700 Ko, un objet par député)
   - public/data/ciblage/scrutins-index.json (tous les scrutins, sans les
                                              positions individuelles)
   - public/data/ciblage/positions/<NN>.json (positions nominatives shardées
       par centaine : NN = floor(numero/100). Un fichier par scrutin aurait
       créé ~8 000 petits fichiers dans le repo — trop lourd pour git et
       pour le dossier iCloud. Les absents ne sont PAS stockés : côté client,
       absent = député présent dans l'index mais dans aucune liste.)

   Prérequis : assemble-fiches.js (fiches députés) et build-circos.js déjà
   exécutés. Lit aussi AMO10 (e-mail AN pour l'export CSV) et l'export
   Scrutins — tous deux en cache dans tmp/ après build-all.js.

   Usage : node scripts/ciblage/build-index.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { ROOT, download, zipEntries, toArr, val, stripPA, decodeEntities, truncate } = require('../deputes/lib');

const DEPUTES_DIR = path.join(ROOT, 'public', 'data', 'deputes');
const CIRCOS_DIR = path.join(ROOT, 'public', 'data', 'circos');
const OUT_DIR = path.join(ROOT, 'public', 'data', 'ciblage');

const TITRE_MAX = 140; // troncature des titres de scrutins (poids de scrutins-index)

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const round1 = (x) => (x === null || x === undefined || isNaN(x)) ? null : Math.round(x * 10) / 10;

function writeOut(rel, data) {
  const p = path.join(OUT_DIR, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data));
  return fs.statSync(p).size;
}

/* ── E-mails AN (AMO10) : pour l'export CSV de la page Ciblage ──────────── */
function buildEmails() {
  const emails = {};
  const zipPath = download('amo');
  for (const { json } of zipEntries(zipPath, n => n.includes('/acteur/'))) {
    const a = json.acteur;
    if (!a) continue;
    const id = stripPA(a.uid && (a.uid['#text'] || a.uid));
    if (!id) continue;
    for (const ad of toArr(a.adresses && a.adresses.adresse)) {
      const mel = val(ad.valElec);
      if (mel && String(mel).includes('@assemblee-nationale.fr')) { emails[id] = mel; break; }
    }
  }
  console.log(`   ${Object.keys(emails).length} e-mails AN résolus`);
  return emails;
}

/* ── Index député : fiches + circos + e-mails + groupes d'études ────────── */
function buildDeputesIndex(emails) {
  const base = readJson(path.join(DEPUTES_DIR, 'index.json'));

  // Groupes d'études (produit par build-groupes-etudes.js, optionnel :
  // l'index reste utilisable si le fichier n'existe pas encore).
  const gePath = path.join(OUT_DIR, 'groupes-etudes.json');
  const geParDepute = {}; // id député → [{ id: POxxx, f: fonction abrégée }]
  if (fs.existsSync(gePath)) {
    for (const g of readJson(gePath).groupes) {
      for (const m of g.membres) {
        (geParDepute[m.id] = geParDepute[m.id] || []).push({ id: g.id, f: m.f });
      }
    }
  }

  const groupes = {}; // sigle → { nom, couleur } (table de correspondance, évite 577 répétitions)
  const deputes = [];
  let sansCirco = 0, sansFiche = 0;

  for (const d of base.deputes) {
    let fiche = null;
    try { fiche = readJson(path.join(DEPUTES_DIR, `PA${d.id}.json`)); }
    catch { sansFiche++; }

    const mandat = fiche ? fiche.mandat : null;
    const stats = fiche ? fiche.stats : {};
    const g = (mandat && mandat.groupe) || d.groupe || {};
    const sigle = g.short || 'NI';
    if (!groupes[sigle]) groupes[sigle] = { nom: g.name || sigle, couleur: g.color || '#888' };

    // Jointure circonscription : "33" + "4" → "33-04" (les circos hors
    // découpage Insee — Français de l'étranger — n'ont pas de profil).
    const circoRaw = mandat && mandat.circonscription;
    const numDept = (circoRaw && circoRaw.numDepartement) || d.numDept || '';
    const numCirco = circoRaw ? parseInt(circoRaw.numero, 10) : null;
    const circoId = numDept && numCirco ? `${String(numDept).padStart(2, '0')}-${String(numCirco).padStart(2, '0')}` : null;

    let circo = null;
    if (circoId) {
      try { circo = readJson(path.join(CIRCOS_DIR, `${circoId}.json`)); }
      catch { sansCirco++; }
    } else sansCirco++;

    let ci = null;
    if (circo) {
      const secteurs = {};
      for (const [k, s] of Object.entries((circo.emploi && circo.emploi.secteurs) || {})) {
        secteurs[k] = { nb: s.emplois, ind: round1(s.ratio) };
      }
      ci = {
        pop: circo.demographie && circo.demographie.pop,
        chomage: round1(circo.emploi && circo.emploi.tauxChomage),
        revenu: (circo.revenus && circo.revenus.nivVieMedian) || null,
        marge: round1(circo.elections && circo.elections.marge),
        tour1: !!(circo.elections && circo.elections.tourDecisif === 1),
        secteurs,
        signaux: [...new Set((circo.signaux || []).map(s => s.type))],
      };
    }

    deputes.push({
      id: d.id,
      nom: d.nom,
      prenom: d.prenom,
      // Début de mandat : un député ne peut pas être "absent" à un scrutin
      // antérieur à son élection (filtre position sur scrutin, côté client).
      md: (mandat && mandat.dateDebut) || null,
      photo: d.photoUrl || null,
      email: emails[d.id] || null,
      groupe: sigle,
      commissions: mandat ? mandat.commissions.map(c => c.court || c.nom) : (d.commission ? [d.commission] : []),
      ge: geParDepute[d.id] || [],
      circo: {
        id: circoId,
        dept: (circoRaw && circoRaw.departement) || d.dept || null,
        numDept,
        nom: (circoRaw && circoRaw.libelle) || d.circonscription || null,
      },
      stats: {
        loyaute: stats.taux_loyaute !== undefined ? stats.taux_loyaute : (d.loyaute ?? null),
        participation: stats.taux_participation !== undefined ? stats.taux_participation : (d.participation ?? null),
        nb_amendements: stats.nb_amendements ?? null,
        taux_adoption: stats.taux_adoption_amendements ?? null,
      },
      ci,
    });
  }

  if (sansFiche) console.log(`   ⚠ ${sansFiche} députés sans fiche`);
  console.log(`   ${deputes.length} députés, ${sansCirco} sans profil de circonscription`);
  return { updatedAt: new Date().toISOString(), groupes, deputes };
}

/* ── Scrutins : index global + positions nominatives shardées ───────────── */
function buildScrutins() {
  const zipPath = download('scrutins');
  const index = []; // [numero, date, titre, sort, pour, contre, abstentions]
  const shards = {}; // NN → { numero: { p:[], c:[], a:[], n:[] } }

  for (const { json } of zipEntries(zipPath)) {
    const s = json.scrutin;
    if (!s) continue;
    const numero = parseInt(s.numero, 10);
    if (!numero) continue;

    const synthese = s.syntheseVote || {};
    const decompte = synthese.decompte || {};
    index.push([
      numero,
      s.dateScrutin || null,
      truncate(decodeEntities(val(s.titre) || ''), TITRE_MAX),
      val(s.sort && s.sort.code) || null,
      parseInt(decompte.pour, 10) || 0,
      parseInt(decompte.contre, 10) || 0,
      parseInt(decompte.abstentions, 10) || 0,
    ]);

    const pos = { p: [], c: [], a: [], n: [] };
    for (const g of toArr(s.ventilationVotes && s.ventilationVotes.organe
      && s.ventilationVotes.organe.groupes && s.ventilationVotes.organe.groupes.groupe)) {
      const nom = (g.vote && g.vote.decompteNominatif) || {};
      const push = (list, key) => {
        for (const v of toArr(list && list.votant)) {
          const id = parseInt(stripPA(val(v.acteurRef)), 10);
          if (id) pos[key].push(id);
        }
      };
      push(nom.pours, 'p');
      push(nom.contres, 'c');
      push(nom.abstentions, 'a');
      push(nom.nonVotants, 'n');
    }
    const shard = String(Math.floor(numero / 100));
    (shards[shard] = shards[shard] || {})[numero] = pos;
  }

  index.sort((a, b) => b[0] - a[0]);
  console.log(`   ${index.length} scrutins, ${Object.keys(shards).length} shards de positions`);
  return { index, shards };
}

function main() {
  console.log('▶ build-ciblage-index');

  const emails = buildEmails();
  const idx = buildDeputesIndex(emails);
  const sIdx = writeOut('index.json', idx);
  console.log(`   ↳ index.json : ${(sIdx / 1e3).toFixed(0)} Ko${sIdx > 700e3 ? '  ⚠ > 700 Ko !' : ''}`);

  const { index, shards } = buildScrutins();
  const sScr = writeOut('scrutins-index.json', { updatedAt: new Date().toISOString(), scrutins: index });
  console.log(`   ↳ scrutins-index.json : ${(sScr / 1e3).toFixed(0)} Ko`);

  let totalPos = 0;
  for (const [shard, data] of Object.entries(shards)) {
    totalPos += writeOut(path.join('positions', `${shard}.json`), data);
  }
  console.log(`   ↳ positions/ : ${Object.keys(shards).length} fichiers, ${(totalPos / 1e6).toFixed(1)} Mo au total`);
  console.log('✅ build-ciblage-index terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-ciblage-index :', e.message); process.exit(1); }
}
module.exports = { main };
