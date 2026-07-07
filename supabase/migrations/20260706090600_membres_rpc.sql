-- ============================================================================
--  MIGRATION 7 — Liste des membres d'une organisation (RPC)
--
--  Le frontend ne peut pas lire auth.users avec la clé anon ; ce RPC
--  SECURITY DEFINER expose e-mail et nom des membres d'une organisation,
--  uniquement aux membres de cette organisation (sinon : aucune ligne).
-- ============================================================================

create or replace function public.fm_membres_organisation(p_org uuid)
returns table (
  utilisateur_id uuid,
  email          text,
  nom            text,
  role           text,
  invite_le      timestamptz
)
language sql stable security definer set search_path = public, pg_temp as $$
  select uo.utilisateur_id,
         u.email::text,
         coalesce(
           u.raw_user_meta_data ->> 'full_name',
           u.raw_user_meta_data ->> 'name',
           split_part(u.email, '@', 1)
         ) as nom,
         uo.role,
         uo.invite_le
  from utilisateurs_organisations uo
  join auth.users u on u.id = uo.utilisateur_id
  where uo.organisation_id = p_org
    and public.fm_est_membre(p_org)
  order by uo.invite_le;
$$;
