# Supabase — schéma privé multi-tenant (NomosLab)

Ce dossier contient la couche **données privées par cabinet** de NomosLab.
Rappel de l'architecture à deux couches, à ne jamais mélanger :

| Couche | Où | Exemples |
|---|---|---|
| Données publiques (référentiel parlementaire, INSEE) | JSON statiques `public/data/`, générés par GitHub Actions | `deputes.json`, `legislatif/dossiers/DLR….json` |
| Données privées par organisation | Supabase (Postgres + RLS), via le client JS avec la clé **anon** | dossiers clients, notes, tags, journal d'actions |

Les tables privées référencent le référentiel public par de **simples ids
textuels** (`depute_id` = ids de `public/data/deputes.json`, ex. `'793214'` ;
`dossier_legislatif_id` = ids `DLR…`), **sans clé étrangère** : ce référentiel
n'existe pas dans Supabase et ne doit pas y être migré.

## Contenu

| Fichier | Rôle |
|---|---|
| `migrations/20260706090000_socle_organisations.sql` | organisations, membres/rôles, `fm_est_membre` / `fm_est_admin`, RPC `fm_creer_organisation` |
| `migrations/20260706090100_invitations.sql` | invitations par token, RPC `fm_accepter_invitation` / `fm_rejoindre_par_email` |
| `migrations/20260706090200_dossiers_clients.sql` | dossiers clients, parlementaires suivis, dossiers législatifs suivis |
| `migrations/20260706090300_crm_notes_tags.sql` | notes datées, tags d'organisation, tags posés sur un suivi |
| `migrations/20260706090400_actions_influence.sql` | journal des actions d'influence (base de l'export d'aide HATVP) |
| `migrations/20260706090500_storage_logos.sql` | bucket Storage privé `logos` (marque blanche) |
| `migrations/20260706090600_membres_rpc.sql` | RPC `fm_membres_organisation` (e-mails des membres, réservé aux co-membres) |
| `veille.sql` | préférences de veille **par utilisateur** (antérieur au multi-tenant, toujours actif) |
| `schema.sql` | ⚠️ **OBSOLÈTE** — ébauche qui modélisait les données publiques en base, contraire à l'architecture actuelle. Ne pas exécuter. |

### `schema.sql` a-t-il déjà été exécuté chez vous ?

Dans le SQL Editor :

```sql
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('deputes', 'scrutins', 'votes', 'commissions',
                     'depute_commissions', 'donnees_insee', 'groupes_politiques');
```

- **Aucune ligne** : rien à faire.
- **Des lignes** : les tables existent (probablement vides). Elles sont
  inoffensives (RLS lecture seule) mais autant nettoyer :

```sql
drop table if exists public.votes, public.depute_commissions, public.scrutins,
  public.deputes, public.commissions, public.groupes_politiques,
  public.donnees_insee cascade;
```

## Appliquer les migrations

**Option A — Supabase CLI** (recommandé, garde l'historique des migrations) :

```bash
supabase link --project-ref fhbqraumkomrfcnvhmxr
supabase db push
```

**Option B — SQL Editor du Dashboard** : copier-coller le contenu des fichiers
de `migrations/` **dans l'ordre des horodatages** (090000 → 090600). Chaque
fichier est idempotent (`if not exists`, `drop policy if exists`) : le
rejouer ne casse rien.

Note : si la migration 6 échoue avec `must be owner of table objects`
(projets Supabase récents où `storage.objects` est verrouillé), créez les
4 policies équivalentes via Dashboard → Storage → `logos` → Policies, en
reprenant les expressions `using` / `with check` du fichier.

## Modèle de sécurité (RLS)

Règle centrale : **un utilisateur ne voit que les données de SON organisation**,
via la table `utilisateurs_organisations`. La RLS est activée sur toutes les
tables dès leur création ; le frontend peut masquer des boutons pour l'UX,
mais la sécurité réelle vient exclusivement des policies.

- `fm_est_membre(org)` / `fm_est_admin(org)` : fonctions `security definer`
  (elles contournent la RLS uniquement pour répondre vrai/faux sur
  `auth.uid()`, ce qui évite la récursion des policies sur la table
  d'appartenance).
- Réservé aux **admins** : inviter/retirer des membres, changer les rôles,
  (dés)archiver un dossier (trigger `trg_dossiers_update`), supprimer un
  dossier ou l'organisation, gérer le logo. Un garde-fou empêche de retirer
  le dernier admin d'une organisation.
- Les **membres** : créent des dossiers, suivent des parlementaires/dossiers
  législatifs, écrivent notes/tags/actions. Une note ou une action n'est
  modifiable que par son auteur (supprimable par l'auteur ou un admin).
- Insertions dans `utilisateurs_organisations` : **jamais en direct** —
  uniquement via `fm_creer_organisation` (créateur = premier admin) ou
  l'acceptation d'une invitation par l'intéressé.
- La clé **`service_role` ne doit JAMAIS apparaître côté frontend ni dans le
  repo.** Seule la clé `anon` est committable (elle est conçue pour être
  publique ; c'est la RLS qui protège les données).

## Test manuel d'étanchéité RLS (à dérouler après application)

Objectif : prouver qu'un utilisateur de l'organisation **A** ne peut ni lire
ni écrire les données de l'organisation **B**.

### 1. Préparer deux comptes et deux organisations

1. Créer deux comptes (par l'écran d'inscription de l'app, ou Dashboard →
   Authentication → Add user) : `alice@test.fr` et `bob@test.fr`.
2. Connecté en Alice, créer l'organisation A ; en Bob, l'organisation B
   (dans l'app, ou via le SQL ci-dessous **exécuté avec le JWT de chacun**,
   pas dans le SQL Editor qui bypasse la RLS).

### 2. Récupérer les JWT

Le plus simple : se connecter dans l'app, puis dans la console du navigateur :

```js
(await supabaseClient.auth.getSession()).data.session.access_token
```

Noter `JWT_ALICE` et `JWT_BOB`. Noter aussi la clé anon (`SUPABASE_ANON_KEY`
dans `index.html`).

### 3. Créer des données dans A (en tant qu'Alice)

```bash
URL="https://fhbqraumkomrfcnvhmxr.supabase.co"
ANON="<clé anon>"

# Créer l'organisation A (renvoie son uuid → ORG_A)
curl -s "$URL/rest/v1/rpc/fm_creer_organisation" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_ALICE" \
  -H "Content-Type: application/json" -d '{"p_nom":"Cabinet A"}'

# Créer un dossier client dans A (remplacer ORG_A et ALICE_ID)
curl -s "$URL/rest/v1/dossiers_clients" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_ALICE" \
  -H "Content-Type: application/json" -H "Prefer: return=representation" \
  -d '{"organisation_id":"ORG_A","nom_client_final":"Client test A","cree_par":"ALICE_ID"}'
```

(`ALICE_ID` = `(await supabaseClient.auth.getUser()).data.user.id` dans la
console d'Alice.)

### 4. Vérifier l'étanchéité (en tant que Bob)

Chaque commande ci-dessous doit renvoyer `[]` (la RLS filtre silencieusement) :

```bash
curl -s "$URL/rest/v1/organisations?select=*" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_BOB"
# attendu : uniquement l'organisation B, jamais A

curl -s "$URL/rest/v1/dossiers_clients?select=*" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_BOB"
# attendu : [] (aucun dossier de A visible)

curl -s "$URL/rest/v1/dossiers_clients?organisation_id=eq.ORG_A&select=*" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_BOB"
# attendu : [] même en visant explicitement ORG_A
```

Écriture interdite (attendu : erreur `42501` « row-level security ») :

```bash
curl -s "$URL/rest/v1/dossiers_clients" \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_BOB" \
  -H "Content-Type: application/json" \
  -d '{"organisation_id":"ORG_A","nom_client_final":"Intrusion","cree_par":"BOB_ID"}'
```

Et sans aucun JWT (clé anon seule), tout doit renvoyer `[]` :

```bash
curl -s "$URL/rest/v1/organisations?select=*" -H "apikey: $ANON"
```

### 5. Vérifier les restrictions de rôle

En tant que **membre** (non admin) d'une organisation :

- Archiver un dossier → attendu : erreur « Seul un admin peut archiver… » :

```bash
curl -s "$URL/rest/v1/dossiers_clients?id=eq.DOSSIER_ID" -X PATCH \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_MEMBRE" \
  -H "Content-Type: application/json" -d '{"archive":true}'
```

- Créer une invitation → attendu : erreur RLS (`42501`).
- En tant qu'admin, retirer le **dernier admin** → attendu : erreur
  « une organisation doit conserver au moins un admin ».

### 6. Vérifier le flux d'invitation

1. Alice (admin de A) insère une invitation pour `bob@test.fr` (rôle `membre`).
2. Bob appelle le RPC de rattachement :

```bash
curl -s "$URL/rest/v1/rpc/fm_rejoindre_par_email" -X POST \
  -H "apikey: $ANON" -H "Authorization: Bearer $JWT_BOB" \
  -H "Content-Type: application/json" -d '{}'
# attendu : ["<uuid ORG_A>"] puis Bob voit l'organisation A et ses dossiers
```

3. Rejouer l'appel → attendu : `[]` (invitation déjà consommée).
4. Une invitation pour `carol@test.fr` acceptée par token avec le JWT de Bob
   (`fm_accepter_invitation`) → attendu : erreur « destinée à une autre
   adresse e-mail ».
