#!/usr/bin/env node
/* ============================================================================
 * TEST D'ÉTANCHÉITÉ RLS MULTI-TENANT — NomosLab
 *
 * Vérifie de bout en bout qu'un cabinet (organisation) ne peut jamais lire ni
 * écrire les données d'un autre. Automatise le protocole de supabase/README.md.
 *
 * Usage :
 *   SUPABASE_SERVICE_ROLE_KEY='...' node supabase/test-rls.mjs
 *
 * Configuration (jamais de clé en dur ici) :
 *   - SUPABASE_SERVICE_ROLE_KEY : requis, env ou supabase/.env.local
 *     (fichier ignoré par git — voir .gitignore). NE JAMAIS committer.
 *   - SUPABASE_URL / SUPABASE_ANON_KEY : env ou supabase/.env.local, sinon
 *     lues automatiquement depuis index.html (valeurs publiques du frontend).
 *
 * Le script crée 3 utilisateurs et 2 organisations de test, exécute les
 * vérifications, puis NETTOIE tout (organisations puis utilisateurs), même en
 * cas d'échec d'un test.
 * ========================================================================== */

import { readFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = dirname(fileURLToPath(import.meta.url));
const RACINE = join(ICI, '..');

/* ── Configuration ────────────────────────────────────────────────────── */

// supabase/.env.local : lignes CLÉ=valeur, chargées dans process.env si absentes.
const envLocal = join(ICI, '.env.local');
if (existsSync(envLocal)) {
  for (const ligne of readFileSync(envLocal, 'utf8').split('\n')) {
    const m = ligne.match(/^\s*(SUPABASE_[A-Z_]+)\s*=\s*['"]?([^'"\s]+)['"]?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function depuisIndexHtml(nomConst) {
  try {
    const html = readFileSync(join(RACINE, 'index.html'), 'utf8');
    const m = html.match(new RegExp(`const ${nomConst}\\s*=\\s*'([^']+)'`));
    return m ? m[1] : null;
  } catch { return null; }
}

const URL_SB  = process.env.SUPABASE_URL || depuisIndexHtml('SUPABASE_URL');
const ANON    = process.env.SUPABASE_ANON_KEY || depuisIndexHtml('SUPABASE_ANON_KEY');
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_SB || !ANON) {
  console.error('❌ SUPABASE_URL / SUPABASE_ANON_KEY introuvables (env, supabase/.env.local ou index.html).');
  process.exit(2);
}
if (!SERVICE) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY absente.');
  console.error('   Fournissez-la sans jamais la committer, au choix :');
  console.error("   1. SUPABASE_SERVICE_ROLE_KEY='...' node supabase/test-rls.mjs");
  console.error('   2. echo "SUPABASE_SERVICE_ROLE_KEY=..." > supabase/.env.local  (fichier git-ignoré)');
  console.error('   Clé : Dashboard Supabase → Project Settings → API → service_role.');
  process.exit(2);
}
// Garde-fou : la clé service_role est un JWT dont le payload contient "service_role".
try {
  const payload = JSON.parse(Buffer.from(SERVICE.split('.')[1], 'base64').toString());
  if (payload.role !== 'service_role') {
    console.error(`❌ La clé fournie a le rôle « ${payload.role} », pas « service_role ». Vérifiez la clé.`);
    process.exit(2);
  }
} catch { /* clé non-JWT (nouveau format sb_secret_...) : on laisse l'API trancher */ }

/* ── Petits helpers HTTP ──────────────────────────────────────────────── */

async function appel(methode, chemin, { jwt, service, corps, prefer } = {}) {
  const headers = {
    apikey: service ? SERVICE : ANON,
    Authorization: `Bearer ${service ? SERVICE : (jwt || ANON)}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(URL_SB + chemin, {
    method: methode,
    headers,
    body: corps === undefined ? undefined : JSON.stringify(corps),
  });
  const texte = await res.text();
  let json = null;
  try { json = texte ? JSON.parse(texte) : null; } catch { /* texte brut */ }
  return { status: res.status, json, texte };
}

const admin = (m, c, corps) => appel(m, c, { service: true, corps });

/* ── Rapport de tests ─────────────────────────────────────────────────── */

const resultats = [];
function test(nom, ok, { requete, attendu, obtenu }) {
  resultats.push({ nom, ok, requete, attendu, obtenu });
  if (ok) {
    console.log(`✅ PASS  ${nom}`);
  } else {
    console.log(`❌ FAIL  ${nom}`);
    console.log(`         requête : ${requete}`);
    console.log(`         attendu : ${attendu}`);
    console.log(`         obtenu  : ${obtenu}`);
  }
}

/* ── Utilisateurs de test ─────────────────────────────────────────────── */

const SUFFIXE = 'nomoslab-test.local';
const UTILISATEURS = {
  alice: { email: `test-alice@${SUFFIXE}` },
  bob:   { email: `test-bob@${SUFFIXE}` },
  carol: { email: `test-carol@${SUFFIXE}` },   // 3e compte : crée le Cabinet B
};
for (const u of Object.values(UTILISATEURS)) u.motDePasse = randomBytes(18).toString('base64url');

async function trouverUtilisateur(email) {
  for (let page = 1; page <= 10; page++) {
    const { json } = await admin('GET', `/auth/v1/admin/users?page=${page}&per_page=200`);
    const users = (json && json.users) || [];
    const u = users.find(x => (x.email || '').toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (users.length < 200) break;
  }
  return null;
}

async function creerUtilisateur(u) {
  // Idempotent : supprime un éventuel reliquat d'une exécution précédente.
  const existant = await trouverUtilisateur(u.email);
  if (existant) await admin('DELETE', `/auth/v1/admin/users/${existant.id}`);
  const { status, json, texte } = await admin('POST', '/auth/v1/admin/users', {
    email: u.email, password: u.motDePasse, email_confirm: true,
  });
  if (status >= 300) throw new Error(`création ${u.email} : HTTP ${status} — ${texte}`);
  u.id = json.id;
}

async function connecter(u) {
  const { status, json, texte } = await appel('POST', '/auth/v1/token?grant_type=password', {
    corps: { email: u.email, password: u.motDePasse },
  });
  if (status >= 300) throw new Error(`connexion ${u.email} : HTTP ${status} — ${texte}`);
  u.jwt = json.access_token;
  if (json.user && json.user.id) u.id = json.user.id;
}

/* ── Scénario ─────────────────────────────────────────────────────────── */

const aNettoyer = { orgs: [], users: [] };

async function scenario() {
  console.log(`\nProjet : ${URL_SB}\n`);

  // 1-2. Créer les utilisateurs (Admin API) puis récupérer leurs JWT.
  console.log('— Préparation : utilisateurs de test…');
  for (const u of Object.values(UTILISATEURS)) {
    await creerUtilisateur(u);
    aNettoyer.users.push(u);
    await connecter(u);
  }
  console.log(`  ${Object.values(UTILISATEURS).map(u => u.email).join(', ')} : créés et connectés.\n`);

  // 3. Cabinet A (Alice) et Cabinet B (Carol) via le RPC de création atomique.
  console.log('— Préparation : organisations et données de test…');
  const { alice, bob, carol } = UTILISATEURS;

  const creerOrg = async (u, nom) => {
    const r = await appel('POST', '/rest/v1/rpc/fm_creer_organisation', { jwt: u.jwt, corps: { p_nom: nom } });
    if (r.status === 404) throw new Error('RPC fm_creer_organisation introuvable — les migrations supabase/migrations/ ne sont pas appliquées.');
    if (r.status >= 300) throw new Error(`fm_creer_organisation (${nom}) : HTTP ${r.status} — ${r.texte}`);
    return r.json;   // uuid
  };
  const orgA = await creerOrg(alice, 'Cabinet A — test RLS');
  aNettoyer.orgs.push(orgA);
  const orgB = await creerOrg(carol, 'Cabinet B — test RLS');
  aNettoyer.orgs.push(orgB);

  const creerDossier = async (u, org, nom) => {
    const r = await appel('POST', '/rest/v1/dossiers_clients', {
      jwt: u.jwt, prefer: 'return=representation',
      corps: { organisation_id: org, nom_client_final: nom, cree_par: u.id },
    });
    if (r.status >= 300) throw new Error(`création dossier « ${nom} » : HTTP ${r.status} — ${r.texte}`);
    return r.json[0].id;
  };
  const dossierA = await creerDossier(alice, orgA, 'Client test A');
  const dossierB = await creerDossier(carol, orgB, 'Client test B');

  // Données sensibles dans B : un parlementaire suivi + une note confidentielle.
  let r = await appel('POST', '/rest/v1/dossier_parlementaires', {
    jwt: carol.jwt, corps: { dossier_id: dossierB, depute_id: '793214', ajoute_par: carol.id },
  });
  if (r.status >= 300) throw new Error(`suivi parlementaire B : HTTP ${r.status} — ${r.texte}`);
  r = await appel('POST', '/rest/v1/notes_parlementaires', {
    jwt: carol.jwt, corps: { dossier_id: dossierB, depute_id: '793214', auteur_id: carol.id, contenu: 'Note CONFIDENTIELLE du Cabinet B' },
  });
  if (r.status >= 300) throw new Error(`note B : HTTP ${r.status} — ${r.texte}`);
  console.log(`  Cabinet A (${orgA.slice(0, 8)}…) : 1 dossier. Cabinet B (${orgB.slice(0, 8)}…) : 1 dossier + 1 suivi + 1 note.\n`);

  console.log('— Tests d\'étanchéité (JWT Alice, Cabinet A) :');

  // T1 : la liste des organisations d'Alice ne contient jamais B.
  r = await appel('GET', '/rest/v1/organisations?select=id,nom', { jwt: alice.jwt });
  const ids = (r.json || []).map(o => o.id);
  test('T1 — Alice liste les organisations : voit A, jamais B', ids.includes(orgA) && !ids.includes(orgB), {
    requete: 'GET /rest/v1/organisations (JWT Alice)',
    attendu: `contient ${orgA.slice(0, 8)}… et PAS ${orgB.slice(0, 8)}…`,
    obtenu: JSON.stringify(r.json),
  });

  // T2 : lecture ciblée de l'organisation B → 0 ligne.
  r = await appel('GET', `/rest/v1/organisations?id=eq.${orgB}&select=*`, { jwt: alice.jwt });
  test('T2 — Alice vise explicitement l\'organisation B → 0 ligne', r.status === 200 && Array.isArray(r.json) && r.json.length === 0, {
    requete: `GET /rest/v1/organisations?id=eq.${orgB} (JWT Alice)`,
    attendu: '200 + []',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T3 : dossiers sans filtre → uniquement ceux de A.
  r = await appel('GET', '/rest/v1/dossiers_clients?select=id,nom_client_final', { jwt: alice.jwt });
  const dIds = (r.json || []).map(d => d.id);
  test('T3 — Alice liste les dossiers : uniquement Cabinet A', dIds.includes(dossierA) && !dIds.includes(dossierB), {
    requete: 'GET /rest/v1/dossiers_clients (JWT Alice)',
    attendu: `contient ${dossierA.slice(0, 8)}… et PAS ${dossierB.slice(0, 8)}…`,
    obtenu: JSON.stringify(r.json),
  });

  // T4 : dossiers de B visés explicitement → 0 ligne.
  r = await appel('GET', `/rest/v1/dossiers_clients?organisation_id=eq.${orgB}&select=*`, { jwt: alice.jwt });
  test('T4 — Alice vise les dossiers du Cabinet B → 0 ligne', r.status === 200 && (r.json || []).length === 0, {
    requete: `GET /rest/v1/dossiers_clients?organisation_id=eq.${orgB} (JWT Alice)`,
    attendu: '200 + []',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T5 : notes du dossier B → 0 ligne (la donnée la plus sensible).
  r = await appel('GET', `/rest/v1/notes_parlementaires?dossier_id=eq.${dossierB}&select=*`, { jwt: alice.jwt });
  test('T5 — Alice vise les notes du dossier B → 0 ligne', r.status === 200 && (r.json || []).length === 0, {
    requete: `GET /rest/v1/notes_parlementaires?dossier_id=eq.${dossierB} (JWT Alice)`,
    attendu: '200 + []',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T6 : écriture intrusive dans B → refus RLS (42501 / HTTP 401-403).
  r = await appel('POST', '/rest/v1/dossiers_clients', {
    jwt: alice.jwt, corps: { organisation_id: orgB, nom_client_final: 'Intrusion', cree_par: alice.id },
  });
  test('T6 — Alice tente de créer un dossier dans le Cabinet B → refus RLS', r.status === 401 || r.status === 403, {
    requete: 'POST /rest/v1/dossiers_clients {organisation_id: orgB} (JWT Alice)',
    attendu: 'HTTP 401/403 (violation row-level security, code 42501)',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T7-T8 : contrôle positif — Alice accède bien à SES données (la RLS ne bloque pas tout).
  r = await appel('GET', `/rest/v1/dossiers_clients?id=eq.${dossierA}&select=id,nom_client_final`, { jwt: alice.jwt });
  test('T7 — Alice lit son propre dossier (Cabinet A) → 1 ligne', r.status === 200 && (r.json || []).length === 1, {
    requete: `GET /rest/v1/dossiers_clients?id=eq.${dossierA} (JWT Alice)`,
    attendu: '200 + 1 ligne',
    obtenu: `${r.status} + ${r.texte}`,
  });
  r = await appel('GET', `/rest/v1/organisations?id=eq.${orgA}&select=id,nom`, { jwt: alice.jwt });
  test('T8 — Alice lit sa propre organisation (Cabinet A) → 1 ligne', r.status === 200 && (r.json || []).length === 1, {
    requete: `GET /rest/v1/organisations?id=eq.${orgA} (JWT Alice)`,
    attendu: '200 + 1 ligne',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T9 : Bob (aucune organisation) ne voit rien.
  r = await appel('GET', '/rest/v1/organisations?select=*', { jwt: bob.jwt });
  test('T9 — Bob (sans organisation) ne voit aucune organisation', r.status === 200 && (r.json || []).length === 0, {
    requete: 'GET /rest/v1/organisations (JWT Bob)',
    attendu: '200 + []',
    obtenu: `${r.status} + ${r.texte}`,
  });

  // T10 : clé anon sans JWT → rien.
  r = await appel('GET', '/rest/v1/organisations?select=*', {});
  test('T10 — Anonyme (clé anon seule, sans JWT) ne voit rien', r.status === 200 && (r.json || []).length === 0, {
    requete: 'GET /rest/v1/organisations (anon, sans JWT)',
    attendu: '200 + []',
    obtenu: `${r.status} + ${r.texte}`,
  });
}

/* ── Nettoyage (toujours exécuté) ─────────────────────────────────────── */

async function nettoyer() {
  console.log('\n— Nettoyage…');
  // Organisations d'abord (cascade dossiers/notes/suivis ; le garde-fou
  // « dernier admin » laisse passer car l'organisation disparaît en premier),
  // puis les utilisateurs.
  for (const org of aNettoyer.orgs) {
    const r = await admin('DELETE', `/rest/v1/organisations?id=eq.${org}`);
    console.log(`  organisation ${org.slice(0, 8)}… : ${r.status < 300 ? 'supprimée' : 'ÉCHEC HTTP ' + r.status + ' ' + r.texte}`);
  }
  for (const u of aNettoyer.users) {
    if (!u.id) { const trouve = await trouverUtilisateur(u.email); u.id = trouve && trouve.id; }
    if (!u.id) { console.log(`  ${u.email} : introuvable (rien à supprimer)`); continue; }
    const r = await admin('DELETE', `/auth/v1/admin/users/${u.id}`);
    console.log(`  ${u.email} : ${r.status < 300 ? 'supprimé' : 'ÉCHEC HTTP ' + r.status + ' ' + r.texte}`);
  }
}

/* ── Exécution ────────────────────────────────────────────────────────── */

let erreurFatale = null;
try {
  await scenario();
} catch (e) {
  erreurFatale = e;
} finally {
  try { await nettoyer(); } catch (e) { console.error('  Nettoyage incomplet :', e.message); }
}

console.log('\n════════════════ RÉCAPITULATIF ════════════════');
for (const t of resultats) console.log(`${t.ok ? '✅ PASS' : '❌ FAIL'}  ${t.nom}`);
const nbFail = resultats.filter(t => !t.ok).length;
if (erreurFatale) {
  console.error(`\n💥 Interrompu avant la fin : ${erreurFatale.message}`);
  process.exit(2);
}
console.log(`\n${resultats.length - nbFail}/${resultats.length} tests réussis.`);
process.exit(nbFail ? 1 : 0);
