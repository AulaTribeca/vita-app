-- VITA v0.2
-- Núcleo inicial de seguridad: perfiles, hogar compartido y pertenencia al hogar.
-- Ejecutar en Supabase → SQL Editor → New query → Run.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  preferred_name text,
  avatar_initial text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  status text not null default 'active' check (status in ('active', 'invited', 'removed')),
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at
before update on public.households
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, preferred_name, avatar_initial)
  values (
    new.id,
    new.email,
    coalesce(split_part(new.email, '@', 1), 'Usuario'),
    upper(left(coalesce(new.email, 'U'), 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_household_member(target_household_id uuid, target_user_id uuid default auth.uid())
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = target_user_id
      and hm.status = 'active'
  );
$$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "households_select_member" on public.households;
create policy "households_select_member"
on public.households
for select
to authenticated
using (public.is_household_member(id, auth.uid()));

drop policy if exists "households_insert_creator" on public.households;
create policy "households_insert_creator"
on public.households
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "households_update_member" on public.households;
create policy "households_update_member"
on public.households
for update
to authenticated
using (public.is_household_member(id, auth.uid()))
with check (public.is_household_member(id, auth.uid()));

drop policy if exists "members_select_household" on public.household_members;
create policy "members_select_household"
on public.household_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_household_member(household_id, auth.uid())
);

drop policy if exists "members_insert_self" on public.household_members;
create policy "members_insert_self"
on public.household_members
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "members_update_self" on public.household_members;
create policy "members_update_self"
on public.household_members
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Tablas preparatorias para los niveles siguientes.
-- De momento quedan creadas con la misma lógica de privacidad, pero las conectaremos en VITA v0.3.

create table if not exists public.vita_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'household')),
  module text not null check (module in ('health', 'appointments', 'medication', 'home', 'university', 'bureaucracy', 'vehicles', 'bills')),
  item_type text not null,
  title text not null,
  description text,
  status text not null default 'active',
  due_at timestamptz,
  event_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists vita_items_set_updated_at on public.vita_items;
create trigger vita_items_set_updated_at
before update on public.vita_items
for each row execute function public.set_updated_at();

alter table public.vita_items enable row level security;

drop policy if exists "vita_items_select_visible" on public.vita_items;
create policy "vita_items_select_visible"
on public.vita_items
for select
to authenticated
using (
  owner_id = auth.uid()
  or (
    household_id is not null
    and visibility in ('shared', 'household')
    and public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "vita_items_insert_allowed" on public.vita_items;
create policy "vita_items_insert_allowed"
on public.vita_items
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    household_id is null
    or public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "vita_items_update_allowed" on public.vita_items;
create policy "vita_items_update_allowed"
on public.vita_items
for update
to authenticated
using (
  owner_id = auth.uid()
  or (
    household_id is not null
    and public.is_household_member(household_id, auth.uid())
  )
)
with check (
  owner_id = auth.uid()
  or (
    household_id is not null
    and public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "vita_items_delete_owner" on public.vita_items;
create policy "vita_items_delete_owner"
on public.vita_items
for delete
to authenticated
using (owner_id = auth.uid());
