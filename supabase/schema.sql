-- ============================================================================
--  Rick — schéma Supabase
--  Comptes, équipes, catégories, accès par catégorie, mémos, rappels, audio.
--
--  À exécuter une fois dans Supabase Studio > SQL Editor (tout le fichier).
--  Rejouable : chaque objet est créé "if not exists" / "or replace".
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- TABLES ---

create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  code        text not null unique,
  admin_id    uuid,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text not null default '',
  -- 'admin' : administrateur de son équipe (et par défaut de son espace solo)
  -- 'equipier' : accès limité aux catégories que l'admin lui affecte
  role        text not null default 'admin' check (role in ('admin','equipier')),
  team_id     uuid references public.teams(id) on delete set null,
  extensions  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

do $$ begin
  alter table public.teams
    add constraint teams_admin_fk foreign key (admin_id)
    references public.profiles(id) on delete set null;
exception when duplicate_object then null; end $$;

-- Une catégorie appartient soit à un compte (perso), soit à une équipe.
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid references public.profiles(id) on delete cascade,
  team_id     uuid references public.teams(id) on delete cascade,
  name        text not null,
  icon        text not null default '🏷️',
  deco        text not null default '🏷️',
  color       jsonb,
  custom      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint categories_owner_xor_team check ((owner_id is null) <> (team_id is null))
);

-- Qui a accès à quelle catégorie d'équipe (géré par l'admin).
create table if not exists public.category_access (
  category_id uuid not null references public.categories(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id)   on delete cascade,
  primary key (category_id, profile_id)
);

create table if not exists public.memos (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  team_id        uuid references public.teams(id) on delete set null,
  category_id    uuid references public.categories(id) on delete set null,
  title          text not null default 'Nouveau mémo',
  transcript     text not null default '',
  summary        text not null default '',
  actions        jsonb not null default '[]'::jsonb,
  analyzed       boolean not null default false,
  transcribing   boolean not null default false,
  whisper_failed boolean not null default false,
  used_tab_audio boolean not null default false,
  has_audio      boolean not null default false,
  duration       integer not null default 0,
  created_at     timestamptz not null default now()
);

create table if not exists public.reminders (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  lat        double precision not null,
  lng        double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists memos_owner_idx    on public.memos(owner_id);
create index if not exists memos_team_idx     on public.memos(team_id);
create index if not exists memos_cat_idx      on public.memos(category_id);
create index if not exists categories_own_idx on public.categories(owner_id);
create index if not exists categories_team_idx on public.categories(team_id);
create index if not exists access_profile_idx on public.category_access(profile_id);

-- ------------------------------------------------------------- HELPERS ----
-- "security definer" : ces fonctions contournent RLS pour éviter la récursion
-- infinie (une policy sur profiles qui interrogerait profiles).

create or replace function public.my_team_id() returns uuid
language sql stable security definer set search_path = public as $$
  select team_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_team_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- Le cœur de la règle métier : un équipier ne "voit" une catégorie d'équipe
-- que si l'admin la lui a affectée. Appliqué côté serveur, pas dans le front.
create or replace function public.is_my_teammate(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles pr
    where pr.id = p and pr.team_id is not null and pr.team_id = public.my_team_id()
  )
$$;

create or replace function public.is_my_team_category(cat uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.categories c
    where c.id = cat and c.team_id is not null and c.team_id = public.my_team_id()
  )
$$;

create or replace function public.has_category_access(cat uuid, who uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.category_access a
    where a.category_id = cat and a.profile_id = who
  )
$$;

create or replace function public.can_see_category(cat uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.categories c
    where c.id = cat
      and (
        c.owner_id = auth.uid()
        or (
          c.team_id is not null
          and c.team_id = public.my_team_id()
          and (
            public.is_team_admin()
            or exists (select 1 from public.category_access a
                        where a.category_id = c.id and a.profile_id = auth.uid())
          )
        )
      )
  )
$$;

-- --------------------------------------------------------- NOUVEAU COMPTE --
-- À l'inscription : profil + les trois catégories personnelles par défaut.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;

  insert into public.categories (owner_id, name, icon, deco, custom) values
    (new.id, 'Pro',     '💼', '💼', false),
    (new.id, 'Perso',   '🧘', '🧘', false),
    (new.id, 'Famille', '❤️', '❤️', false);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Un compte ne peut pas s'auto-promouvoir admin ni changer d'équipe en direct :
-- ça passe obligatoirement par create_team / join_team / promote_member.
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('rick.role_change', true), '') <> 'on' then
    new.role    := old.role;
    new.team_id := old.team_id;
  end if;
  return new;
end $$;

drop trigger if exists guard_profile_update_trg on public.profiles;
create trigger guard_profile_update_trg
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ------------------------------------------------------------- RPC ÉQUIPE --

create or replace function public.create_team(team_name text) returns public.teams
language plpgsql security definer set search_path = public as $$
declare t public.teams; new_code text;
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  if coalesce(trim(team_name),'') = '' then raise exception 'nom d''équipe vide'; end if;
  if (select team_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'vous appartenez déjà à une équipe';
  end if;

  loop
    new_code := 'RICK-' || lpad((floor(random()*9000)+1000)::int::text, 4, '0');
    exit when not exists (select 1 from public.teams where code = new_code);
  end loop;

  insert into public.teams (name, code, admin_id)
  values (trim(team_name), new_code, auth.uid())
  returning * into t;

  perform set_config('rick.role_change', 'on', true);
  update public.profiles set team_id = t.id, role = 'admin' where id = auth.uid();
  perform set_config('rick.role_change', 'off', true);
  return t;
end $$;

create or replace function public.join_team(invite_code text) returns public.teams
language plpgsql security definer set search_path = public as $$
declare t public.teams;
begin
  if auth.uid() is null then raise exception 'non authentifié'; end if;
  select * into t from public.teams where code = upper(trim(invite_code));
  if t.id is null then raise exception 'code d''invitation inconnu'; end if;
  if (select team_id from public.profiles where id = auth.uid()) is not null then
    raise exception 'vous appartenez déjà à une équipe';
  end if;

  perform set_config('rick.role_change', 'on', true);
  update public.profiles set team_id = t.id, role = 'equipier' where id = auth.uid();
  perform set_config('rick.role_change', 'off', true);
  return t;
end $$;

create or replace function public.promote_member(member uuid) returns void
language plpgsql security definer set search_path = public as $$
declare my_team uuid;
begin
  my_team := public.my_team_id();
  if my_team is null or not public.is_team_admin() then
    raise exception 'réservé à l''admin de l''équipe';
  end if;
  if not exists (select 1 from public.profiles where id = member and team_id = my_team) then
    raise exception 'ce compte n''est pas dans votre équipe';
  end if;

  perform set_config('rick.role_change', 'on', true);
  update public.profiles set role = 'admin' where id = member;
  perform set_config('rick.role_change', 'off', true);
end $$;

create or replace function public.leave_team() returns void
language plpgsql security definer set search_path = public as $$
begin
  perform set_config('rick.role_change', 'on', true);
  update public.profiles set team_id = null, role = 'admin' where id = auth.uid();
  perform set_config('rick.role_change', 'off', true);
end $$;

-- ------------------------------------------------------------------ RLS ----

alter table public.profiles        enable row level security;
alter table public.teams           enable row level security;
alter table public.categories      enable row level security;
alter table public.category_access enable row level security;
alter table public.memos           enable row level security;
alter table public.reminders       enable row level security;

-- profiles : son propre profil + ses coéquipiers
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or (team_id is not null and team_id = public.my_team_id()));

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- l'update est autorisé, mais le trigger bloque role / team_id
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- teams : uniquement la sienne
drop policy if exists teams_select on public.teams;
create policy teams_select on public.teams for select to authenticated
  using (id = public.my_team_id());

drop policy if exists teams_update on public.teams;
create policy teams_update on public.teams for update to authenticated
  using (id = public.my_team_id() and public.is_team_admin())
  with check (id = public.my_team_id() and public.is_team_admin());

-- categories : les siennes + celles de l'équipe auxquelles on a accès
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

drop policy if exists categories_insert on public.categories;
create policy categories_insert on public.categories for insert to authenticated
  with check (
    (owner_id = auth.uid() and team_id is null)
    or (team_id = public.my_team_id() and public.is_team_admin() and owner_id is null)
  );

drop policy if exists categories_write on public.categories;
create policy categories_write on public.categories for update to authenticated
  using (owner_id = auth.uid() or (team_id = public.my_team_id() and public.is_team_admin()))
  with check (owner_id = auth.uid() or (team_id = public.my_team_id() and public.is_team_admin()));

drop policy if exists categories_delete on public.categories;
create policy categories_delete on public.categories for delete to authenticated
  using (owner_id = auth.uid() or (team_id = public.my_team_id() and public.is_team_admin()));

-- category_access : lecture de ses propres droits, écriture réservée à l'admin
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

-- memos : les siens + ceux de l'équipe rangés dans une catégorie autorisée
drop policy if exists memos_select on public.memos;
create policy memos_select on public.memos for select to authenticated
  using (
    owner_id = auth.uid()
    or (
      team_id is not null and team_id = public.my_team_id()
      and (
        (category_id is not null and public.can_see_category(category_id))
        or (category_id is null and public.is_team_admin())
      )
    )
  );

drop policy if exists memos_insert on public.memos;
create policy memos_insert on public.memos for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists memos_update on public.memos;
create policy memos_update on public.memos for update to authenticated
  using (
    owner_id = auth.uid()
    or (team_id = public.my_team_id()
        and (public.is_team_admin()
             or (category_id is not null and public.can_see_category(category_id))))
  )
  with check (
    owner_id = auth.uid()
    or (team_id = public.my_team_id()
        and (public.is_team_admin()
             or (category_id is not null and public.can_see_category(category_id))))
  );

drop policy if exists memos_delete on public.memos;
create policy memos_delete on public.memos for delete to authenticated
  using (owner_id = auth.uid() or (team_id = public.my_team_id() and public.is_team_admin()));

-- reminders : strictement privés
drop policy if exists reminders_all on public.reminders;
create policy reminders_all on public.reminders for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- --------------------------------------------------- STOCKAGE DES AUDIOS ---
-- Un fichier par mémo : "<memo_id>.webm". Les policies s'appuient sur la RLS
-- de public.memos, donc un audio n'est lisible que si son mémo l'est.

insert into storage.buckets (id, name, public)
values ('memo-audio', 'memo-audio', false)
on conflict (id) do nothing;

drop policy if exists memo_audio_read on storage.objects;
create policy memo_audio_read on storage.objects for select to authenticated
  using (
    bucket_id = 'memo-audio'
    and exists (select 1 from public.memos m where m.id::text = split_part(name, '.', 1))
  );

drop policy if exists memo_audio_write on storage.objects;
create policy memo_audio_write on storage.objects for insert to authenticated
  with check (
    bucket_id = 'memo-audio'
    and exists (select 1 from public.memos m
                 where m.id::text = split_part(name, '.', 1) and m.owner_id = auth.uid())
  );

drop policy if exists memo_audio_delete on storage.objects;
create policy memo_audio_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'memo-audio'
    and exists (select 1 from public.memos m
                 where m.id::text = split_part(name, '.', 1)
                   and (m.owner_id = auth.uid()
                        or (m.team_id = public.my_team_id() and public.is_team_admin())))
  );
