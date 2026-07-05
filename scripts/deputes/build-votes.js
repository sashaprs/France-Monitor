/* ============================================================================
   build-votes.js — Participation, loyauté au groupe, votes rebelles.

   À partir de l'export Scrutins (le même que process-scrutins.js) :
   - "ligne du groupe" par scrutin = position majoritaire (pour/contre/
     abstention) parmi les membres du groupe ayant voté, à partir du
     décompte officiel (decompteVoix). Ligne ignorée si < 15 votants dans
     le groupe (échantillon non significatif) ou en cas d'égalité parfaite.
   - le groupe d'un député pour UN scrutin est celui sous lequel il apparaît
     dans la ventilation de CE scrutin (gère les changements de groupe).
   - taux_participation = scrutins où le député a exprimé un vote / scrutins
     tenus pendant son mandat (bornés par dateDebut/dateFin du mandat).
   - taux_loyaute = votes conformes à la ligne / votes exprimés sur les
     scrutins où une ligne de groupe est définie.

   Sortie : tmp/build/votes.json
   Usage : node scripts/deputes/build-votes.js
   ============================================================================ */

const { download, zipEntries, toArr, val, stripPA, writeBuild, readBuild, truncate } = require('./lib');

const POS = { pour: 'p', contre: 'c', abstention: 'a' };
const MIN_VOTANTS_GROUPE = 15; // en-dessous, la ligne du groupe n'est pas significative
const MAX_DERNIERS_VOTES = 50;
const MAX_REBELLES = 60;

function main() {
  console.log('▶ build-votes');
  const zipPath = download('scrutins');

  // Bornes de mandat par député (si le référentiel a déjà été construit).
  const ref = readBuild('referentiel.json');
  if (!ref) console.log('   ⚠ referentiel.json absent : participation calculée sur la 1re apparition');
  const organes = ref ? ref.organes : {};

  /* ── 1. Lecture de tous les scrutins ─────────────────────────────────── */
  const scrutins = []; // { numero, date, titre, tv, lignes: {orgRef: 'p'|'c'|'a'|null}, positions: {depId: {p, g, del}} }
  for (const { json } of zipEntries(zipPath)) {
    const s = json.scrutin;
    if (!s || String(s.legislature || '17') !== '17' && false) continue;
    if (!s) continue;

    const rec = {
      numero: s.numero,
      date: s.dateScrutin,
      titre: truncate(val(s.titre) || '', 220),
      tv: val(s.typeVote && s.typeVote.codeTypeVote) || null, // SPO / SPS (solennel) / MOTION…
      sort: val(s.sort && s.sort.code) || null,
      lignes: {},
      positions: {},
    };

    for (const g of toArr(s.ventilationVotes && s.ventilationVotes.organe
      && s.ventilationVotes.organe.groupes && s.ventilationVotes.organe.groupes.groupe)) {
      const orgRef = val(g.organeRef);
      const vote = g.vote || {};
      const dv = vote.decompteVoix || {};
      const pour = parseInt(dv.pour, 10) || 0;
      const contre = parseInt(dv.contre, 10) || 0;
      const abst = parseInt(dv.abstentions, 10) || 0;
      const votants = pour + contre + abst;

      /* Ligne du groupe : position strictement majoritaire parmi les votants. */
      let ligne = null;
      if (votants >= MIN_VOTANTS_GROUPE) {
        const max = Math.max(pour, contre, abst);
        const gagnants = [pour === max, contre === max, abst === max].filter(Boolean).length;
        if (gagnants === 1) ligne = pour === max ? 'p' : contre === max ? 'c' : 'a';
      }
      if (orgRef) rec.lignes[orgRef] = ligne;

      const nom = vote.decompteNominatif || {};
      const push = (list, code) => {
        for (const v of toArr(list && list.votant)) {
          const id = stripPA(val(v.acteurRef));
          if (!id) continue;
          rec.positions[id] = { p: code, g: orgRef, ...(val(v.parDelegation) === 'true' ? { del: true } : {}) };
        }
      };
      push(nom.pours, 'p');
      push(nom.contres, 'c');
      push(nom.abstentions, 'a');
      push(nom.nonVotants, 'n'); // présent mais non-votant (présidence de séance…)
    }
    scrutins.push(rec);
  }
  scrutins.sort((a, b) => String(b.date).localeCompare(String(a.date)) || (b.numero - a.numero));
  console.log(`   ${scrutins.length} scrutins`);

  /* ── 2. Agrégation par député ────────────────────────────────────────── */
  const depIds = new Set(ref ? Object.keys(ref.deputes) : []);
  if (!ref) for (const s of scrutins) for (const id of Object.keys(s.positions)) depIds.add(id);

  // 1re apparition (fallback si pas de référentiel, et pour les mandats
  // entamés en cours de législature sans date fiable)
  const firstSeen = {};
  for (const s of scrutins) {
    for (const id of Object.keys(s.positions)) {
      if (!firstSeen[id] || s.date < firstSeen[id]) firstSeen[id] = s.date;
    }
  }

  const deputes = {};
  for (const id of depIds) {
    const mandat = ref && ref.deputes[id] ? ref.deputes[id].mandat : null;
    const debut = (mandat && mandat.dateDebut) || firstSeen[id] || null;
    const fin = mandat ? mandat.dateFin : null;
    if (!debut) continue;

    let eligibles = 0, exprimes = 0, nonVotant = 0, delegations = 0;
    let loyalBase = 0, loyalOk = 0;
    let pour = 0, contre = 0, abst = 0;
    const rebelles = [];
    const derniers = [];

    for (const s of scrutins) {
      if (s.date < debut) continue;
      if (fin && s.date > fin) continue;
      eligibles++;

      const posRec = s.positions[id];
      const pos = posRec ? posRec.p : 'abs'; // absent : n'apparaît pas dans la ventilation
      const ligne = posRec && posRec.g ? (s.lignes[posRec.g] !== undefined ? s.lignes[posRec.g] : null) : null;

      if (posRec && posRec.del) delegations++;
      if (pos === 'p' || pos === 'c' || pos === 'a') {
        exprimes++;
        if (pos === 'p') pour++; else if (pos === 'c') contre++; else abst++;
        if (ligne) {
          loyalBase++;
          if (pos === ligne) loyalOk++;
          else if (rebelles.length < MAX_REBELLES) {
            rebelles.push({ n: s.numero, d: s.date, t: s.titre, p: pos, g: ligne, ...(s.tv === 'SPS' ? { sol: true } : {}) });
          }
        }
      } else if (pos === 'n') {
        nonVotant++;
      }

      if (derniers.length < MAX_DERNIERS_VOTES) {
        derniers.push({
          n: s.numero, d: s.date, t: s.titre, p: pos,
          ...(ligne ? { g: ligne } : {}),
          ...(s.tv === 'SPS' ? { sol: true } : {}),
          ...(posRec && posRec.del ? { del: true } : {}),
        });
      }
    }

    deputes[id] = {
      stats: {
        nb_scrutins_mandat: eligibles,
        nb_votes_exprimes: exprimes,
        nb_non_votant: nonVotant,
        nb_delegations: delegations,
        pour, contre, abstention: abst,
        taux_participation: eligibles ? +(exprimes / eligibles).toFixed(4) : null,
        taux_loyaute: loyalBase ? +(loyalOk / loyalBase).toFixed(4) : null,
        nb_votes_ligne_definie: loyalBase,
      },
      votes_rebelles: rebelles,
      derniers_votes: derniers,
    };
  }

  /* ── 3. Moyennes par groupe (sur les membres actuels du groupe) ──────── */
  const moyennes = {}; // groupeId ('soc'…) → { loyaute, participation, n }
  if (ref) {
    const acc = {};
    for (const [id, d] of Object.entries(ref.deputes)) {
      const gid = d.mandat.groupe.id;
      const st = deputes[id] && deputes[id].stats;
      if (!st) continue;
      if (!acc[gid]) acc[gid] = { loy: 0, nLoy: 0, part: 0, nPart: 0 };
      if (st.taux_loyaute !== null) { acc[gid].loy += st.taux_loyaute; acc[gid].nLoy++; }
      if (st.taux_participation !== null) { acc[gid].part += st.taux_participation; acc[gid].nPart++; }
    }
    for (const [gid, a] of Object.entries(acc)) {
      moyennes[gid] = {
        loyaute: a.nLoy ? +(a.loy / a.nLoy).toFixed(4) : null,
        participation: a.nPart ? +(a.part / a.nPart).toFixed(4) : null,
        n: a.nLoy,
      };
    }
  }

  writeBuild('votes.json', {
    updatedAt: new Date().toISOString(),
    nbScrutins: scrutins.length,
    moyennes_groupes: moyennes,
    deputes,
  });
  console.log(`   ${Object.keys(deputes).length} députés agrégés, ${Object.keys(moyennes).length} groupes`);
  console.log('✅ build-votes terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-votes :', e.message); process.exit(1); }
}
module.exports = { main };
