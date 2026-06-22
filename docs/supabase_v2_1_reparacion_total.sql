-- VITA v2.1
-- Reparación total de base de datos para evitar dependencias de versiones antiguas.
-- Ejecutar completo en Supabase → SQL Editor.
--
-- No borra datos. Crea o repara tablas, funciones, índices y políticas RLS.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_household_member(target_household_id uuid, target_user_id uuid)
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
      and hm.user_id = target_user_id
      and hm.status = 'active'
  );
$$;

-- SALUD
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  record_type text not null,
  occurred_at timestamptz not null default now(),
  value_text text,
  intensity integer check (intensity is null or intensity between 1 and 10),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.health_records
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists record_type text,
  add column if not exists occurred_at timestamptz default now(),
  add column if not exists value_text text,
  add column if not exists intensity integer,
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

drop trigger if exists health_records_set_updated_at on public.health_records;
create trigger health_records_set_updated_at before update on public.health_records
for each row execute function public.set_updated_at();

alter table public.health_records enable row level security;

drop policy if exists "health_records_select_own" on public.health_records;
drop policy if exists "health_records_insert_own" on public.health_records;
drop policy if exists "health_records_update_own" on public.health_records;
drop policy if exists "health_records_delete_own" on public.health_records;

create policy "health_records_select_own" on public.health_records for select to authenticated using (owner_id = auth.uid());
create policy "health_records_insert_own" on public.health_records for insert to authenticated with check (owner_id = auth.uid());
create policy "health_records_update_own" on public.health_records for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "health_records_delete_own" on public.health_records for delete to authenticated using (owner_id = auth.uid());

-- MEDICACIÓN
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  dose_text text,
  schedule_times text[] not null default '{}',
  units_per_box integer,
  current_stock integer not null default 0,
  warning_threshold_days integer not null default 7,
  active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medications
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists name text,
  add column if not exists dose_text text,
  add column if not exists schedule_times text[] default '{}',
  add column if not exists units_per_box integer,
  add column if not exists current_stock integer default 0,
  add column if not exists warning_threshold_days integer default 7,
  add column if not exists active boolean default true,
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

drop trigger if exists medications_set_updated_at on public.medications;
create trigger medications_set_updated_at before update on public.medications
for each row execute function public.set_updated_at();

alter table public.medications enable row level security;

drop policy if exists "medications_select_own" on public.medications;
drop policy if exists "medications_insert_own" on public.medications;
drop policy if exists "medications_update_own" on public.medications;
drop policy if exists "medications_delete_own" on public.medications;

create policy "medications_select_own" on public.medications for select to authenticated using (owner_id = auth.uid());
create policy "medications_insert_own" on public.medications for insert to authenticated with check (owner_id = auth.uid());
create policy "medications_update_own" on public.medications for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "medications_delete_own" on public.medications for delete to authenticated using (owner_id = auth.uid());

create table if not exists public.medication_dose_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  scheduled_time text not null,
  taken_at timestamptz not null default now(),
  status text not null default 'taken',
  notes text,
  created_at timestamptz not null default now()
);

alter table public.medication_dose_logs enable row level security;

drop policy if exists "medication_logs_select_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_insert_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_update_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_delete_own" on public.medication_dose_logs;

create policy "medication_logs_select_own" on public.medication_dose_logs for select to authenticated using (owner_id = auth.uid());
create policy "medication_logs_insert_own" on public.medication_dose_logs for insert to authenticated with check (owner_id = auth.uid());
create policy "medication_logs_update_own" on public.medication_dose_logs for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "medication_logs_delete_own" on public.medication_dose_logs for delete to authenticated using (owner_id = auth.uid());

-- HOGAR, FACTURAS, VEHÍCULOS Y GESTIONES
create table if not exists public.household_bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  provider text,
  amount numeric(10,2),
  due_date date,
  frequency text not null default 'monthly',
  category text not null default 'other',
  status text not null default 'pending',
  paid_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

alter table public.household_vehicles
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists created_by uuid references public.profiles(id) on delete cascade,
  add column if not exists name text,
  add column if not exists plate text,
  add column if not exists model text,
  add column if not exists active boolean default true,
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.vehicle_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  vehicle_id uuid not null references public.household_vehicles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  task_type text not null default 'other',
  due_date date,
  status text not null default 'pending',
  completed_at timestamptz,
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

do $$
declare t text;
begin
  foreach t in array array['household_bills','household_vehicles','vehicle_tasks','household_tasks']
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

drop policy if exists "household_bills_select_member" on public.household_bills;
drop policy if exists "household_bills_insert_member" on public.household_bills;
drop policy if exists "household_bills_update_member" on public.household_bills;
drop policy if exists "household_bills_delete_member" on public.household_bills;
create policy "household_bills_select_member" on public.household_bills for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_bills_insert_member" on public.household_bills for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_bills_update_member" on public.household_bills for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_bills_delete_member" on public.household_bills for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "household_vehicles_select_member" on public.household_vehicles;
drop policy if exists "household_vehicles_insert_member" on public.household_vehicles;
drop policy if exists "household_vehicles_update_member" on public.household_vehicles;
drop policy if exists "household_vehicles_delete_member" on public.household_vehicles;
create policy "household_vehicles_select_member" on public.household_vehicles for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_insert_member" on public.household_vehicles for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_update_member" on public.household_vehicles for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_vehicles_delete_member" on public.household_vehicles for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "vehicle_tasks_select_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_insert_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_update_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_delete_member" on public.vehicle_tasks;
create policy "vehicle_tasks_select_member" on public.vehicle_tasks for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "vehicle_tasks_insert_member" on public.vehicle_tasks for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "vehicle_tasks_update_member" on public.vehicle_tasks for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "vehicle_tasks_delete_member" on public.vehicle_tasks for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

drop policy if exists "household_tasks_select_member" on public.household_tasks;
drop policy if exists "household_tasks_insert_member" on public.household_tasks;
drop policy if exists "household_tasks_update_member" on public.household_tasks;
drop policy if exists "household_tasks_delete_member" on public.household_tasks;
create policy "household_tasks_select_member" on public.household_tasks for select to authenticated using (public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_insert_member" on public.household_tasks for insert to authenticated with check (created_by = auth.uid() and public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_update_member" on public.household_tasks for update to authenticated using (public.is_household_member(household_id, auth.uid())) with check (public.is_household_member(household_id, auth.uid()));
create policy "household_tasks_delete_member" on public.household_tasks for delete to authenticated using (public.is_household_member(household_id, auth.uid()));

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

alter table public.web_push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_insert_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_update_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_delete_own" on public.web_push_subscriptions;
create policy "push_subscriptions_select_own" on public.web_push_subscriptions for select to authenticated using (owner_id = auth.uid());
create policy "push_subscriptions_insert_own" on public.web_push_subscriptions for insert to authenticated with check (owner_id = auth.uid());
create policy "push_subscriptions_update_own" on public.web_push_subscriptions for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "push_subscriptions_delete_own" on public.web_push_subscriptions for delete to authenticated using (owner_id = auth.uid());

create table if not exists public.notification_preferences (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  medication boolean not null default true,
  appointments boolean not null default true,
  documents boolean not null default true,
  home boolean not null default true,
  health boolean not null default true,
  quiet_start time,
  quiet_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
drop policy if exists "notification_preferences_delete_own" on public.notification_preferences;
create policy "notification_preferences_select_own" on public.notification_preferences for select to authenticated using (owner_id = auth.uid());
create policy "notification_preferences_insert_own" on public.notification_preferences for insert to authenticated with check (owner_id = auth.uid());
create policy "notification_preferences_update_own" on public.notification_preferences for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "notification_preferences_delete_own" on public.notification_preferences for delete to authenticated using (owner_id = auth.uid());

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  dedupe_key text not null,
  title text not null,
  body text not null,
  target text not null default 'hoy',
  priority text not null default 'medium',
  due_at timestamptz not null default now(),
  sent_at timestamptz,
  dismissed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, dedupe_key)
);

alter table public.notification_events enable row level security;

drop policy if exists "notification_events_select_own" on public.notification_events;
drop policy if exists "notification_events_update_own" on public.notification_events;
create policy "notification_events_select_own" on public.notification_events for select to authenticated using (owner_id = auth.uid());
create policy "notification_events_update_own" on public.notification_events for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- ÍNDICES
create index if not exists health_records_owner_date_idx on public.health_records(owner_id, occurred_at desc);
create index if not exists medications_owner_active_idx on public.medications(owner_id, active);
create index if not exists medication_logs_owner_taken_idx on public.medication_dose_logs(owner_id, taken_at desc);
create index if not exists household_bills_household_due_idx on public.household_bills(household_id, due_date);
create index if not exists household_vehicles_household_idx on public.household_vehicles(household_id, active);
create index if not exists vehicle_tasks_household_due_idx on public.vehicle_tasks(household_id, due_date);
create index if not exists household_tasks_household_due_idx on public.household_tasks(household_id, due_date);
create index if not exists push_subscriptions_owner_enabled_idx on public.web_push_subscriptions(owner_id, enabled);

-- COMPROBACIÓN
select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in (
  'health_records',
  'medications',
  'medication_dose_logs',
  'household_bills',
  'household_vehicles',
  'vehicle_tasks',
  'household_tasks',
  'web_push_subscriptions',
  'notification_preferences',
  'notification_events'
)
order by table_name;
