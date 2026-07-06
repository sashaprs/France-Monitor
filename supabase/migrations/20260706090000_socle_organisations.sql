-- ============================================================================
--  MIGRATION 1 — Socle multi-tenant : organisations & membres
--
--  Un cabinet = une organisation. Un utilisateur (auth.users) peut appartenir
--  à plusieurs organisations, avec un rôle 'admin' ou 'membre'.
--
--  Sécurité : RLS activée dès la création. Un utilisateur ne voit que les
--  organisations dont il est membre. Les fonctions fm_est_membre / fm_est_admin
--  sont en SECURITY DEFINER pour éviter la récursion des policies sur
--  utilisateurs_organisations (une policy de cette table ne peut pas
--  interroger la table elle-même sous RLS).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
--  Table : organisations (cabinets)
-- ---------------------------------------------------------------------------
create table if not exists public.organisations (
  id             uuid primary key default gen_random_uuid(),
  nom            text not null check (length(trim(nom)) between 1 and 120),
  logo_url       text,                              -- chemin dans le bucket Storage 'logos'
  couleur_accent text,                              -- hex optionnel pour la marque blanche
  plan           text not null default 'essai',     -- 'essai' | 'analyste' | ... (informel en V1)
  cree_le        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Table : appartenance utilisateur <-> organisation
-- ---------------------------------------------------------------------------
create table if not exists public.utilisateurs_organisations (
  utilisateur_id  uuid not null references auth.users (id) on delete cascade,
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  role            text not null default 'membre' check (role in ('admin', 'membre')),
  invite_le       timestamptz not null default now(),
  primary key (utilisateur_id, organisation_id)
);

create index if not exists idx_uo_organisation on public.utilisateurs_organisations (organisation_id);

-- ---------------------------------------------------------------------------
--  Fonctions d'appartenance (SECURITY DEFINER : lisent la table d'appartenance
--  en contournant la RLS, uniquement pour répondre vrai/faux sur auth.uid()).
-- ---------------------------------------------------------------------------
create or replace function public.fm_est_membre(p_org uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from utilisateurs_organisations
    where organisation_id = p_org and utilisateur_id = auth.uid()
  );
$$;

create or replace function public.fm_est_admin(p_org uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1 from utilisateurs_organisations
    where organisation_id = p_org and utilisateur_id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
--  Création d'une organisation : RPC atomique (l'organisation + son premier
--  admin). Sans cela, l'insert direct serait invisible au créateur tant que
--  sa ligne d'appartenance n'existe pas (la policy select l'exclurait).
-- ---------------------------------------------------------------------------
create or replace function public.fm_creer_organisation(p_nom text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_org uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.';
  end if;
  if coalesce(trim(p_nom), '') = '' then
    raise exception 'Le nom de l''organisation est requis.';
  end if;
  insert into organisations (nom) values (trim(p_nom)) returning id into v_org;
  insert into utilisateurs_organisations (utilisateur_id, organisation_id, role)
  values (auth.uid(), v_org, 'admin');
  return v_org;
end $$;

-- ---------------------------------------------------------------------------
--  Garde-fou : une organisation conserve toujours au moins un admin.
-- ---------------------------------------------------------------------------
create or replace function public.fm_verifie_dernier_admin()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  -- Si l'organisation elle-même est en cours de suppression, ses lignes
  -- d'appartenance tombent en cascade : ne pas bloquer.
  if not exists (select 1 from organisations where id = old.organisation_id) then
    return old;
  end if;
  if old.role = 'admin'
     and (tg_op = 'DELETE' or new.role <> 'admin')
     and not exists (
       select 1 from utilisateurs_organisations
       where organisation_id = old.organisation_id
         and role = 'admin'
         and utilisateur_id <> old.utilisateur_id
     )
  then
    raise exception 'Impossible : une organisation doit conserver au moins un admin.';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

drop trigger if exists trg_uo_dernier_admin on public.utilisateurs_organisations;
create trigger trg_uo_dernier_admin
  before update or delete on public.utilisateurs_organisations
  for each row execute function public.fm_verifie_dernier_admin();

-- ---------------------------------------------------------------------------
--  RLS — organisations
-- ---------------------------------------------------------------------------
alter table public.organisations enable row level security;

drop policy if exists "Organisations : lecture membres" on public.organisations;
create policy "Organisations : lecture membres" on public.organisations
  for select using (public.fm_est_membre(id));

-- Pas de policy insert : la création passe par fm_creer_organisation (RPC).

drop policy if exists "Organisations : mise à jour admins" on public.organisations;
create policy "Organisations : mise à jour admins" on public.organisations
  for update using (public.fm_est_admin(id)) with check (public.fm_est_admin(id));

drop policy if exists "Organisations : suppression admins" on public.organisations;
create policy "Organisations : suppression admins" on public.organisations
  for delete using (public.fm_est_admin(id));

-- ---------------------------------------------------------------------------
--  RLS — utilisateurs_organisations
-- ---------------------------------------------------------------------------
alter table public.utilisateurs_organisations enable row level security;

drop policy if exists "Membres : lecture par les membres" on public.utilisateurs_organisations;
create policy "Membres : lecture par les membres" on public.utilisateurs_organisations
  for select using (public.fm_est_membre(organisation_id));

-- Les insertions passent par fm_creer_organisation ou fm_accepter_invitation
-- (SECURITY DEFINER) : aucun insert direct autorisé, même pour un admin —
-- l'ajout d'un membre exige une invitation acceptée par l'intéressé.

drop policy if exists "Membres : changement de rôle par un admin" on public.utilisateurs_organisations;
create policy "Membres : changement de rôle par un admin" on public.utilisateurs_organisations
  for update using (public.fm_est_admin(organisation_id))
  with check (public.fm_est_admin(organisation_id));

drop policy if exists "Membres : retrait par un admin ou soi-même" on public.utilisateurs_organisations;
create policy "Membres : retrait par un admin ou soi-même" on public.utilisateurs_organisations
  for delete using (public.fm_est_admin(organisation_id) or utilisateur_id = auth.uid());
