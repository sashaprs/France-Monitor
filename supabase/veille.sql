-- ============================================================================
--  VEILLE MÉDIATIQUE — préférences utilisateur
--  À exécuter dans le SQL Editor de Supabase (en plus de schema.sql).
--
--  Une ligne par utilisateur (auth.users). Stocke la watchlist (sujets +
--  personnalités), la fréquence d'actualisation choisie dans l'interface et
--  l'opt-in au récap quotidien par e-mail (fonctionnalité à venir : une Edge
--  Function planifiée lira cette table chaque matin pour composer le digest).
-- ============================================================================

create table if not exists public.veille_preferences (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  sujets         jsonb not null default '[]'::jsonb,   -- [{ id, label, q }]
  personnalites  jsonb not null default '[]'::jsonb,   -- [{ id, name }]
  frequence      text  not null default '30min',       -- 'manuel' | '5min' | '15min' | '30min' | '1h'
  digest_email   boolean not null default false,       -- opt-in récap quotidien
  digest_heure   text  not null default '08:00',       -- heure d'envoi souhaitée (Europe/Paris)
  updated_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
--  Row Level Security : chaque utilisateur ne voit et ne modifie que SA ligne.
--  (Le futur job d'envoi d'e-mails utilisera la clé service_role, qui bypasse
--  la RLS, pour lire l'ensemble des préférences.)
-- ---------------------------------------------------------------------------
alter table public.veille_preferences enable row level security;

drop policy if exists "Veille : lecture propre ligne" on public.veille_preferences;
create policy "Veille : lecture propre ligne" on public.veille_preferences
  for select using (auth.uid() = user_id);

drop policy if exists "Veille : insertion propre ligne" on public.veille_preferences;
create policy "Veille : insertion propre ligne" on public.veille_preferences
  for insert with check (auth.uid() = user_id);

drop policy if exists "Veille : mise à jour propre ligne" on public.veille_preferences;
create policy "Veille : mise à jour propre ligne" on public.veille_preferences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Veille : suppression propre ligne" on public.veille_preferences;
create policy "Veille : suppression propre ligne" on public.veille_preferences
  for delete using (auth.uid() = user_id);

-- updated_at automatique à chaque modification.
create or replace function public.veille_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_veille_touch on public.veille_preferences;
create trigger trg_veille_touch
  before update on public.veille_preferences
  for each row execute function public.veille_touch_updated_at();
