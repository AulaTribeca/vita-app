-- VITA v1.1
-- Medicación, tomas diarias y control de stock.
--
-- Ejecutar en Supabase → SQL Editor antes de probar la pantalla Medicación.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  dose_text text,
  schedule_times text[] not null default '{}',
  units_per_box integer check (units_per_box is null or units_per_box > 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  warning_threshold_days integer not null default 7 check (warning_threshold_days >= 1),
  active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists medications_set_updated_at on public.medications;
create trigger medications_set_updated_at
before update on public.medications
for each row execute function public.set_updated_at();

alter table public.medications enable row level security;

drop policy if exists "medications_select_own" on public.medications;
drop policy if exists "medications_insert_own" on public.medications;
drop policy if exists "medications_update_own" on public.medications;
drop policy if exists "medications_delete_own" on public.medications;

create policy "medications_select_own"
on public.medications
for select
to authenticated
using (owner_id = auth.uid());

create policy "medications_insert_own"
on public.medications
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "medications_update_own"
on public.medications
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "medications_delete_own"
on public.medications
for delete
to authenticated
using (owner_id = auth.uid());

create table if not exists public.medication_dose_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  medication_id uuid not null references public.medications(id) on delete cascade,
  scheduled_time text not null,
  taken_at timestamptz not null default now(),
  status text not null default 'taken' check (status in ('taken', 'skipped')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.medication_dose_logs enable row level security;

drop policy if exists "medication_logs_select_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_insert_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_update_own" on public.medication_dose_logs;
drop policy if exists "medication_logs_delete_own" on public.medication_dose_logs;

create policy "medication_logs_select_own"
on public.medication_dose_logs
for select
to authenticated
using (owner_id = auth.uid());

create policy "medication_logs_insert_own"
on public.medication_dose_logs
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.medications m
    where m.id = medication_dose_logs.medication_id
      and m.owner_id = auth.uid()
  )
);

create policy "medication_logs_update_own"
on public.medication_dose_logs
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "medication_logs_delete_own"
on public.medication_dose_logs
for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists medications_owner_active_idx
on public.medications(owner_id, active);

create index if not exists medication_logs_owner_taken_idx
on public.medication_dose_logs(owner_id, taken_at desc);

create index if not exists medication_logs_medication_taken_idx
on public.medication_dose_logs(medication_id, taken_at desc);

-- Comprobación.
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in ('medications', 'medication_dose_logs')
order by table_name, ordinal_position;
