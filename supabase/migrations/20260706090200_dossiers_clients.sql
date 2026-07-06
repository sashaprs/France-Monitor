-- ============================================================================
--  MIGRATION 3 — Dossiers clients et éléments suivis
--
--  Un « dossier client » = le client final d'un cabinet (ex. « Dossier Bayer »).
--  On y rattache des parlementaires suivis et des dossiers législatifs suivis.
--
--  IMPORTANT (architecture deux couches) : depute_id et dossier_legislatif_id
--  sont des références TEXTUELLES vers le référentiel public servi en JSON
--  statique (public/data/deputes.json → ids type '793214' ;
--  public/data/legislatif/dossiers/ → ids type 'DLR5L17N50444').
--  PAS de clé étrangère : ces référentiels n'existent pas dans Supabase.
-- ============================================================================

create table if not exists public.dossiers_clients (
  id               uuid primary key default gen_random_uuid(),
  organisation_id  uuid not null references public.organisations (id) on delete cascade,
  nom_client_final text not null check (length(trim(nom_client_final)) between 1 and 160),
  description      text,
  cree_par         uuid references auth.users (id) on delete set null,
  cree_le          timestamptz not null default now(),
  archive          boolean not null default false
);

create index if not exists idx_dossiers_organisation on public.dossiers_clients (organisation_id);

-- ---------------------------------------------------------------------------
--  Fonctions d'appartenance au dossier (via l'organisation).
-- ---------------------------------------------------------------------------
create or replace function public.fm_membre_du_dossier(p_dossier uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1
    from dossiers_clients dc
    join utilisateurs_organisations uo on uo.organisation_id = dc.organisation_id
    where dc.id = p_dossier and uo.utilisateur_id = auth.uid()
  );
$$;

create or replace function public.fm_admin_du_dossier(p_dossier uuid)
returns boolean
language sql stable security definer set search_path = public, pg_temp as $$
  select exists (
    select 1
    from dossiers_clients dc
    join utilisateurs_organisations uo on uo.organisation_id = dc.organisation_id
    where dc.id = p_dossier and uo.utilisateur_id = auth.uid() and uo.role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
--  Garde-fous : seul un admin peut (dés)archiver ; un dossier ne change
--  jamais d'organisation. (Une policy RLS ne sait pas distinguer les colonnes
--  modifiées, d'où le trigger.)
-- ---------------------------------------------------------------------------
create or replace function public.fm_verifie_dossier_update()
returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.organisation_id <> old.organisation_id then
    raise exception 'Un dossier ne peut pas changer d''organisation.';
  end if;
  if new.archive is distinct from old.archive and not fm_est_admin(old.organisation_id) then
    raise exception 'Seul un admin peut archiver ou désarchiver un dossier.';
  end if;
  return new;
end $$;

drop trigger if exists trg_dossiers_update on public.dossiers_clients;
create trigger trg_dossiers_update
  before update on public.dossiers_clients
  for each row execute function public.fm_verifie_dossier_update();

-- ---------------------------------------------------------------------------
--  RLS — dossiers_clients : tout membre de l'organisation lit et écrit ;
--  l'archivage est réservé aux admins (trigger ci-dessus) ainsi que la
--  suppression définitive.
-- ---------------------------------------------------------------------------
alter table public.dossiers_clients enable row level security;

drop policy if exists "Dossiers : lecture membres" on public.dossiers_clients;
create policy "Dossiers : lecture membres" on public.dossiers_clients
  for select using (public.fm_est_membre(organisation_id));

drop policy if exists "Dossiers : création membres" on public.dossiers_clients;
create policy "Dossiers : création membres" on public.dossiers_clients
  for insert with check (public.fm_est_membre(organisation_id) and cree_par = auth.uid());

drop policy if exists "Dossiers : mise à jour membres" on public.dossiers_clients;
create policy "Dossiers : mise à jour membres" on public.dossiers_clients
  for update using (public.fm_est_membre(organisation_id))
  with check (public.fm_est_membre(organisation_id));

drop policy if exists "Dossiers : suppression admins" on public.dossiers_clients;
create policy "Dossiers : suppression admins" on public.dossiers_clients
  for delete using (public.fm_est_admin(organisation_id));

-- ---------------------------------------------------------------------------
--  Table : parlementaires suivis dans un dossier
-- ---------------------------------------------------------------------------
create table if not exists public.dossier_parlementaires (
  dossier_id uuid not null references public.dossiers_clients (id) on delete cascade,
  depute_id  text not null check (length(trim(depute_id)) between 1 and 40),
  ajoute_par uuid references auth.users (id) on delete set null,
  ajoute_le  timestamptz not null default now(),
  primary key (dossier_id, depute_id)
);

create index if not exists idx_dp_depute on public.dossier_parlementaires (depute_id);

alter table public.dossier_parlementaires enable row level security;

drop policy if exists "Suivis parlementaires : lecture membres" on public.dossier_parlementaires;
create policy "Suivis parlementaires : lecture membres" on public.dossier_parlementaires
  for select using (public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Suivis parlementaires : ajout membres" on public.dossier_parlementaires;
create policy "Suivis parlementaires : ajout membres" on public.dossier_parlementaires
  for insert with check (public.fm_membre_du_dossier(dossier_id) and ajoute_par = auth.uid());

drop policy if exists "Suivis parlementaires : retrait membres" on public.dossier_parlementaires;
create policy "Suivis parlementaires : retrait membres" on public.dossier_parlementaires
  for delete using (public.fm_membre_du_dossier(dossier_id));

-- ---------------------------------------------------------------------------
--  Table : dossiers législatifs suivis dans un dossier client
-- ---------------------------------------------------------------------------
create table if not exists public.dossiers_legislatifs_suivis (
  dossier_id             uuid not null references public.dossiers_clients (id) on delete cascade,
  dossier_legislatif_id  text not null check (length(trim(dossier_legislatif_id)) between 1 and 40),
  ajoute_par             uuid references auth.users (id) on delete set null,
  ajoute_le              timestamptz not null default now(),
  primary key (dossier_id, dossier_legislatif_id)
);

alter table public.dossiers_legislatifs_suivis enable row level security;

drop policy if exists "Suivis législatifs : lecture membres" on public.dossiers_legislatifs_suivis;
create policy "Suivis législatifs : lecture membres" on public.dossiers_legislatifs_suivis
  for select using (public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Suivis législatifs : ajout membres" on public.dossiers_legislatifs_suivis;
create policy "Suivis législatifs : ajout membres" on public.dossiers_legislatifs_suivis
  for insert with check (public.fm_membre_du_dossier(dossier_id) and ajoute_par = auth.uid());

drop policy if exists "Suivis législatifs : retrait membres" on public.dossiers_legislatifs_suivis;
create policy "Suivis législatifs : retrait membres" on public.dossiers_legislatifs_suivis
  for delete using (public.fm_membre_du_dossier(dossier_id));
