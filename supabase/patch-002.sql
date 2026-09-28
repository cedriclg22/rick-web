-- =============================================================================
--  Rick — patch 002
--  À exécuter dans Supabase Studio > SQL Editor, projet jjpkzrvkdqjryqyicqaa.
--  Idempotent : peut être relancé sans dommage.
--
--  1. Les nouveaux comptes n'ont plus les catégories Pro / Perso / Famille.
--     Seul cedric@lizia.fr les reçoit encore.
--  2. La profession choisie à l'inscription est stockée sur le profil.
--  3. Table `devices` : les Rick appairés, leur emplacement ou leur porteur,
--     et la catégorie dans laquelle ils rangent leurs enregistrements.
-- =============================================================================

-- ------------------------------------------------------------- PROFESSION --
alter table public.profiles
  add column if not exists profession text not null default 'personnel';

-- --------------------------------------------------- NOUVEAU COMPTE (v2) --
-- Le profil est créé comme avant, la profession vient des métadonnées d'auth,
-- et les trois catégories par défaut ne sont plus posées que pour le compte
-- de démonstration : un nouveau compte démarre avec une bibliothèque vide.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_profession text;
begin
  v_profession := coalesce(nullif(new.raw_user_meta_data->>'profession',''), 'personnel');

  insert into public.profiles (id, email, name, profession)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)),
    v_profession
  )
  on conflict (id) do nothing;

  if lower(new.email) = 'cedric@lizia.fr' then
    insert into public.categories (owner_id, name, icon, deco, custom) values
      (new.id, 'Pro',     '💼', '💼', false),
      (new.id, 'Perso',   '🧘', '🧘', false),
      (new.id, 'Famille', '❤️', '❤️', false);
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------- DEVICES --
-- Un Rick appartient à un compte, et peut être partagé à l'équipe.
-- `kind` distingue un lieu ('emplacement') d'une personne ('personne').
-- `category_id` : catégorie dans laquelle rangent ses enregistrements.
create table if not exists public.devices (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  team_id     uuid references public.teams(id) on delete set null,
  label       text not null,
  kind        text not null default 'emplacement' check (kind in ('emplacement','personne')),
  category_id uuid references public.categories(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists devices_owner_idx on public.devices(owner_id);
create index if not exists devices_team_idx  on public.devices(team_id);

alter table public.devices enable row level security;

-- On voit ses propres appareils, plus ceux partagés à son équipe.
drop policy if exists devices_select on public.devices;
create policy devices_select on public.devices for select to authenticated
  using (
    owner_id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id())
  );

-- On ne crée un appareil que pour soi, et on ne le rattache qu'à son équipe.
drop policy if exists devices_insert on public.devices;
create policy devices_insert on public.devices for insert to authenticated
  with check (
    owner_id = auth.uid()
    and (team_id is null or team_id = public.my_team_id())
  );

-- Modification et suppression réservées au propriétaire, ou à l'admin de
-- l'équipe pour les appareils partagés (réaffecter un Rick à un commercial).
drop policy if exists devices_update on public.devices;
create policy devices_update on public.devices for update to authenticated
  using (
    owner_id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id() and public.is_team_admin())
  )
  with check (
    owner_id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id() and public.is_team_admin())
  );

drop policy if exists devices_delete on public.devices;
create policy devices_delete on public.devices for delete to authenticated
  using (
    owner_id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id() and public.is_team_admin())
  );
