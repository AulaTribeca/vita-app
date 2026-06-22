-- VITA v5.1
-- Reconstrucción limpia: una tabla central de tarjetas y una tabla de suscripciones push.
-- No borra tus tablas antiguas. Migra datos conocidos a vita_cards sin depender de estructuras antiguas.

create extension if not exists pgcrypto;

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

create table if not exists public.vita_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private',
  module text not null default 'tasks',
  category text,
  title text not null,
  details text,
  due_at timestamptz,
  notify_at timestamptz,
  notified_at timestamptz,
  last_notification_result jsonb,
  status text not null default 'open',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vita_cards
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists visibility text default 'private',
  add column if not exists module text default 'tasks',
  add column if not exists category text,
  add column if not exists title text,
  add column if not exists details text,
  add column if not exists due_at timestamptz,
  add column if not exists notify_at timestamptz,
  add column if not exists notified_at timestamptz,
  add column if not exists last_notification_result jsonb,
  add column if not exists status text default 'open',
  add column if not exists payload jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.vita_cards
set
  visibility = coalesce(nullif(visibility, ''), 'private'),
  module = coalesce(nullif(module, ''), 'tasks'),
  status = coalesce(nullif(status, ''), 'open'),
  payload = coalesce(payload, '{}'::jsonb);

alter table public.vita_cards
  alter column visibility set default 'private',
  alter column module set default 'tasks',
  alter column status set default 'open',
  alter column payload set default '{}'::jsonb;

alter table public.vita_cards drop constraint if exists vita_cards_visibility_check;
alter table public.vita_cards drop constraint if exists vita_cards_status_check;

alter table public.vita_cards
  add constraint vita_cards_visibility_check
  check (visibility in ('private','household'));

alter table public.vita_cards
  add constraint vita_cards_status_check
  check (status in ('open','done','archived','deleted'));

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

alter table public.vita_cards enable row level security;
alter table public.vita_push_subscriptions enable row level security;

drop policy if exists "vita_cards_select" on public.vita_cards;
create policy "vita_cards_select"
on public.vita_cards
for select to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_cards_insert" on public.vita_cards;
create policy "vita_cards_insert"
on public.vita_cards
for insert to authenticated
with check (
  owner_id = auth.uid()
  and (
    visibility = 'private'
    or (visibility = 'household' and public.vita_is_household_member(household_id, auth.uid()))
  )
);

drop policy if exists "vita_cards_update" on public.vita_cards;
create policy "vita_cards_update"
on public.vita_cards
for update to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_is_household_member(household_id, auth.uid()))
)
with check (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_cards_delete" on public.vita_cards;
create policy "vita_cards_delete"
on public.vita_cards
for delete to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.vita_is_household_member(household_id, auth.uid()))
);

drop policy if exists "vita_push_select" on public.vita_push_subscriptions;
create policy "vita_push_select"
on public.vita_push_subscriptions
for select to authenticated
using (owner_id = auth.uid());

drop policy if exists "vita_push_insert" on public.vita_push_subscriptions;
create policy "vita_push_insert"
on public.vita_push_subscriptions
for insert to authenticated
with check (owner_id = auth.uid());

drop policy if exists "vita_push_update" on public.vita_push_subscriptions;
create policy "vita_push_update"
on public.vita_push_subscriptions
for update to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "vita_push_delete" on public.vita_push_subscriptions;
create policy "vita_push_delete"
on public.vita_push_subscriptions
for delete to authenticated
using (owner_id = auth.uid());

-- Migración defensiva de datos anteriores, si las tablas existen.
do $$
begin
  if to_regclass('public.health_records') is not null then
    execute $mig$
      insert into public.vita_cards (owner_id, visibility, module, category, title, details, due_at, status, payload, created_at)
      select
        owner_id,
        'private',
        'health',
        record_type,
        coalesce(value_text, record_type, 'Registro de salud'),
        notes,
        occurred_at,
        'open',
        jsonb_build_object('intensity', intensity, 'legacy_id', id),
        coalesce(created_at, now())
      from public.health_records h
      where owner_id is not null
      and not exists (
        select 1 from public.vita_cards vc
        where vc.module = 'health'
        and vc.payload ->> 'legacy_id' = h.id::text
      )
    $mig$;
  end if;

  if to_regclass('public.medications') is not null then
    execute $mig$
      insert into public.vita_cards (owner_id, visibility, module, category, title, details, status, payload, created_at)
      select
        owner_id,
        'private',
        'medication',
        'medication',
        coalesce(name, 'Medicación'),
        dose_text,
        case when active is false then 'archived' else 'open' end,
        jsonb_build_object('stock', current_stock, 'warning', warning_threshold_days, 'dose', dose_text, 'legacy_id', id),
        coalesce(created_at, now())
      from public.medications m
      where owner_id is not null
      and not exists (
        select 1 from public.vita_cards vc
        where vc.module = 'medication'
        and vc.payload ->> 'legacy_id' = m.id::text
      )
    $mig$;
  end if;

  if to_regclass('public.medical_appointments') is not null then
    execute $mig$
      insert into public.vita_cards (owner_id, visibility, module, category, title, details, due_at, status, payload, created_at)
      select
        owner_id,
        'private',
        'medical',
        'appointment',
        coalesce(title, 'Cita médica'),
        coalesce(summary, notes, location),
        appointment_at,
        case when status = 'completed' then 'done' else 'open' end,
        jsonb_build_object('specialty', specialty, 'location', location, 'referral_given', referral_given, 'legacy_id', id),
        coalesce(created_at, now())
      from public.medical_appointments a
      where owner_id is not null
      and not exists (
        select 1 from public.vita_cards vc
        where vc.module = 'medical'
        and vc.payload ->> 'legacy_id' = a.id::text
      )
    $mig$;
  end if;

  if to_regclass('public.wallet_cards') is not null then
    execute $mig$
      insert into public.vita_cards (owner_id, visibility, module, category, title, details, status, payload, created_at)
      select
        owner_id,
        'private',
        'wallet',
        card_type,
        coalesce(name, 'Tarjeta'),
        notes,
        case when active is false then 'archived' else 'open' end,
        jsonb_build_object('provider', provider, 'card_number', card_number, 'show_in_shopping', show_in_shopping, 'legacy_id', id),
        coalesce(created_at, now())
      from public.wallet_cards w
      where owner_id is not null
      and not exists (
        select 1 from public.vita_cards vc
        where vc.module = 'wallet'
        and vc.payload ->> 'legacy_id' = w.id::text
      )
    $mig$;
  end if;

  if to_regclass('public.calendar_events') is not null then
    execute $mig$
      insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, due_at, status, payload, created_at)
      select
        owner_id,
        household_id,
        case when visibility = 'household' then 'household' else 'private' end,
        case when event_type = 'medical' then 'medical'
             when event_type = 'travel' or event_type = 'work_vacation' then 'travel'
             when event_type = 'tax' or event_type = 'bill' then 'home'
             else 'tasks' end,
        event_type,
        coalesce(title, 'Evento'),
        notes,
        start_at,
        case when status = 'active' then 'open' else coalesce(status, 'open') end,
        jsonb_build_object('location', location, 'legacy_id', id),
        coalesce(created_at, now())
      from public.calendar_events e
      where owner_id is not null
      and not exists (
        select 1 from public.vita_cards vc
        where vc.payload ->> 'legacy_id' = e.id::text
        and vc.title = e.title
      )
    $mig$;
  end if;
end $$;

-- Datos mínimos útiles, sin duplicar.
with patricia as (
  select p.id, hm.household_id
  from public.profiles p
  left join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, due_at, notify_at, status, payload)
select id, null, 'private', 'medication', 'medication', 'Eutirox 112 microgramos', '1 comprimido/día en ayunas', null, null, 'open', jsonb_build_object('dose','1 comprimido/día en ayunas','stock',37,'warning',7)
from patricia
where not exists (
  select 1 from public.vita_cards v
  join patricia p on p.id = v.owner_id
  where v.module = 'medication' and lower(v.title) = lower('Eutirox 112 microgramos')
);

with patricia as (
  select p.id, hm.household_id
  from public.profiles p
  left join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, due_at, notify_at, status, payload)
select id, null, 'private', 'medication', 'medication', 'Bilasten 20 mg', '1 comprimido/día en ayunas', null, null, 'open', jsonb_build_object('dose','1 comprimido/día en ayunas','stock',11,'warning',7)
from patricia
where not exists (
  select 1 from public.vita_cards v
  join patricia p on p.id = v.owner_id
  where v.module = 'medication' and lower(v.title) = lower('Bilasten 20 mg')
);

with patricia as (
  select p.id, hm.household_id
  from public.profiles p
  left join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, status, payload)
select id, null, 'private', 'wallet', 'loyalty', 'Eroski Club', 'Tarjeta de fidelización', 'open', jsonb_build_object('provider','Eroski','show_in_shopping',true)
from patricia
where not exists (
  select 1 from public.vita_cards v
  join patricia p on p.id = v.owner_id
  where v.module = 'wallet' and lower(v.title) = lower('Eroski Club')
);

with patricia as (
  select p.id, hm.household_id
  from public.profiles p
  left join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
  where p.email = 'patricia@vitaapp.com'
  limit 1
)
insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, status, payload)
select id, null, 'private', 'wallet', 'loyalty', 'IKEA Family', 'Tarjeta de fidelización', 'open', jsonb_build_object('provider','IKEA','show_in_shopping',true)
from patricia
where not exists (
  select 1 from public.vita_cards v
  join patricia p on p.id = v.owner_id
  where v.module = 'wallet' and lower(v.title) = lower('IKEA Family')
);

-- Cargo renta, uno por persona.
insert into public.vita_cards (owner_id, household_id, visibility, module, category, title, details, due_at, notify_at, status, payload)
select p.id, hm.household_id, 'private', 'home', 'tax', 'Cargo renta 2026', 'Cargo domiciliado del impuesto de la renta. Ha salido a pagar.', timestamptz '2026-06-30 09:00:00+02', timestamptz '2026-06-30 08:00:00+02', 'open', jsonb_build_object('type','tax')
from public.profiles p
join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (
  select 1 from public.vita_cards v
  where v.owner_id = p.id
  and v.module = 'home'
  and v.category = 'tax'
  and v.title = 'Cargo renta 2026'
  and v.due_at::date = date '2026-06-30'
);

create index if not exists vita_cards_owner_idx on public.vita_cards(owner_id);
create index if not exists vita_cards_household_idx on public.vita_cards(household_id);
create index if not exists vita_cards_module_idx on public.vita_cards(module);
create index if not exists vita_cards_due_idx on public.vita_cards(due_at);
create index if not exists vita_cards_notify_idx on public.vita_cards(notify_at) where notify_at is not null and notified_at is null;
create index if not exists vita_push_owner_idx on public.vita_push_subscriptions(owner_id);
create unique index if not exists vita_push_endpoint_uidx on public.vita_push_subscriptions(endpoint);

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('vita_cards','vita_push_subscriptions')
order by table_name;
