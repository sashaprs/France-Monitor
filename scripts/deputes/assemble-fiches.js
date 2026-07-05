/* ============================================================================
   assemble-fiches.js — Fusionne les intermédiaires tmp/build/*.json et écrit
   les 577 fiches public/data/deputes/PAxxxxxx.json + index.json enrichi.

   Robustesse : le référentiel est obligatoire ; chaque autre source est
   optionnelle. Si une source manque, la fiche est générée sans cette section
   et le nom de la source est consigné dans fiche.erreurs (et loggé).

   Taille : si une fiche dépasse ~150 Ko, les listes sont tronquées (les plus
   récentes d'abord) — chaque liste tronquée conserve son nb_total.

   Usage : node scripts/deputes/assemble-fiches.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { OUT, readBuild, ensureDirs } = require('./lib');

const MAX_FICHE_OCTETS = 150 * 1024;

function main() {
  console.log('▶ assemble-fiches');
  ensureDirs();

  const ref = readBuild('referentiel.json');
  if (!ref) throw new Error('tmp/build/referentiel.json manquant — lancer build-referentiel.js d\'abord');

  const sources = {
    votes: readBuild('votes.json'),
    amendements: readBuild('amendements.json'),
    questions: readBuild('questions.json'),
    rapports: readBuild('rapports.json'),
  };
  const manquantes = Object.entries(sources).filter(([, v]) => !v).map(([k]) => k);
  if (manquantes.length) console.log(`   ⚠ sources manquantes : ${manquantes.join(', ')} — fiches générées sans ces sections`);

  const moyennes = (sources.votes && sources.votes.moyennes_groupes) || {};
  const updatedAt = new Date().toISOString();
  let totalOctets = 0, tronquees = 0;

  const indexStats = {}; // id → { participation, loyaute } pour l'index

  for (const [id, base] of Object.entries(ref.deputes)) {
    const erreurs = [...manquantes];
    const groupeId = base.mandat.groupe.id;
    const nonInscrit = groupeId === 'ni';

    /* ── Votes ── */
    const v = sources.votes && sources.votes.deputes[id];
    const vStats = v ? v.stats : null;
    /* La loyauté n'a pas de sens pour un non-inscrit : pas de ligne de
       groupe à suivre. */
    const loyaute = vStats && !nonInscrit ? vStats.taux_loyaute : null;
    const moyGroupe = !nonInscrit && moyennes[groupeId] ? moyennes[groupeId] : null;

    /* ── Amendements ── */
    const am = sources.amendements && sources.amendements.deputes[id];

    /* ── Questions ── */
    const qu = sources.questions && sources.questions.deputes[id];

    /* ── Rapports ── */
    const ra = sources.rapports && sources.rapports.deputes[id];

    const fiche = {
      updatedAt,
      identite: base.identite,
      mandat: base.mandat,
      stats: {
        taux_participation: vStats ? vStats.taux_participation : null,
        taux_loyaute: loyaute,
        moyenne_groupe_loyaute: moyGroupe ? moyGroupe.loyaute : null,
        moyenne_groupe_participation: moyGroupe ? moyGroupe.participation : null,
        nb_scrutins_mandat: vStats ? vStats.nb_scrutins_mandat : null,
        nb_votes_exprimes: vStats ? vStats.nb_votes_exprimes : null,
        pour: vStats ? vStats.pour : null,
        contre: vStats ? vStats.contre : null,
        abstention: vStats ? vStats.abstention : null,
        nb_non_votant: vStats ? vStats.nb_non_votant : null,
        nb_delegations: vStats ? vStats.nb_delegations : null,
        nb_votes_rebelles: v && !nonInscrit ? v.votes_rebelles.length : nonInscrit ? null : null,
        nb_amendements: am ? am.nb : 0,
        nb_amendements_adoptes: am ? am.nb_adoptes : 0,
        nb_amendements_sort_connu: am ? am.nb_sort_connu : 0,
        nb_amendements_cosignes: am ? am.nb_cosignes : 0,
        taux_adoption_amendements: am && am.nb_sort_connu > 0 ? +(am.nb_adoptes / am.nb_sort_connu).toFixed(4) : null,
        nb_questions_ecrites: qu ? qu.nb_ecrites : 0,
        nb_questions_orales: qu ? qu.nb_orales : 0,
        nb_questions_gouvernement: qu ? qu.nb_gouvernement : 0,
        nb_questions_avec_reponse: qu ? qu.nb_reponses : 0,
        nb_rapports: ra ? ra.nb : 0,
      },
      loyaute_applicable: !nonInscrit,
      votes_rebelles: v && !nonInscrit ? v.votes_rebelles : [],
      derniers_votes: v ? v.derniers_votes : [],
      nb_total_derniers_votes: vStats ? vStats.nb_scrutins_mandat : 0,
      amendements: am ? am.liste : [],
      nb_total_amendements: am ? am.nb : 0,
      questions: qu ? qu.liste : [],
      nb_total_questions: qu ? (qu.nb_ecrites + qu.nb_orales + qu.nb_gouvernement) : 0,
      rapports: ra ? ra.liste : [],
      collaborateurs: base.collaborateurs,
      liens: base.liens,
      ...(erreurs.length ? { erreurs } : {}),
    };

    /* Troncature progressive si la fiche dépasse le budget. */
    let json = JSON.stringify(fiche);
    if (json.length > MAX_FICHE_OCTETS) {
      tronquees++;
      const listes = ['amendements', 'questions', 'derniers_votes', 'votes_rebelles'];
      for (const key of listes) {
        while (json.length > MAX_FICHE_OCTETS && fiche[key].length > 20) {
          fiche[key] = fiche[key].slice(0, Math.max(20, Math.floor(fiche[key].length * 0.75)));
          json = JSON.stringify(fiche);
        }
      }
    }

    fs.writeFileSync(path.join(OUT, `PA${id}.json`), json);
    totalOctets += json.length;

    indexStats[id] = {
      participation: fiche.stats.taux_participation,
      loyaute: fiche.stats.taux_loyaute,
    };
  }

  const n = Object.keys(ref.deputes).length;
  console.log(`   ${n} fiches écrites (${(totalOctets / 1e6).toFixed(1)} Mo au total, ${tronquees} tronquée(s))`);

  /* ── index.json enrichi des mini-indicateurs ─────────────────────────── */
  const indexPath = path.join(OUT, 'index.json');
  if (fs.existsSync(indexPath)) {
    const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    for (const d of idx.deputes) {
      const st = indexStats[d.id];
      if (st) {
        d.participation = st.participation;
        d.loyaute = st.loyaute;
      }
    }
    idx.updatedAt = updatedAt;
    fs.writeFileSync(indexPath, JSON.stringify(idx));
    console.log(`   ↳ index.json enrichi (${(fs.statSync(indexPath).size / 1e3).toFixed(0)} Ko)`);
  }

  console.log('✅ assemble-fiches terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ assemble-fiches :', e.message); process.exit(1); }
}
module.exports = { main };
