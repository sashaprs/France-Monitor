/* ============================================================================
   build-referentiel.js — Référentiel AMO (acteurs & organes).

   Télécharge l'export AMO10 (députés actifs, mandats actifs, organes) et
   produit :
   - tmp/build/referentiel.json : base identité / mandat / commissions /
     collaborateurs / liens de chaque député + référentiel organes (pour
     résoudre les organeRef des autres scripts).
   - public/data/deputes/index.json : liste légère (sera enrichie des stats
     participation/loyauté par assemble-fiches.js si disponibles).

   Usage : node scripts/deputes/build-referentiel.js
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { OUT, LEGISLATURE, download, zipEntries, toArr, val, stripPA, writeBuild } = require('./lib');

/* Normalisation des groupes : les abréviations AMO diffèrent parfois de
   celles utilisées historiquement par le frontend (ECOS vs EcoS, UDDPLR vs
   UDR…). On aligne id/short/couleur sur le design system existant. */
const GROUP_NORM = {
  'LFI-NFP': { id: 'lfi-nfp', short: 'LFI-NFP', color: '#C0392B' },
  'ECOS':    { id: 'ecos',    short: 'EcoS',    color: '#2E9E5B' },
  'GDR':     { id: 'gdr',     short: 'GDR',     color: '#D6001C' },
  'SOC':     { id: 'soc',     short: 'SOC',     color: '#E5447A' },
  'LIOT':    { id: 'liot',    short: 'LIOT',    color: '#7FB3D5' },
  'EPR':     { id: 'epr',     short: 'EPR',     color: '#2563EB' },
  'DEM':     { id: 'dem',     short: 'Dem',     color: '#E67E22' },
  'HOR':     { id: 'hor',     short: 'HOR',     color: '#2E86C1' },
  'DR':      { id: 'dr',      short: 'DR',      color: '#1F6FB2' },
  'UDDPLR':  { id: 'udr',     short: 'UDR',     color: '#6B4FA0' },
  'UDR':     { id: 'udr',     short: 'UDR',     color: '#6B4FA0' },
  'RN':      { id: 'rn',      short: 'RN',      color: '#14385F' },
  'NI':      { id: 'ni',      short: 'NI',      color: '#9AA3AF' },
};

/* Libellé court d'une commission permanente ("Commission des affaires
   étrangères" → "Affaires étrangères"). */
function commissionCourte(libelle) {
  if (!libelle) return null;
  return libelle
    .replace(/^Commission (des |de la |de l'|du |d')/i, '')
    .replace(/^./, c => c.toUpperCase());
}

function ordinalCirco(num) {
  const n = parseInt(num, 10);
  if (!n) return null;
  return n === 1 ? '1re circonscription' : `${n}e circonscription`;
}

function main() {
  console.log('▶ build-referentiel');
  const zipPath = download('amo');

  /* ── 1. Organes ─────────────────────────────────────────────────────── */
  const organes = {}; // POxxxx → { type, libelle, abrev, couleur }
  for (const { json } of zipEntries(zipPath, n => n.includes('/organe/'))) {
    const o = json.organe;
    if (!o) continue;
    organes[o.uid] = {
      type: o.codeType,
      libelle: val(o.libelle) || null,
      abrev: val(o.libelleAbrev) || null,
      couleur: val(o.couleurAssociee) || null,
      dateFin: val(o.viMoDe && o.viMoDe.dateFin) || null,
    };
  }
  console.log(`   ${Object.keys(organes).length} organes`);

  /* ── 2. Acteurs (députés) ───────────────────────────────────────────── */
  const deputes = {};
  for (const { json } of zipEntries(zipPath, n => n.includes('/acteur/'))) {
    const a = json.acteur;
    if (!a) continue;
    const uid = val(a.uid) || (a.uid && a.uid['#text']);
    const id = stripPA(uid);
    if (!id) continue;

    const ident = a.etatCivil && a.etatCivil.ident;
    const naissance = a.etatCivil && a.etatCivil.infoNaissance;

    const mandats = toArr(a.mandats && a.mandats.mandat);
    const actifs = mandats.filter(m => !val(m.dateFin));

    /* Mandat de député : le plus récent des mandats ASSEMBLEE actifs
       (un député peut en cumuler plusieurs dans la législature :
       suppléance puis réélection partielle). */
    const asm = mandats
      .filter(m => m.typeOrgane === 'ASSEMBLEE')
      .sort((x, y) => String(y.dateDebut || '').localeCompare(String(x.dateDebut || '')));
    const mandat = asm.find(m => !val(m.dateFin)) || asm[0];
    if (!mandat) continue; // pas député dans cette législature

    const groupeM = actifs.find(m => m.typeOrgane === 'GP');
    const groupeOrg = groupeM ? organes[val(groupeM.organes && groupeM.organes.organeRef)] : null;
    const abrev = (groupeOrg && groupeOrg.abrev) || 'NI';
    const norm = GROUP_NORM[abrev] || { id: abrev.toLowerCase(), short: abrev, color: (groupeOrg && groupeOrg.couleur) || '#9AA3AF' };
    const groupe = {
      id: norm.id,
      short: norm.short,
      name: groupeOrg ? groupeOrg.libelle : 'Non inscrits',
      color: norm.color,
    };

    /* Commissions permanentes actives (avec qualité : membre, président…). */
    const commissions = actifs
      .filter(m => m.typeOrgane === 'COMPER')
      .map(m => {
        const org = organes[val(m.organes && m.organes.organeRef)];
        return org ? {
          nom: org.libelle,
          court: commissionCourte(org.libelle),
          qualite: val(m.infosQualite && m.infosQualite.codeQualite) || 'Membre',
        } : null;
      })
      .filter(Boolean)
      // la qualité la plus élevée d'abord (Président avant Membre)
      .sort((x, y) => (x.qualite === 'Membre' ? 1 : 0) - (y.qualite === 'Membre' ? 1 : 0))
      // un député peut cumuler deux mandats actifs sur la même commission
      // (ex. Membre + Vice-Président) : on garde la qualité la plus élevée
      .filter((c, i, arr) => arr.findIndex(x => x.nom === c.nom) === i);

    /* Autres responsabilités visibles (bureau AN, groupes d'études présidés…) */
    const election = mandat.election || {};
    const lieu = election.lieu || {};
    const mandature = mandat.mandature || {};

    const collaborateurs = toArr(mandat.collaborateurs && mandat.collaborateurs.collaborateur)
      .map(c => ({
        civ: val(c.qualite) || '',
        prenom: val(c.prenom) || '',
        nom: val(c.nom) || '',
      }))
      .filter(c => c.nom || c.prenom);

    const suppleant = toArr(mandat.suppleants && mandat.suppleants.suppleant)
      .filter(s => !val(s.dateFin))
      .map(s => stripPA(val(s.suppleantRef)))[0] || null;

    const prenom = val(ident && ident.prenom) || '';
    const nom = val(ident && ident.nom) || '';
    const civ = val(ident && ident.civ) || '';

    deputes[id] = {
      id,
      uid,
      identite: {
        civ,
        prenom,
        nom,
        nomComplet: `${prenom} ${nom}`.trim(),
        female: civ === 'Mme',
        dateNaissance: val(naissance && naissance.dateNais) || null,
        villeNaissance: val(naissance && naissance.villeNais) || null,
        profession: val(a.profession && a.profession.libelleCourant) || null,
      },
      mandat: {
        dateDebut: val(mandat.dateDebut) || null,
        dateFin: val(mandat.dateFin) || null,
        legislature: LEGISLATURE,
        causeMandat: val(election.causeMandat) || null,
        premiereElection: val(mandature.premiereElection) === '1',
        placeHemicycle: val(mandature.placeHemicycle) || null,
        circonscription: {
          numero: val(lieu.numCirco) || null,
          libelle: ordinalCirco(val(lieu.numCirco)),
          departement: val(lieu.departement) || null,
          numDepartement: val(lieu.numDepartement) || null,
          region: val(lieu.region) || null,
        },
        groupe,
        commissions,
        suppleantId: suppleant,
      },
      collaborateurs,
      liens: {
        hatvp: val(a.uri_hatvp) || null,
        page_an: `https://www.assemblee-nationale.fr/dyn/deputes/PA${id}`,
        photo: `public/photos/${id}.jpg`,
        photo_an: `https://www.assemblee-nationale.fr/dyn/static/tribun/${LEGISLATURE}/photos/carre/${id}.jpg`,
      },
    };
  }

  /* Résolution des noms de suppléants (référence croisée acteurs). */
  for (const d of Object.values(deputes)) {
    const s = d.mandat.suppleantId;
    d.mandat.suppleant = s && deputes[s] ? deputes[s].identite.nomComplet : null;
    delete d.mandat.suppleantId;
  }

  const n = Object.keys(deputes).length;
  console.log(`   ${n} députés`);
  if (n < 500) throw new Error(`Référentiel suspect : ${n} députés seulement (attendu ≈ 577)`);

  writeBuild('referentiel.json', {
    updatedAt: new Date().toISOString(),
    organes,
    deputes,
  });

  /* ── 3. index.json de base (sans stats — enrichi par assemble-fiches) ── */
  const index = Object.values(deputes)
    .map(d => ({
      id: d.id,
      prenom: d.identite.prenom,
      nom: d.identite.nom,
      nomComplet: d.identite.nomComplet,
      initiales: ((d.identite.prenom[0] || '?') + (d.identite.nom[0] || '?')).toUpperCase(),
      female: d.identite.female,
      groupe: d.mandat.groupe,
      commission: d.mandat.commissions[0] ? d.mandat.commissions[0].court : null,
      dept: d.mandat.circonscription.departement,
      numDept: d.mandat.circonscription.numDepartement,
      region: d.mandat.circonscription.region,
      circonscription: d.mandat.circonscription.libelle,
      profession: d.identite.profession,
      photoUrl: d.liens.photo,
    }))
    .sort((x, y) => x.nom.localeCompare(y.nom, 'fr'));

  fs.mkdirSync(OUT, { recursive: true });
  const indexPath = path.join(OUT, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify({ updatedAt: new Date().toISOString(), deputes: index }));
  console.log(`   ↳ écrit : public/data/deputes/index.json (${(fs.statSync(indexPath).size / 1e3).toFixed(0)} Ko)`);
  console.log('✅ build-referentiel terminé');
}

if (require.main === module) {
  try { main(); } catch (e) { console.error('❌ build-referentiel :', e.message); process.exit(1); }
}
module.exports = { main };
