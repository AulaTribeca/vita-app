-- VITA v0.9
-- Citas médicas reales e historial de consulta.
--
-- Ejecutar en Supabase → SQL Editor antes de probar la pantalla Citas.

create table if not exists public.medical_appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  appointment_at timestamptz not null,
  location text,
  provider text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  notes text,
  summary text,
  discharge_given boolean not null default false,
  referral_given boolean not null default false,
  referral_for text,
  followup_needed boolean not null default false,
  needs_health_card boolean not null default true,
  needs_id_card boolean not null default false,
  needs_referral_document boolean not null default false,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists medical_appointments_set_updated_at on public.medical_appointments;
create trigger medical_appointments_set_updated_at
before update on public.medical_appointments
for each row execute function public.set_updated_at();

alter table public.medical_appointments enable row level security;

drop policy if exists "medical_appointments_select_own" on public.medical_appointments;
drop policy if exists "medical_appointments_insert_own" on public.medical_appointments;
drop policy if exists "medical_appointments_update_own" on public.medical_appointments;
drop policy if exists "medical_appointments_delete_own" on public.medical_appointments;

create policy "medical_appointments_select_own"
on public.medical_appointments
for select
to authenticated
using (owner_id = auth.uid());

create policy "medical_appointments_insert_own"
on public.medical_appointments
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "medical_appointments_update_own"
on public.medical_appointments
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "medical_appointments_delete_own"
on public.medical_appointments
for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists medical_appointments_owner_date_idx
on public.medical_appointments(owner_id, appointment_at desc);

create index if not exists medical_appointments_owner_status_idx
on public.medical_appointments(owner_id, status);

-- Comprobación.
select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'medical_appointments'
order by ordinal_position;
