-- VITA ONE 2.0
-- Esquema limpio para asistente personal visual.
-- Ejecutar completo en Supabase SQL Editor.
-- No contiene secretos. No usa cron.

create extension if not exists pgcrypto;

create or replace function public.vita_one_is_household_member(
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

create table if not exists public.vita_one_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private',
  domain text not null default 'task',
  kind text not null default 'task',
  title text not null,
  details text,
  due_at timestamptz,
  notify_at timestamptz,
  done boolean not null default false,
  status text not null default 'open',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vita_one_cards
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists visibility text default 'private',
  add column if not exists domain text default 'task',
  add column if not exists kind text default 'task',
  add column if not exists title text,
  add column if not exists details text,
  add column if not exists due_at timestamptz,
  add column if not exists notify_at timestamptz,
  add column if not exists done boolean default false,
  add column if not exists status text default 'open',
  add column if not exists data jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.vita_one_cards drop constraint if exists vita_one_cards_visibility_check;
alter table public.vita_one_cards drop constraint if exists vita_one_cards_status_check;

alter table public.vita_one_cards
  add constraint vita_one_cards_visibility_check
  check (visibility in ('private','household'));

alter table public.vita_one_cards
  add constraint vita_one_cards_status_check
  check (status in ('open','archived','deleted'));

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

alter table public.vita_one_shopping_items
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists title text,
  add column if not exists category text default 'supermercado',
  add column if not exists checked boolean default false,
  add column if not exists note text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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

alter table public.vita_push_subscriptions
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists endpoint text,
  add column if not exists p256dh text,
  add column if not exists auth text,
  add column if not exists user_agent text,
  add column if not exists enabled boolean default true,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_error text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

alter table public.vita_one_cards enable row level security;
alter table public.vita_one_shopping_items enable row level security;
alter table public.vita_push_subscriptions enable row level security;

drop policy if exists "vita_one_cards_select" on public.vita_one_cards;
create policy "vita_one_cards_select" on public.vita_one_cards
for select to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_one_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_one_cards_insert" on public.vita_one_cards;
create policy "vita_one_cards_insert" on public.vita_one_cards
for insert to authenticated
with check (
  owner_id = auth.uid()
  and (
    visibility = 'private'
    or (visibility = 'household' and public.vita_one_is_household_member(household_id, auth.uid()))
  )
);

drop policy if exists "vita_one_cards_update" on public.vita_one_cards;
create policy "vita_one_cards_update" on public.vita_one_cards
for update to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_one_is_household_member(household_id, auth.uid()))
)
with check (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_one_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_one_cards_delete" on public.vita_one_cards;
create policy "vita_one_cards_delete" on public.vita_one_cards
for delete to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_one_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_one_shopping_all" on public.vita_one_shopping_items;
create policy "vita_one_shopping_all" on public.vita_one_shopping_items
for all to authenticated
using (public.vita_one_is_household_member(household_id, auth.uid()))
with check (public.vita_one_is_household_member(household_id, auth.uid()));

drop policy if exists "vita_push_select" on public.vita_push_subscriptions;
create policy "vita_push_select" on public.vita_push_subscriptions
for select to authenticated
using (owner_id = auth.uid());

drop policy if exists "vita_push_insert" on public.vita_push_subscriptions;
create policy "vita_push_insert" on public.vita_push_subscriptions
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "vita_push_update" on public.vita_push_subscriptions;
create policy "vita_push_update" on public.vita_push_subscriptions
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- Datos iniciales útiles, sin duplicar.
with patricia as (
  select p.id
  from public.profiles p
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_one_cards (owner_id, visibility, domain, kind, title, details, data)
select id, 'private', 'health', 'medication', 'Eutirox 112 microgramos', '1 comprimido/día en ayunas', jsonb_build_object('stock',37,'threshold',7,'dose','1 comprimido/día en ayunas')
from patricia
where not exists (
  select 1 from public.vita_one_cards v join patricia p on p.id = v.owner_id
  where v.domain = 'health' and v.kind = 'medication' and lower(v.title) = lower('Eutirox 112 microgramos')
);

with patricia as (
  select p.id
  from public.profiles p
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_one_cards (owner_id, visibility, domain, kind, title, details, data)
select id, 'private', 'health', 'medication', 'Bilasten 20 mg', '1 comprimido/día en ayunas', jsonb_build_object('stock',11,'threshold',7,'dose','1 comprimido/día en ayunas')
from patricia
where not exists (
  select 1 from public.vita_one_cards v join patricia p on p.id = v.owner_id
  where v.domain = 'health' and v.kind = 'medication' and lower(v.title) = lower('Bilasten 20 mg')
);

with patricia as (
  select p.id
  from public.profiles p
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_one_cards (owner_id, visibility, domain, kind, title, details, data)
select id, 'private', 'home', 'wallet', 'Eroski Club', 'Tarjeta útil para la compra.', jsonb_build_object('provider','Eroski')
from patricia
where not exists (
  select 1 from public.vita_one_cards v join patricia p on p.id = v.owner_id
  where v.domain = 'home' and v.kind = 'wallet' and lower(v.title) = lower('Eroski Club')
);

with patricia as (
  select p.id
  from public.profiles p
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_one_cards (owner_id, visibility, domain, kind, title, details, data)
select id, 'private', 'home', 'wallet', 'IKEA Family', 'Tarjeta útil del hogar.', jsonb_build_object('provider','IKEA')
from patricia
where not exists (
  select 1 from public.vita_one_cards v join patricia p on p.id = v.owner_id
  where v.domain = 'home' and v.kind = 'wallet' and lower(v.title) = lower('IKEA Family')
);

-- Cargo renta, uno por usuario.
insert into public.vita_one_cards (owner_id, household_id, visibility, domain, kind, title, details, due_at, data)
select p.id, hm.household_id, 'private', 'home', 'bill', 'Cargo renta 2026', 'Cargo domiciliado del impuesto de la renta. Ha salido a pagar.', timestamptz '2026-06-30 09:00:00+02', jsonb_build_object('type','tax')
from public.profiles p
join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (
  select 1 from public.vita_one_cards v
  where v.owner_id = p.id
  and v.domain = 'home'
  and v.kind = 'bill'
  and v.title = 'Cargo renta 2026'
  and v.due_at::date = date '2026-06-30'
);

create index if not exists vita_one_cards_owner_due_idx on public.vita_one_cards(owner_id, due_at);
create index if not exists vita_one_cards_household_idx on public.vita_one_cards(household_id);
create index if not exists vita_one_cards_domain_kind_idx on public.vita_one_cards(domain, kind);
create index if not exists vita_one_shopping_household_idx on public.vita_one_shopping_items(household_id, checked, created_at);
create unique index if not exists vita_push_endpoint_uidx on public.vita_push_subscriptions(endpoint);

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('vita_one_cards','vita_one_shopping_items','vita_push_subscriptions')
order by table_name;
