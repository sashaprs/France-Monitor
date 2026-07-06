-- ============================================================================
--  MIGRATION 2 — Invitations dans une organisation
--
--  Flux V1 (sans e-mail transactionnel) :
--    1. Un admin crée une invitation (email + rôle) → un token est généré.
--    2. L'admin copie le lien (…#invitation=<token>) et l'envoie lui-même.
--    3. L'invité se connecte : le frontend appelle fm_rejoindre_par_email()
--       (rattachement automatique si son e-mail a une invitation en attente)
--       et/ou fm_accepter_invitation(<token>) si le token est dans l'URL.
--
--  Les RPC d'acceptation sont en SECURITY DEFINER : l'invité n'appartient pas
--  encore à l'organisation, la RLS normale lui interdirait ces écritures.
-- ============================================================================

create table if not exists public.invitations (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  email           text not null,
  role            text not null default 'membre' check (role in ('admin', 'membre')),
  token           uuid not null unique default gen_random_uuid(),
  invite_par      uuid references auth.users (id) on delete set null,
  cree_le         timestamptz not null default now(),
  expire_le       timestamptz not null default now() + interval '14 days',
  accepte_le      timestamptz,
  accepte_par     uuid references auth.users (id) on delete set null
);

create index if not exists idx_invitations_email_attente
  on public.invitations (lower(email)) where accepte_le is null;
create index if not exists idx_invitations_organisation
  on public.invitations (organisation_id);

-- E-mail normalisé (minuscules, sans espaces) pour un matching fiable.
create or replace function public.fm_normalise_invitation()
returns trigger language plpgsql as $$
begin
  new.email := lower(trim(new.email));
  if new.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Adresse e-mail invalide.';
  end if;
  return new;
end $$;

drop trigger if exists trg_invitations_normalise on public.invitations;
create trigger trg_invitations_normalise
  before insert or update of email on public.invitations
  for each row execute function public.fm_normalise_invitation();

-- ---------------------------------------------------------------------------
--  RLS : seules les admins de l'organisation gèrent ses invitations.
--  L'invité, lui, ne lit jamais la table : il passe par les RPC ci-dessous.
-- ---------------------------------------------------------------------------
alter table public.invitations enable row level security;

drop policy if exists "Invitations : lecture admins" on public.invitations;
create policy "Invitations : lecture admins" on public.invitations
  for select using (public.fm_est_admin(organisation_id));

drop policy if exists "Invitations : création admins" on public.invitations;
create policy "Invitations : création admins" on public.invitations
  for insert with check (public.fm_est_admin(organisation_id) and invite_par = auth.uid());

drop policy if exists "Invitations : mise à jour admins" on public.invitations;
create policy "Invitations : mise à jour admins" on public.invitations
  for update using (public.fm_est_admin(organisation_id))
  with check (public.fm_est_admin(organisation_id));

drop policy if exists "Invitations : suppression admins" on public.invitations;
create policy "Invitations : suppression admins" on public.invitations
  for delete using (public.fm_est_admin(organisation_id));

-- ---------------------------------------------------------------------------
--  Acceptation par token (lien copié-collé par l'admin).
--  Vérifie que l'e-mail du compte connecté correspond à celui de l'invitation.
-- ---------------------------------------------------------------------------
create or replace function public.fm_accepter_invitation(p_token uuid)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_inv   invitations%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();

  select * into v_inv
  from invitations
  where token = p_token and accepte_le is null and expire_le > now()
  for update;

  if not found then
    raise exception 'Invitation invalide, déjà utilisée ou expirée.';
  end if;
  if v_inv.email <> v_email then
    raise exception 'Cette invitation est destinée à une autre adresse e-mail.';
  end if;

  insert into utilisateurs_organisations (utilisateur_id, organisation_id, role)
  values (auth.uid(), v_inv.organisation_id, v_inv.role)
  on conflict (utilisateur_id, organisation_id) do nothing;

  update invitations set accepte_le = now(), accepte_par = auth.uid() where id = v_inv.id;
  return v_inv.organisation_id;
end $$;

-- ---------------------------------------------------------------------------
--  Rattachement automatique à la connexion : accepte toutes les invitations
--  en attente pour l'e-mail du compte connecté. Renvoie les organisations
--  rejointes (le frontend l'appelle après chaque authentification).
-- ---------------------------------------------------------------------------
create or replace function public.fm_rejoindre_par_email()
returns setof uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_email text;
  v_inv   invitations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise.';
  end if;
  select lower(email) into v_email from auth.users where id = auth.uid();

  for v_inv in
    select * from invitations
    where lower(email) = v_email and accepte_le is null and expire_le > now()
    for update
  loop
    insert into utilisateurs_organisations (utilisateur_id, organisation_id, role)
    values (auth.uid(), v_inv.organisation_id, v_inv.role)
    on conflict (utilisateur_id, organisation_id) do nothing;

    update invitations set accepte_le = now(), accepte_par = auth.uid() where id = v_inv.id;
    return next v_inv.organisation_id;
  end loop;
end $$;
