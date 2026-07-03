-- ============================================================================
--  NomosLab (France-Monitor) — Schéma SQL de départ
--  Base PostgreSQL (Supabase). À exécuter dans : Supabase Dashboard → SQL Editor.
--
--  Modélise les députés de l'Assemblée nationale, leurs votes/scrutins, les
--  commissions, et des indicateurs INSEE par département pour croiser avec les
--  circonscriptions.
--
--  Conventions :
--    • tout en snake_case, colonnes en français
--    • clés primaires techniques en bigint generated always as identity
--    • clés étrangères + index sur les colonnes de recherche fréquentes
--    • Row Level Security activée avec une politique de lecture publique
--      (données publiques). Les écritures restent réservées au service_role.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Extensions utiles (déjà disponibles sur Supabase)
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";   -- recherche floue / insensible sur le nom

-- ---------------------------------------------------------------------------
--  Table : groupes politiques (référentiel des groupes à l'AN)
-- ---------------------------------------------------------------------------
create table if not exists public.groupes_politiques (
  id          text primary key,          -- ex. 'rn', 'lfi-nfp', 'epr'
  sigle       text not null,             -- ex. 'RN', 'LFI-NFP'
  nom         text not null,             -- libellé complet
  couleur     text,                      -- code hex, ex. '#14385F'
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Table : commissions permanentes / spéciales
-- ---------------------------------------------------------------------------
create table if not exists public.commissions (
  id          bigint generated always as identity primary key,
  nom         text not null unique,      -- ex. 'Commission des finances'
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Table : députés
-- ---------------------------------------------------------------------------
create table if not exists public.deputes (
  id                  text primary key,            -- id officiel AN (ex. '793214')
  nom                 text not null,
  prenom              text not null,
  nom_complet         text generated always as (prenom || ' ' || nom) stored,
  sexe                char(1) check (sexe in ('F', 'H')),
  groupe_politique_id text references public.groupes_politiques (id) on delete set null,
  circonscription     text,                        -- ex. '2e circonscription'
  departement         text,                        -- ex. 'Ariège'
  region              text,
  profession          text,
  date_debut_mandat   date,
  date_fin_mandat     date,
  legislature         smallint not null default 17,
  photo_url           text,
  actif               boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Index de recherche fréquents
create index if not exists idx_deputes_nom              on public.deputes (nom);
create index if not exists idx_deputes_groupe           on public.deputes (groupe_politique_id);
create index if not exists idx_deputes_departement      on public.deputes (departement);
-- Recherche floue sur le nom complet (via l'extension pg_trgm activée plus haut)
create index if not exists idx_deputes_nom_complet_trgm on public.deputes using gin (nom_complet gin_trgm_ops);

-- ---------------------------------------------------------------------------
--  Table de liaison : députés <-> commissions (relation N-N)
-- ---------------------------------------------------------------------------
create table if not exists public.depute_commissions (
  depute_id      text   not null references public.deputes (id)     on delete cascade,
  commission_id  bigint not null references public.commissions (id) on delete cascade,
  role           text,                          -- ex. 'Président', 'Membre', 'Rapporteur'
  primary key (depute_id, commission_id)
);

create index if not exists idx_depcom_commission on public.depute_commissions (commission_id);

-- ---------------------------------------------------------------------------
--  Table : scrutins (un vote solennel / public à l'AN)
-- ---------------------------------------------------------------------------
create table if not exists public.scrutins (
  id             bigint generated always as identity primary key,
  numero         integer unique,                -- numéro officiel du scrutin
  titre          text not null,
  texte_examine  text,                          -- intitulé du texte / amendement
  date           date not null,
  sort           text,                          -- ex. 'Adopté', 'Rejeté'
  nb_pour        integer,
  nb_contre      integer,
  nb_abstention  integer,
  legislature    smallint not null default 17,
  created_at     timestamptz not null default now()
);

create index if not exists idx_scrutins_date on public.scrutins (date desc);

-- ---------------------------------------------------------------------------
--  Table : votes (position d'un député sur un scrutin) — relation N-N enrichie
-- ---------------------------------------------------------------------------
create table if not exists public.votes (
  id             bigint generated always as identity primary key,
  depute_id      text   not null references public.deputes (id)  on delete cascade,
  scrutin_id     bigint not null references public.scrutins (id) on delete cascade,
  position       text   not null check (position in ('pour', 'contre', 'abstention', 'absent')),
  par_delegation boolean not null default false,
  created_at     timestamptz not null default now(),
  unique (depute_id, scrutin_id)               -- un seul vote par député et par scrutin
);

create index if not exists idx_votes_depute   on public.votes (depute_id);
create index if not exists idx_votes_scrutin   on public.votes (scrutin_id);
create index if not exists idx_votes_position  on public.votes (position);

-- ---------------------------------------------------------------------------
--  Table : données INSEE par département (pour croiser avec les circonscriptions)
-- ---------------------------------------------------------------------------
create table if not exists public.donnees_insee (
  id           bigint generated always as identity primary key,
  departement  text not null,                  -- ex. 'Ariège' ou code '09'
  indicateur   text not null,                  -- ex. 'taux_chomage', 'population'
  valeur       numeric,
  unite        text,                            -- ex. '%', 'habitants', '€'
  annee        smallint not null,
  source       text default 'INSEE',
  created_at   timestamptz not null default now(),
  unique (departement, indicateur, annee)
);

create index if not exists idx_insee_departement on public.donnees_insee (departement);
create index if not exists idx_insee_indicateur  on public.donnees_insee (indicateur);

-- ---------------------------------------------------------------------------
--  Row Level Security : lecture publique (données publiques), écriture réservée
--  au service_role (les clés service_role bypassent la RLS ; la clé anon du
--  front-end n'a que le droit de lecture ci-dessous).
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'groupes_politiques', 'commissions', 'deputes', 'depute_commissions',
    'scrutins', 'votes', 'donnees_insee'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'drop policy if exists "Lecture publique" on public.%I;', t);
    execute format(
      'create policy "Lecture publique" on public.%I for select using (true);', t);
  end loop;
end $$;

-- ============================================================================
--  FIN DU SCHÉMA
--  Pistes d'évolution : table `utilisateurs` liée à auth.users (profils),
--  historique des mandats, amendements, questions au gouvernement, etc.
-- ============================================================================
