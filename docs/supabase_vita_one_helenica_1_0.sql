-- VITA ONE HELÉNICA 1.0
-- SQL fundacional para proyecto limpio.
-- Ejecutar completo en Supabase SQL Editor.
-- No contiene cron, no contiene secretos y no depende de tablas antiguas.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Casa',
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert or update on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email, display_name)
select id, email, coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

create or replace function public.vita_bootstrap_user()
returns table(household_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  h uuid;
begin
  insert into public.profiles (id, email, display_name)
  select auth.uid(), auth.email(), coalesce(split_part(auth.email(), '@', 1), 'Usuario')
  where auth.uid() is not null
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

  select hm.household_id
  into h
  from public.household_members hm
  where hm.user_id = auth.uid()
    and hm.status = 'active'
  limit 1;

  if h is null then
    select id into h
    from public.households
    order by created_at asc
    limit 1;

    if h is null then
      insert into public.households (name)
      values ('Casa')
      returning id into h;
    end if;

    insert into public.household_members (household_id, user_id, role, status)
    values (h, auth.uid(), 'member', 'active')
    on conflict (household_id, user_id) do update
    set status = 'active';
  end if;

  return query select h;
end;
$$;

create or replace function public.vita_is_household_member(
  target_household_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = coalesce(target_user_id, auth.uid())
      and hm.status = 'active'
  );
$$;

create table if not exists public.vita_one_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private','household')),
  area text not null default 'tarea',
  kind text not null default 'task',
  title text not null,
  notes text,
  due_at timestamptz,
  notify_at timestamptz,
  done boolean not null default false,
  priority integer not null default 0,
  status text not null default 'open' check (status in ('open','archived','deleted')),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vita_one_shopping_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  category text not null default 'supermercado',
  checked boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vita_one_relations (
  id uuid primary key default gen_random_uuid(),
  source_item_id uuid not null references public.vita_one_items(id) on delete cascade,
  target_item_id uuid not null references public.vita_one_items(id) on delete cascade,
  relation_type text not null,
  created_at timestamptz not null default now(),
  unique(source_item_id, target_item_id, relation_type)
);

create table if not exists public.vita_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.vita_one_items enable row level security;
alter table public.vita_one_shopping_items enable row level security;
alter table public.vita_one_relations enable row level security;
alter table public.vita_push_subscriptions enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
for select to authenticated
using (id = auth.uid());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "households_member_select" on public.households;
create policy "households_member_select" on public.households
for select to authenticated
using (public.vita_is_household_member(id, auth.uid()));

drop policy if exists "household_members_member_select" on public.household_members;
create policy "household_members_member_select" on public.household_members
for select to authenticated
using (public.vita_is_household_member(household_id, auth.uid()));

drop policy if exists "vita_items_select" on public.vita_one_items;
create policy "vita_items_select" on public.vita_one_items
for select to authenticated
using (
  owner_id = auth.uid()
  or (
    visibility = 'household'
    and household_id is not null
    and public.vita_is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "vita_items_insert" on public.vita_one_items;
create policy "vita_items_insert" on public.vita_one_items
for insert to authenticated
with check (
  owner_id = auth.uid()
  and (
    visibility = 'private'
    or (
      visibility = 'household'
      and household_id is not null
      and public.vita_is_household_member(household_id, auth.uid())
    )
  )
);

drop policy if exists "vita_items_update" on public.vita_one_items;
create policy "vita_items_update" on public.vita_one_items
for update to authenticated
using (
  owner_id = auth.uid()
  or (
    visibility = 'household'
    and household_id is not null
    and public.vita_is_household_member(household_id, auth.uid())
  )
)
with check (
  owner_id = auth.uid()
  or (
    visibility = 'household'
    and household_id is not null
    and public.vita_is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "vita_items_delete" on public.vita_one_items;
create policy "vita_items_delete" on public.vita_one_items
for delete to authenticated
using (
  owner_id = auth.uid()
  or (
    visibility = 'household'
    and household_id is not null
    and public.vita_is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "shopping_household_all" on public.vita_one_shopping_items;
create policy "shopping_household_all" on public.vita_one_shopping_items
for all to authenticated
using (public.vita_is_household_member(household_id, auth.uid()))
with check (public.vita_is_household_member(household_id, auth.uid()));

drop policy if exists "relations_member_select" on public.vita_one_relations;
create policy "relations_member_select" on public.vita_one_relations
for select to authenticated
using (
  exists (
    select 1
    from public.vita_one_items i
    where i.id = source_item_id
      and (
        i.owner_id = auth.uid()
        or (i.visibility = 'household' and public.vita_is_household_member(i.household_id, auth.uid()))
      )
  )
);

drop policy if exists "relations_owner_insert" on public.vita_one_relations;
create policy "relations_owner_insert" on public.vita_one_relations
for insert to authenticated
with check (
  exists (
    select 1
    from public.vita_one_items i
    where i.id = source_item_id
      and (
        i.owner_id = auth.uid()
        or (i.visibility = 'household' and public.vita_is_household_member(i.household_id, auth.uid()))
      )
  )
);

drop policy if exists "push_self_select" on public.vita_push_subscriptions;
create policy "push_self_select" on public.vita_push_subscriptions
for select to authenticated
using (owner_id = auth.uid());

drop policy if exists "push_self_insert" on public.vita_push_subscriptions;
create policy "push_self_insert" on public.vita_push_subscriptions
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "push_self_update" on public.vita_push_subscriptions;
create policy "push_self_update" on public.vita_push_subscriptions
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create index if not exists vita_one_items_owner_due_idx on public.vita_one_items(owner_id, due_at);
create index if not exists vita_one_items_area_kind_idx on public.vita_one_items(area, kind);
create index if not exists vita_one_items_household_idx on public.vita_one_items(household_id);
create index if not exists vita_one_shopping_household_idx on public.vita_one_shopping_items(household_id, checked, created_at);
create index if not exists vita_one_relations_source_idx on public.vita_one_relations(source_item_id);
create unique index if not exists vita_push_endpoint_uidx on public.vita_push_subscriptions(endpoint);

grant execute on function public.vita_bootstrap_user() to authenticated;
grant execute on function public.vita_is_household_member(uuid, uuid) to authenticated;

select 'VITA ONE HELÉNICA 1.0 instalada' as resultado;
