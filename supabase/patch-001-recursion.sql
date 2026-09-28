-- ============================================================================
-- Patch 001 — récursion infinie sur category_access
-- ----------------------------------------------------------------------------
-- Symptôme : 42P17 "infinite recursion detected in policy for relation
-- category_access" dès qu'un admin accorde un accès.
-- Cause : la policy d'insert sur category_access interrogeait public.categories,
-- dont la policy de select interrogeait public.category_access en retour.
-- Correctif : ces lectures passent par des fonctions security definer, qui
-- n'appliquent pas de RLS et rompent donc le cycle.
-- Idempotent : peut être rejoué sans risque.
-- ============================================================================

create or replace function public.is_my_teammate(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles pr
    where pr.id = p
      and pr.team_id is not null
      and pr.team_id = public.my_team_id()
  )
$$;

create or replace function public.is_my_team_category(cat uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.categories c
    where c.id = cat
      and c.team_id is not null
      and c.team_id = public.my_team_id()
  )
$$;

create or replace function public.has_category_access(cat uuid, who uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.category_access a
    where a.category_id = cat and a.profile_id = who
  )
$$;

-- categories : plus de sous-requête directe sur category_access
drop policy if exists categories_select on public.categories;
create policy categories_select on public.categories for select to authenticated
  using (
    owner_id = auth.uid()
    or (
      team_id is not null and team_id = public.my_team_id()
      and (
        public.is_team_admin()
        or public.has_category_access(categories.id, auth.uid())
      )
    )
  );

-- category_access : plus de sous-requête directe sur categories ni profiles
drop policy if exists access_select on public.category_access;
create policy access_select on public.category_access for select to authenticated
  using (
    profile_id = auth.uid()
    or (public.is_team_admin() and public.is_my_teammate(category_access.profile_id))
  );

drop policy if exists access_insert on public.category_access;
create policy access_insert on public.category_access for insert to authenticated
  with check (
    public.is_team_admin()
    and public.is_my_teammate(profile_id)
    and public.is_my_team_category(category_id)
  );

drop policy if exists access_delete on public.category_access;
create policy access_delete on public.category_access for delete to authenticated
  using (
    public.is_team_admin()
    and public.is_my_teammate(category_access.profile_id)
  );
