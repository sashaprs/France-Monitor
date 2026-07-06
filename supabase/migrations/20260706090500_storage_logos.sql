-- ============================================================================
--  MIGRATION 6 — Supabase Storage : bucket « logos » (marque blanche)
--
--  Un logo par organisation, stocké sous la convention de chemin :
--      <organisation_id>/logo.<ext>
--  Bucket PRIVÉ : la lecture passe par une URL signée (createSignedUrl) ou un
--  download authentifié ; les policies ci-dessous restreignent chaque objet
--  aux membres de l'organisation dont l'uuid ouvre le chemin.
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logos', 'logos', false,
  2097152,  -- 2 Mo
  array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
)
on conflict (id) do nothing;

-- Premier segment du chemin → uuid d'organisation (null si chemin non conforme,
-- pour ne jamais faire échouer l'évaluation des policies sur un cast invalide).
create or replace function public.fm_org_du_chemin(p_name text)
returns uuid
language plpgsql immutable as $$
begin
  return (split_part(p_name, '/', 1))::uuid;
exception when others then
  return null;
end $$;

drop policy if exists "Logos : lecture membres" on storage.objects;
create policy "Logos : lecture membres" on storage.objects
  for select to authenticated
  using (bucket_id = 'logos' and public.fm_est_membre(public.fm_org_du_chemin(name)));

drop policy if exists "Logos : dépôt admins" on storage.objects;
create policy "Logos : dépôt admins" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'logos' and public.fm_est_admin(public.fm_org_du_chemin(name)));

drop policy if exists "Logos : remplacement admins" on storage.objects;
create policy "Logos : remplacement admins" on storage.objects
  for update to authenticated
  using (bucket_id = 'logos' and public.fm_est_admin(public.fm_org_du_chemin(name)))
  with check (bucket_id = 'logos' and public.fm_est_admin(public.fm_org_du_chemin(name)));

drop policy if exists "Logos : suppression admins" on storage.objects;
create policy "Logos : suppression admins" on storage.objects
  for delete to authenticated
  using (bucket_id = 'logos' and public.fm_est_admin(public.fm_org_du_chemin(name)));
