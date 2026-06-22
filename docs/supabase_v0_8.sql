-- VITA v0.8
-- Registros reales de salud diaria.
--
-- Ejecutar en Supabase → SQL Editor antes de probar la pantalla Salud.

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  record_type text not null check (
    record_type in ('bathroom', 'symptoms', 'sleep', 'period', 'pain', 'mood', 'note')
  ),
  occurred_at timestamptz not null default now(),
  value_text text,
  intensity integer check (intensity is null or (intensity between 1 and 10)),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists health_records_set_updated_at on public.health_records;
create trigger health_records_set_updated_at
before update on public.health_records
for each row execute function public.set_updated_at();

alter table public.health_records enable row level security;

drop policy if exists "health_records_select_own" on public.health_records;
drop policy if exists "health_records_insert_own" on public.health_records;
drop policy if exists "health_records_update_own" on public.health_records;
drop policy if exists "health_records_delete_own" on public.health_records;

create policy "health_records_select_own"
on public.health_records
for select
to authenticated
using (owner_id = auth.uid());

create policy "health_records_insert_own"
on public.health_records
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "health_records_update_own"
on public.health_records
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "health_records_delete_own"
on public.health_records
for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists health_records_owner_occurred_idx
on public.health_records(owner_id, occurred_at desc);

create index if not exists health_records_owner_type_idx
on public.health_records(owner_id, record_type);

-- Comprobación.
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'health_records'
order by ordinal_position;
