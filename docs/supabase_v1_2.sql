-- VITA v1.2
-- Hogar compartido: facturas, vehículos y gestiones.
--
-- Ejecutar en Supabase → SQL Editor antes de probar la pantalla Hogar.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Facturas y suministros
create table if not exists public.household_bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  provider text,
  amount numeric(10,2),
  due_date date,
  frequency text not null default 'monthly' check (frequency in ('monthly', 'bimonthly', 'quarterly', 'yearly', 'one_time')),
  category text not null default 'other' check (category in ('electricity', 'water', 'phone', 'mortgage', 'insurance', 'tax', 'subscription', 'other')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'reviewed', 'claimed')),
  paid_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists household_bills_set_updated_at on public.household_bills;
create trigger household_bills_set_updated_at
before update on public.household_bills
for each row execute function public.set_updated_at();

alter table public.household_bills enable row level security;

drop policy if exists "household_bills_select_member" on public.household_bills;
drop policy if exists "household_bills_insert_member" on public.household_bills;
drop policy if exists "household_bills_update_member" on public.household_bills;
drop policy if exists "household_bills_delete_member" on public.household_bills;

create policy "household_bills_select_member"
on public.household_bills
for select
to authenticated
using (public.is_household_member(household_id, auth.uid()));

create policy "household_bills_insert_member"
on public.household_bills
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_household_member(household_id, auth.uid())
);

create policy "household_bills_update_member"
on public.household_bills
for update
to authenticated
using (public.is_household_member(household_id, auth.uid()))
with check (public.is_household_member(household_id, auth.uid()));

create policy "household_bills_delete_member"
on public.household_bills
for delete
to authenticated
using (public.is_household_member(household_id, auth.uid()));

-- Vehículos
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

drop trigger if exists household_vehicles_set_updated_at on public.household_vehicles;
create trigger household_vehicles_set_updated_at
before update on public.household_vehicles
for each row execute function public.set_updated_at();

alter table public.household_vehicles enable row level security;

drop policy if exists "household_vehicles_select_member" on public.household_vehicles;
drop policy if exists "household_vehicles_insert_member" on public.household_vehicles;
drop policy if exists "household_vehicles_update_member" on public.household_vehicles;
drop policy if exists "household_vehicles_delete_member" on public.household_vehicles;

create policy "household_vehicles_select_member"
on public.household_vehicles
for select
to authenticated
using (public.is_household_member(household_id, auth.uid()));

create policy "household_vehicles_insert_member"
on public.household_vehicles
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_household_member(household_id, auth.uid())
);

create policy "household_vehicles_update_member"
on public.household_vehicles
for update
to authenticated
using (public.is_household_member(household_id, auth.uid()))
with check (public.is_household_member(household_id, auth.uid()));

create policy "household_vehicles_delete_member"
on public.household_vehicles
for delete
to authenticated
using (public.is_household_member(household_id, auth.uid()));

-- Avisos de vehículo
create table if not exists public.vehicle_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  vehicle_id uuid not null references public.household_vehicles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  task_type text not null default 'other' check (task_type in ('itv', 'insurance', 'tax', 'maintenance', 'tires', 'other')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists vehicle_tasks_set_updated_at on public.vehicle_tasks;
create trigger vehicle_tasks_set_updated_at
before update on public.vehicle_tasks
for each row execute function public.set_updated_at();

alter table public.vehicle_tasks enable row level security;

drop policy if exists "vehicle_tasks_select_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_insert_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_update_member" on public.vehicle_tasks;
drop policy if exists "vehicle_tasks_delete_member" on public.vehicle_tasks;

create policy "vehicle_tasks_select_member"
on public.vehicle_tasks
for select
to authenticated
using (public.is_household_member(household_id, auth.uid()));

create policy "vehicle_tasks_insert_member"
on public.vehicle_tasks
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_household_member(household_id, auth.uid())
);

create policy "vehicle_tasks_update_member"
on public.vehicle_tasks
for update
to authenticated
using (public.is_household_member(household_id, auth.uid()))
with check (public.is_household_member(household_id, auth.uid()));

create policy "vehicle_tasks_delete_member"
on public.vehicle_tasks
for delete
to authenticated
using (public.is_household_member(household_id, auth.uid()));

-- Gestiones comunes
create table if not exists public.household_tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null default 'other' check (category in ('house', 'bureaucracy', 'university', 'finance', 'works', 'other')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  completed_at timestamptz,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists household_tasks_set_updated_at on public.household_tasks;
create trigger household_tasks_set_updated_at
before update on public.household_tasks
for each row execute function public.set_updated_at();

alter table public.household_tasks enable row level security;

drop policy if exists "household_tasks_select_member" on public.household_tasks;
drop policy if exists "household_tasks_insert_member" on public.household_tasks;
drop policy if exists "household_tasks_update_member" on public.household_tasks;
drop policy if exists "household_tasks_delete_member" on public.household_tasks;

create policy "household_tasks_select_member"
on public.household_tasks
for select
to authenticated
using (public.is_household_member(household_id, auth.uid()));

create policy "household_tasks_insert_member"
on public.household_tasks
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_household_member(household_id, auth.uid())
);

create policy "household_tasks_update_member"
on public.household_tasks
for update
to authenticated
using (public.is_household_member(household_id, auth.uid()))
with check (public.is_household_member(household_id, auth.uid()));

create policy "household_tasks_delete_member"
on public.household_tasks
for delete
to authenticated
using (public.is_household_member(household_id, auth.uid()));

-- Índices
create index if not exists household_bills_household_due_idx on public.household_bills(household_id, due_date);
create index if not exists household_vehicles_household_idx on public.household_vehicles(household_id, active);
create index if not exists vehicle_tasks_household_due_idx on public.vehicle_tasks(household_id, due_date);
create index if not exists household_tasks_household_due_idx on public.household_tasks(household_id, due_date);

-- Comprobación.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('household_bills', 'household_vehicles', 'vehicle_tasks', 'household_tasks')
order by table_name;
