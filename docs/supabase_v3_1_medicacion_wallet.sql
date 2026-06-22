-- VITA v3.1
-- Medicación directa, wallet y reparación de CRUD.
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

-- Medicación
create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  dose_text text,
  schedule_times text[] not null default '{08:00}',
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
  add column if not exists schedule_times text[] default '{08:00}',
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

-- Wallet
create table if not exists public.wallet_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  provider text,
  card_type text not null default 'loyalty',
  card_number text,
  barcode_value text,
  barcode_format text,
  show_in_shopping boolean not null default false,
  active boolean not null default true,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists wallet_cards_set_updated_at on public.wallet_cards;
create trigger wallet_cards_set_updated_at before update on public.wallet_cards
for each row execute function public.set_updated_at();

alter table public.wallet_cards enable row level security;

drop policy if exists "wallet_cards_select_own" on public.wallet_cards;
drop policy if exists "wallet_cards_insert_own" on public.wallet_cards;
drop policy if exists "wallet_cards_update_own" on public.wallet_cards;
drop policy if exists "wallet_cards_delete_own" on public.wallet_cards;
create policy "wallet_cards_select_own" on public.wallet_cards for select to authenticated using (owner_id = auth.uid());
create policy "wallet_cards_insert_own" on public.wallet_cards for insert to authenticated with check (owner_id = auth.uid());
create policy "wallet_cards_update_own" on public.wallet_cards for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "wallet_cards_delete_own" on public.wallet_cards for delete to authenticated using (owner_id = auth.uid());

-- Añadir medicación de Patricia sin duplicar por nombre.
with patricia as (
  select id from public.profiles where email = 'patricia@vitaapp.com' limit 1
)
insert into public.medications (owner_id, name, dose_text, schedule_times, units_per_box, current_stock, warning_threshold_days, active)
select id, 'Eutirox 112 microgramos', '1 comprimido/día en ayunas', array['08:00'], 100, 37, 7, true
from patricia
where not exists (
  select 1 from public.medications m
  join patricia p on p.id = m.owner_id
  where lower(m.name) = lower('Eutirox 112 microgramos')
);

with patricia as (
  select id from public.profiles where email = 'patricia@vitaapp.com' limit 1
)
insert into public.medications (owner_id, name, dose_text, schedule_times, units_per_box, current_stock, warning_threshold_days, active)
select id, 'Bilasten 20 mg', '1 comprimido/día en ayunas', array['08:00'], 20, 11, 7, true
from patricia
where not exists (
  select 1 from public.medications m
  join patricia p on p.id = m.owner_id
  where lower(m.name) = lower('Bilasten 20 mg')
);

-- Añadir tarjetas de Patricia sin duplicar.
with patricia as (
  select id from public.profiles where email = 'patricia@vitaapp.com' limit 1
)
insert into public.wallet_cards (owner_id, name, provider, card_type, show_in_shopping, active)
select id, 'Eroski Club', 'Eroski', 'loyalty', true, true
from patricia
where not exists (
  select 1 from public.wallet_cards w
  join patricia p on p.id = w.owner_id
  where lower(w.name) = lower('Eroski Club')
);

with patricia as (
  select id from public.profiles where email = 'patricia@vitaapp.com' limit 1
)
insert into public.wallet_cards (owner_id, name, provider, card_type, show_in_shopping, active)
select id, 'IKEA Family', 'IKEA', 'loyalty', true, true
from patricia
where not exists (
  select 1 from public.wallet_cards w
  join patricia p on p.id = w.owner_id
  where lower(w.name) = lower('IKEA Family')
);

create index if not exists medications_owner_active_idx on public.medications(owner_id, active);
create index if not exists wallet_cards_owner_active_idx on public.wallet_cards(owner_id, active);

select 'medications' as tabla, count(*) as registros from public.medications
union all
select 'wallet_cards' as tabla, count(*) as registros from public.wallet_cards;
