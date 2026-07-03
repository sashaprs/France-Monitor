# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/France Monitor.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `France monitor landing page` project files (HTML prototypes, assets, components)

---

# Configuration Supabase — Authentification & Base de données

L'application (`index.html`) intègre **Supabase** pour l'authentification (Google + Microsoft OAuth, Apple à venir) et pose les bases d'un schéma SQL relationnel pour les données des députés.

> ⚠️ Aucune vraie clé n'est committée. Le code contient des **placeholders** à remplacer par les valeurs de votre projet.

## 1. Créer le projet Supabase

1. Aller sur **https://supabase.com** → *Sign in* (compte GitHub par ex.).
2. *New project* → choisir une **organisation**, un **nom** (ex. `nomoslab`), un **mot de passe de base de données** (à conserver), une **région** (Europe : `Frankfurt` ou `Paris` si dispo).
3. Attendre ~2 min que le projet soit provisionné.

## 2. Récupérer `SUPABASE_URL` et `SUPABASE_ANON_KEY`

1. Dans le projet : **Project Settings** (roue crantée) → **API**.
2. Copier :
   - **Project URL** → à coller dans `SUPABASE_URL`
   - clé **anon / public** (section *Project API keys*) → à coller dans `SUPABASE_ANON_KEY`
3. Dans **`index.html`**, en haut du bloc `<script type="text/babel">`, remplacer :
   ```js
   const SUPABASE_URL = 'https://VOTRE-PROJET.supabase.co';
   const SUPABASE_ANON_KEY = 'VOTRE_CLE_ANON_PUBLIQUE';
   ```
   > La clé **anon public** est faite pour le front-end (protégée par les *Row Level Security policies*). Ne jamais mettre la clé **`service_role`** dans `index.html`.

## 3. Créer le schéma de base de données

1. Dans Supabase : **SQL Editor** → *New query*.
2. Coller le contenu de **`supabase/schema.sql`** puis *Run*.
3. Vérifier dans **Table Editor** que les tables sont créées : `deputes`, `votes`, `scrutins`, `commissions`, `depute_commissions`, `groupes_politiques`, `donnees_insee`.

## 4. Activer les URL de redirection (obligatoire pour l'OAuth)

Dans **Authentication → URL Configuration** :
- **Site URL** : l'URL de production, ex. `https://sashaprs.github.io/France-Monitor/`
- **Redirect URLs** (ajouter chaque environnement de test) :
  - `https://sashaprs.github.io/France-Monitor/`
  - `http://localhost:8000/` *(ou le port que vous utilisez en local)*

> Le code redirige vers `window.location.origin + pathname`. Pour tester en local, servez le fichier via un serveur HTTP (ex. `python3 -m http.server 8000`) — **pas** en `file://` (l'OAuth ne fonctionne pas avec `file://`).

## 5. Activer le provider **Google**

**Côté Google Cloud Console** (https://console.cloud.google.com) :
1. *Create project* (ou en réutiliser un).
2. **APIs & Services → OAuth consent screen** : type *External*, renseigner nom d'app + e-mail, publier (ou ajouter votre e-mail en *Test users*).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** :
   - Type : **Web application**
   - **Authorized redirect URIs** : y coller l'URL de callback Supabase, visible dans *Supabase → Authentication → Providers → Google*, de la forme :
     `https://VOTRE-PROJET.supabase.co/auth/v1/callback`
4. Copier le **Client ID** et le **Client secret**.

**Côté Supabase** : *Authentication → Providers → Google* → *Enable* → coller **Client ID** + **Client secret** → *Save*.

## 6. Activer le provider **Microsoft** (Azure)

**Côté Azure Portal** (https://portal.azure.com) :
1. **Microsoft Entra ID → App registrations → New registration**.
2. Nom de l'app ; *Supported account types* : au choix (ex. *Accounts in any organizational directory and personal Microsoft accounts*).
3. **Redirect URI** : type *Web*, valeur = l'URL de callback Supabase :
   `https://VOTRE-PROJET.supabase.co/auth/v1/callback`
4. Après création : noter l'**Application (client) ID**.
5. **Certificates & secrets → New client secret** → copier la **Value** (le secret).
6. (Selon la config) noter aussi l'**Directory (tenant) ID**.

**Côté Supabase** : *Authentication → Providers → Azure* → *Enable* → coller **Client ID** + **Secret** (et l'**Azure Tenant URL** si demandé, ex. `https://login.microsoftonline.com/<tenant-id>`) → *Save*.

> Dans le code, le bouton Microsoft appelle `signInWithOAuth({ provider: 'azure' })`.

## 7. Apple (plus tard)

Le bouton **Apple** est volontairement **désactivé** (tooltip « Bientôt disponible ») car « Sign in with Apple » nécessite un **compte développeur Apple payant** (99 $/an). Il suffira de l'activer côté Supabase (*Providers → Apple*) et de retirer l'attribut `disabled` du bouton le moment venu.

## Comportement de l'app

- Tant que les placeholders ne sont pas remplacés, l'écran de connexion s'affiche avec un bandeau « Supabase non configuré ».
- Une fois configuré : **non connecté → `AuthScreen`**, **connecté → dashboard** (bascule pilotée par `supabaseClient.auth.onAuthStateChange`). La session est gérée par Supabase (pas de `localStorage` manuel). La déconnexion se fait via le menu avatar en haut à droite du dashboard.
