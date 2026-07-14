-- ============================================================================
--  Fonctionnalités IA à la demande — cache des résumés et journal des appels.
--
--  • ia_resumes    : cache partagé des résumés de documents parlementaires,
--                    indexé par l'uid AN du document. Un résumé généré une
--                    fois est servi à tous les utilisateurs suivants sans
--                    nouvel appel à l'API Anthropic.
--  • ia_appels_log : journal de chaque appel réel à l'API (jamais les hits
--                    de cache), support du rate limiting quotidien par
--                    utilisateur et du suivi de coût en tokens.
--
--  Écritures réservées au service_role (Edge Functions). Les clients ne
--  voient que la lecture du cache ; le journal leur est invisible.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Cache des résumés de documents (fonctionnalité A)
-- ---------------------------------------------------------------------------
create table if not exists public.ia_resumes (
  id                bigint generated always as identity primary key,
  document_uid      text not null unique,          -- uid AN, ex. PIONANR5L17B0277
  titre             text,
  url_source        text not null,                 -- URL officielle du document
  resume            jsonb not null,                -- {objet, points_cles[], points_vigilance[], avertissement}
  modele            text not null,                 -- id du modèle Claude utilisé
  document_tronque  boolean not null default false,
  tokens_entree     integer,
  tokens_sortie     integer,
  genere_par        uuid references auth.users (id) on delete set null,
  genere_le         timestamptz not null default now()
);

alter table public.ia_resumes enable row level security;

-- Cache partagé : lecture pour tout utilisateur connecté, aucune écriture
-- côté client (seule la Edge Function écrit, via service_role).
drop policy if exists ia_resumes_lecture on public.ia_resumes;
create policy ia_resumes_lecture on public.ia_resumes
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
--  Journal des appels IA (rate limiting + suivi de coût)
-- ---------------------------------------------------------------------------
create table if not exists public.ia_appels_log (
  id              bigint generated always as identity primary key,
  utilisateur_id  uuid not null references auth.users (id) on delete cascade,
  fonctionnalite  text not null check (fonctionnalite in ('resume_texte', 'synthese_position')),
  reference       text,                            -- uid document, ou "PAxxxx | sujet"
  modele          text,
  tokens_entree   integer,
  tokens_sortie   integer,
  cree_le         timestamptz not null default now()
);

-- RLS activée sans aucune policy : la table est invisible et inaccessible
-- aux clients, seul le service_role (qui contourne la RLS) y écrit et y lit.
alter table public.ia_appels_log enable row level security;

-- Index pour le comptage du rate limiting (appels du jour par utilisateur).
create index if not exists ia_appels_log_utilisateur_date
  on public.ia_appels_log (utilisateur_id, cree_le desc);
