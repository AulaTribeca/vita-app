-- VITA v3.0
-- Base saneada para calendario, vacaciones, viajes, contactos, edición/borrado y push.
-- Ejecutar completo en Supabase SQL Editor.
-- No borra datos.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_household_member(
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

-- SALUD
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  record_type text not null default 'note',
  occurred_at timestamptz not null default now(),
  value_text text,
  intensity integer,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_records enable row level security;

drop policy if exists "health_records_select_own" on public.health_records;
drop policy if exists "health_records_insert_own" on public.health_records;
drop policy if exists "health_records_update_own" on public.health_records;
drop policy if exists "health_records_delete_own" on public.health_records;
create policy "health_records_select_own" on public.health_records for select to authenticated using (owner_id = auth.uid());
create policy "health_records_insert_own" on public.health_records for insert to authenticated with check (owner_id = auth.uid());
create policy "health_records_update_own" on public.health_records for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "health_records_delete_own" on public.health_records for delete to authenticated using (owner_id = auth.uid());

-- HOGAR EXISTENTE, REPARACIÓN DE TABLAS
create table if not exists public.household_vehicles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  plate text,
  model text,
  active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  provider text,
  amount numeric(10,2),
  due_date date,
  frequency text not null default 'one_time',
  category text not null default 'other',
  status text not null default 'pending',
  paid_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'other',
  due_date date,
  status text not null default 'pending',
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CALENDARIO
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  visibility text not null default 'household' check (visibility in ('private', 'household')),
  event_type text not null default 'general',
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean not null default false,
  location text,
  amount numeric(10,2),
  status text not null default 'active',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- VACACIONES / VIAJES
create table if not exists public.travel_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  trip_title text,
  item_type text not null default 'activity',
  title text not null,
  start_at timestamptz,
  end_at timestamptz,
  provider text,
  booking_reference text,
  location text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CONTACTOS
create table if not exists public.household_contacts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  phone text,
  email text,
  website text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PUSH
create table if not exists public.web_push_subscriptions (
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

-- RLS HOGAR COMPARTIDO
do $$
declare t text;
begin
  foreach t in array array['household_vehicles','household_bills','household_tasks','calendar_events','travel_items','household_contacts','web_push_subscriptions']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Políticas hogar
drop policy if exists "household_vehicles_select_member" on public.household_vehicles;
drop policy if exists "household_vehicles_insert_member" on public.household_vehicles;
drop policy if exists "household_vehicles_update_member" on public.household_vehicles;
drop policy if exists "household_vehicles_delete_member" on public.household_vehicles;
create policy "household_vehicles_select_member" on public.household_vehicles for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_insert_member" on public.household_vehicles for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_update_member" on public.household_vehicles for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_delete_member" on public.household_vehicles for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "household_bills_select_member" on public.household_bills;
drop policy if exists "household_bills_insert_member" on public.household_bills;
drop policy if exists "household_bills_update_member" on public.household_bills;
drop policy if exists "household_bills_delete_member" on public.household_bills;
create policy "household_bills_select_member" on public.household_bills for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_bills_insert_member" on public.household_bills for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_bills_update_member" on public.household_bills for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_bills_delete_member" on public.household_bills for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "household_tasks_select_member" on public.household_tasks;
drop policy if exists "household_tasks_insert_member" on public.household_tasks;
drop policy if exists "household_tasks_update_member" on public.household_tasks;
drop policy if exists "household_tasks_delete_member" on public.household_tasks;
create policy "household_tasks_select_member" on public.household_tasks for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_insert_member" on public.household_tasks for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_update_member" on public.household_tasks for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_delete_member" on public.household_tasks for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "calendar_events_select" on public.calendar_events;
drop policy if exists "calendar_events_insert" on public.calendar_events;
drop policy if exists "calendar_events_update" on public.calendar_events;
drop policy if exists "calendar_events_delete" on public.calendar_events;
create policy "calendar_events_select" on public.calendar_events for select to authenticated using ((visibility = 'private' and owner_id = auth.uid()) or (visibility = 'household' and public.is_household_member(household_id, auth.uid())));
create policy "calendar_events_insert" on public.calendar_events for insert to authenticated with check ((visibility = 'private' and owner_id = auth.uid()) or (visibility = 'household' and public.is_household_member(household_id, auth.uid())));
create policy "calendar_events_update" on public.calendar_events for update to authenticated using ((visibility = 'private' and owner_id = auth.uid()) or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))) with check ((visibility = 'private' and owner_id = auth.uid()) or (visibility = 'household' and public.is_household_member(household_id, auth.uid())));
create policy "calendar_events_delete" on public.calendar_events for delete to authenticated using ((visibility = 'private' and owner_id = auth.uid()) or (visibility = 'household' and public.is_household_member(household_id, auth.uid())));

drop policy if exists "travel_items_select_member" on public.travel_items;
drop policy if exists "travel_items_insert_member" on public.travel_items;
drop policy if exists "travel_items_update_member" on public.travel_items;
drop policy if exists "travel_items_delete_member" on public.travel_items;
create policy "travel_items_select_member" on public.travel_items for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "travel_items_insert_member" on public.travel_items for insert to authenticated with check (public.is_household_member(household_id, auth.uid()));
create policy "travel_items_update_member" on public.travel_items for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "travel_items_delete_member" on public.travel_items for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "household_contacts_select_member" on public.household_contacts;
drop policy if exists "household_contacts_insert_member" on public.household_contacts;
drop policy if exists "household_contacts_update_member" on public.household_contacts;
drop policy if exists "household_contacts_delete_member" on public.household_contacts;
create policy "household_contacts_select_member" on public.household_contacts for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_contacts_insert_member" on public.household_contacts for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_contacts_update_member" on public.household_contacts for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_contacts_delete_member" on public.household_contacts for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "push_subscriptions_select_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_insert_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_update_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_delete_own" on public.web_push_subscriptions;
create policy "push_subscriptions_select_own" on public.web_push_subscriptions for select to authenticated using (owner_id = auth.uid());
create policy "push_subscriptions_insert_own" on public.web_push_subscriptions for insert to authenticated with check (owner_id = auth.uid());
create policy "push_subscriptions_update_own" on public.web_push_subscriptions for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "push_subscriptions_delete_own" on public.web_push_subscriptions for delete to authenticated using (owner_id = auth.uid());

-- Aviso impuesto renta 30 de junio para hogar compartido.
insert into public.household_bills (household_id, created_by, title, provider, due_date, frequency, category, status, notes)
select h.id, hm.user_id, 'Cargo domiciliación impuesto de la renta', 'AEAT', date '2026-06-30', 'one_time', 'tax', 'pending', 'A ambos os ha salido a pagar. Cargo domiciliado en cuenta.'
from public.households h
join public.household_members hm on hm.household_id = h.id and hm.status = 'active'
where lower(h.name) like '%patricia%'
limit 1
on conflict do nothing;

insert into public.calendar_events (household_id, owner_id, visibility, event_type, title, start_at, end_at, all_day, location, notes, status)
select h.id, null, 'household', 'tax', 'Cargo domiciliación impuesto de la renta', timestamptz '2026-06-30 09:00:00+02', null, true, 'Cuenta bancaria', 'A ambos os ha salido a pagar. Cargo domiciliado en cuenta.', 'active'
from public.households h
where lower(h.name) like '%patricia%'
and not exists (
  select 1 from public.calendar_events ce
  where ce.household_id = h.id
  and ce.event_type = 'tax'
  and ce.title = 'Cargo domiciliación impuesto de la renta'
  and ce.start_at::date = date '2026-06-30'
)
limit 1;

-- Índices
create index if not exists health_records_owner_date_idx on public.health_records(owner_id, occurred_at desc);
create index if not exists household_vehicles_household_idx on public.household_vehicles(household_id, active);
create index if not exists household_bills_household_due_idx on public.household_bills(household_id, due_date);
create index if not exists calendar_events_household_start_idx on public.calendar_events(household_id, start_at);
create index if not exists travel_items_household_start_idx on public.travel_items(household_id, start_at);
create index if not exists household_contacts_household_name_idx on public.household_contacts(household_id, name);
create index if not exists push_subscriptions_owner_enabled_idx on public.web_push_subscriptions(owner_id, enabled);

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('health_records','household_vehicles','household_bills','household_tasks','calendar_events','travel_items','household_contacts','web_push_subscriptions')
order by table_name;
