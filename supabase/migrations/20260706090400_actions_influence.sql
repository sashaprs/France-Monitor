-- ============================================================================
--  MIGRATION 5 — Journal des actions d'influence
--
--  Alimente le futur export d'aide à la déclaration HATVP : chaque action de
--  représentation d'intérêts (réunion, envoi de note, appel, événement…) est
--  consignée dans le cadre d'un dossier client, avec la cible (parlementaire
--  du référentiel public OU institution en texte libre), le sujet et un
--  budget estimé optionnel.
-- ============================================================================

create table if not exists public.actions_influence (
  id            uuid primary key default gen_random_uuid(),
  dossier_id    uuid not null references public.dossiers_clients (id) on delete cascade,
  -- Cible : un parlementaire (référence textuelle vers public/data/deputes.json)
  -- et/ou une institution en texte libre (ex. « Cabinet du ministre de la Santé »).
  depute_id     text check (depute_id is null or length(trim(depute_id)) between 1 and 40),
  institution   text check (institution is null or length(trim(institution)) between 1 and 200),
  auteur_id     uuid references auth.users (id) on delete set null,
  type_action   text not null check (type_action in ('reunion', 'envoi_note', 'appel', 'evenement', 'autre')),
  date_action   date not null,
  sujet         text not null check (length(trim(sujet)) between 1 and 300),
  description   text check (description is null or length(description) <= 20000),
  budget_estime numeric check (budget_estime is null or budget_estime >= 0),  -- en euros
  cree_le       timestamptz not null default now(),
  constraint action_a_une_cible check (depute_id is not null or institution is not null)
);

create index if not exists idx_actions_dossier_date
  on public.actions_influence (dossier_id, date_action desc);
create index if not exists idx_actions_depute on public.actions_influence (depute_id);

alter table public.actions_influence enable row level security;

drop policy if exists "Actions : lecture membres" on public.actions_influence;
create policy "Actions : lecture membres" on public.actions_influence
  for select using (public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Actions : création membres" on public.actions_influence;
create policy "Actions : création membres" on public.actions_influence
  for insert with check (public.fm_membre_du_dossier(dossier_id) and auteur_id = auth.uid());

drop policy if exists "Actions : modification par l'auteur" on public.actions_influence;
create policy "Actions : modification par l'auteur" on public.actions_influence
  for update using (auteur_id = auth.uid() and public.fm_membre_du_dossier(dossier_id))
  with check (auteur_id = auth.uid() and public.fm_membre_du_dossier(dossier_id));

drop policy if exists "Actions : suppression auteur ou admin" on public.actions_influence;
create policy "Actions : suppression auteur ou admin" on public.actions_influence
  for delete using (
    public.fm_membre_du_dossier(dossier_id)
    and (auteur_id = auth.uid() or public.fm_admin_du_dossier(dossier_id))
  );
