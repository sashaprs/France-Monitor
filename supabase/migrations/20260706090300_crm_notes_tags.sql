-- ============================================================================
--  MIGRATION 4 — CRM léger : notes datées et tags par parlementaire
--
--  Choix de modélisation des tags (justifié) : les tags sont posés sur le
--  SUIVI (dossier_parlementaires) et non sur les notes. Un tag qualifie la
--  relation du cabinet avec le parlementaire dans un dossier (« allié »,
--  « rapporteur », « à recontacter »), pas une note individuelle — et cela
--  donne une seule source de vérité par (dossier, député) au lieu de tags
--  dupliqués sur chaque note. Une table notes_tags pourra s'ajouter plus tard
--  si le besoin de tagger les notes émerge.
-- ============================================================================

-- ---------------------------------------------------------------------------
--  Table : notes datées sur un parlementaire, dans le cadre d'un dossier
-- ---------------------------------------------------------------------------
create table if not exists public.notes_parlementaires (
  id         uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers_clients (id) on delete cascade,
  depute_id  text not null check (length(trim(depute_id)) between 1 and 40),
  auteur_id  uuid references auth.users (id) on delete set null,
  contenu    text not null check (length(trim(contenu)) between 1 and 20000),
  cree_le    timestamptz not null default now(),
  modifie_le timestamptz not null default now(),
  -- Une note porte sur un parlementaire effectivement suivi dans le dossier ;
  -- le on delete cascade retire les notes si le suivi est retiré.
  foreign key (dossier_id, depute_id)
    references public.dossier_parlementaires (dossier_id, depute_id) on delete cascade
);

create index if not exists idx_notes_dossier_depute
  on public.notes_parlementaires (dossier_id, depute_id, cree_le desc);

create or replace function public.fm_touch_modifie_le()
returns trigger language plpgsql as $$
begin
  new.modifie_le := now();
  return new;
end $$;

drop trigger if exists trg_notes_touch on public.notes_parlementaires;
create trigger trg_notes_touch
  before update on public.notes_parlementaires
  for each row execute function public.fm_touch_modifie_le();

alter table public.notes_parlementaires enable row level security;

drop policy if exists "Notes : lecture membres" on public.notes_parlementaires;
create policy "Notes : lecture membres" on public.notes_parlementaires
  for select using (public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Notes : création membres" on public.notes_parlementaires;
create policy "Notes : création membres" on public.notes_parlementaires
  for insert with check (public.fm_membre_du_dossier(dossier_id) and auteur_id = auth.uid());

-- Modification : uniquement par l'auteur (le with check interdit aussi de
-- réattribuer la note ou de la déplacer vers un dossier tiers).
drop policy if exists "Notes : modification par l'auteur" on public.notes_parlementaires;
create policy "Notes : modification par l'auteur" on public.notes_parlementaires
  for update using (auteur_id = auth.uid() and public.fm_membre_du_dossier(dossier_id))
  with check (auteur_id = auth.uid() and public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Notes : suppression auteur ou admin" on public.notes_parlementaires;
create policy "Notes : suppression auteur ou admin" on public.notes_parlementaires
  for delete using (
    public.fm_membre_du_dossier(dossier_id)
    and (auteur_id = auth.uid() or public.fm_admin_du_dossier(dossier_id))
  );

-- ---------------------------------------------------------------------------
--  Table : tags (référentiel par organisation)
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id              uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  libelle         text not null check (length(trim(libelle)) between 1 and 40),
  couleur         text check (couleur is null or couleur ~ '^#[0-9A-Fa-f]{6}$'),
  cree_le         timestamptz not null default now(),
  unique (organisation_id, libelle)
);

alter table public.tags enable row level security;

drop policy if exists "Tags : lecture membres" on public.tags;
create policy "Tags : lecture membres" on public.tags
  for select using (public.fm_est_membre(organisation_id));

drop policy if exists "Tags : création membres" on public.tags;
create policy "Tags : création membres" on public.tags
  for insert with check (public.fm_est_membre(organisation_id));

drop policy if exists "Tags : mise à jour membres" on public.tags;
create policy "Tags : mise à jour membres" on public.tags
  for update using (public.fm_est_membre(organisation_id))
  with check (public.fm_est_membre(organisation_id));

drop policy if exists "Tags : suppression membres" on public.tags;
create policy "Tags : suppression membres" on public.tags
  for delete using (public.fm_est_membre(organisation_id));

-- ---------------------------------------------------------------------------
--  Table : tags posés sur un suivi (dossier, député)
-- ---------------------------------------------------------------------------
create table if not exists public.suivi_tags (
  dossier_id uuid not null,
  depute_id  text not null,
  tag_id     uuid not null references public.tags (id) on delete cascade,
  ajoute_par uuid references auth.users (id) on delete set null,
  ajoute_le  timestamptz not null default now(),
  primary key (dossier_id, depute_id, tag_id),
  foreign key (dossier_id, depute_id)
    references public.dossier_parlementaires (dossier_id, depute_id) on delete cascade
);

create index if not exists idx_suivi_tags_tag on public.suivi_tags (tag_id);

alter table public.suivi_tags enable row level security;

drop policy if exists "Suivi tags : lecture membres" on public.suivi_tags;
create policy "Suivi tags : lecture membres" on public.suivi_tags
  for select using (public.fm_membre_du_dossier(dossier_id));

-- Le with check impose aussi la cohérence inter-organisations : le tag doit
-- appartenir à la même organisation que le dossier.
drop policy if exists "Suivi tags : ajout membres" on public.suivi_tags;
create policy "Suivi tags : ajout membres" on public.suivi_tags
  for insert with check (
    public.fm_membre_du_dossier(dossier_id)
    and exists (
      select 1
      from public.tags t
      join public.dossiers_clients dc on dc.organisation_id = t.organisation_id
      where t.id = tag_id and dc.id = dossier_id
    )
  );

drop policy if exists "Suivi tags : retrait membres" on public.suivi_tags;
create policy "Suivi tags : retrait membres" on public.suivi_tags
  for delete using (public.fm_membre_du_dossier(dossier_id));
