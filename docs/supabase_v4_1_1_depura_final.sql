-- VITA v4.1.1
-- SQL defensivo final para estabilizar listas, calendario, citas, documentos, wallet y renta.
-- Ejecutar completo en Supabase SQL Editor.
-- No borra datos personales.

create extension if not exists pgcrypto;

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

-- =========================
-- TABLAS BASE DEFENSIVAS
-- =========================

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  visibility text default 'household',
  event_type text default 'general',
  title text,
  start_at timestamptz,
  end_at timestamptz,
  all_day boolean default false,
  location text,
  amount numeric(10,2),
  status text default 'active',
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.calendar_events
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists visibility text default 'household',
  add column if not exists event_type text default 'general',
  add column if not exists title text,
  add column if not exists start_at timestamptz,
  add column if not exists end_at timestamptz,
  add column if not exists all_day boolean default false,
  add column if not exists location text,
  add column if not exists amount numeric(10,2),
  add column if not exists status text default 'active',
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.medical_appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  title text,
  appointment_at timestamptz,
  specialty text,
  provider text,
  location text,
  status text default 'scheduled',
  notes text,
  summary text,
  referral_given boolean default false,
  referral_for text,
  followup_needed boolean default false,
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.medical_appointments
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists title text,
  add column if not exists appointment_at timestamptz,
  add column if not exists specialty text,
  add column if not exists provider text,
  add column if not exists location text,
  add column if not exists status text default 'scheduled',
  add column if not exists notes text,
  add column if not exists summary text,
  add column if not exists referral_given boolean default false,
  add column if not exists referral_for text,
  add column if not exists followup_needed boolean default false,
  add column if not exists completed_at timestamptz,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  appointment_id uuid references public.medical_appointments(id) on delete set null,
  title text,
  document_type text default 'referral',
  status text default 'pending_upload',
  related_specialty text,
  file_path text,
  file_name text,
  mime_type text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.medical_documents
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists appointment_id uuid references public.medical_appointments(id) on delete set null,
  add column if not exists title text,
  add column if not exists document_type text default 'referral',
  add column if not exists status text default 'pending_upload',
  add column if not exists related_specialty text,
  add column if not exists file_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text,
  dose_text text,
  schedule_times text[] default '{08:00}',
  units_per_box integer,
  current_stock integer default 0,
  warning_threshold_days integer default 7,
  active boolean default true,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
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

-- Shopping lists: compatible con esquemas antiguos que tenían name NOT NULL y esquemas nuevos con title.
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete cascade,
  list_type text default 'private',
  name text,
  title text,
  visibility text default 'private',
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shopping_lists
  add column if not exists household_id uuid references public.households(id) on delete cascade,
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists list_type text default 'private',
  add column if not exists name text,
  add column if not exists title text,
  add column if not exists visibility text default 'private',
  add column if not exists active boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.shopping_lists
set
  name = coalesce(name, title, 'Lista'),
  title = coalesce(title, name, 'Lista'),
  list_type = coalesce(list_type, 'private'),
  visibility = coalesce(visibility, 'private'),
  active = coalesce(active, true);

alter table public.shopping_lists
  alter column name set default 'Lista',
  alter column title set default 'Lista',
  alter column list_type set default 'private',
  alter column visibility set default 'private',
  alter column active set default true;

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.shopping_lists(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete cascade,
  title text,
  name text,
  quantity text,
  url text,
  image_url text,
  notes text,
  checked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shopping_list_items
  add column if not exists list_id uuid references public.shopping_lists(id) on delete cascade,
  add column if not exists created_by uuid references public.profiles(id) on delete cascade,
  add column if not exists title text,
  add column if not exists name text,
  add column if not exists quantity text,
  add column if not exists url text,
  add column if not exists image_url text,
  add column if not exists notes text,
  add column if not exists checked boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.shopping_list_items
set
  title = coalesce(title, name, 'Elemento'),
  name = coalesce(name, title, 'Elemento'),
  checked = coalesce(checked, false);

alter table public.shopping_list_items
  alter column title set default 'Elemento',
  alter column name set default 'Elemento',
  alter column checked set default false;

create table if not exists public.wishlist_viewers (
  id uuid default gen_random_uuid(),
  list_id uuid references public.shopping_lists(id) on delete cascade,
  item_id uuid references public.shopping_list_items(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.wishlist_viewers
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists list_id uuid references public.shopping_lists(id) on delete cascade,
  add column if not exists item_id uuid references public.shopping_list_items(id) on delete cascade,
  add column if not exists viewer_id uuid references public.profiles(id) on delete cascade,
  add column if not exists created_at timestamptz default now();

update public.wishlist_viewers set id = gen_random_uuid() where id is null;

do $$
declare pk_name text;
begin
  select conname into pk_name
  from pg_constraint
  where conrelid = 'public.wishlist_viewers'::regclass and contype = 'p';
  if pk_name is not null then
    execute format('alter table public.wishlist_viewers drop constraint %I', pk_name);
  end if;
end $$;

alter table public.wishlist_viewers
  alter column id set not null,
  alter column item_id drop not null,
  alter column list_id drop not null,
  alter column viewer_id drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.wishlist_viewers'::regclass and contype = 'p'
  ) then
    alter table public.wishlist_viewers add constraint wishlist_viewers_pkey primary key (id);
  end if;
end $$;

create table if not exists public.wallet_cards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text,
  provider text,
  card_type text default 'loyalty',
  card_number text,
  barcode_value text,
  barcode_format text,
  show_in_shopping boolean default false,
  active boolean default true,
  file_path text,
  file_name text,
  mime_type text,
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wallet_cards
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
  add column if not exists name text,
  add column if not exists provider text,
  add column if not exists card_type text default 'loyalty',
  add column if not exists card_number text,
  add column if not exists barcode_value text,
  add column if not exists barcode_format text,
  add column if not exists show_in_shopping boolean default false,
  add column if not exists active boolean default true,
  add column if not exists file_path text,
  add column if not exists file_name text,
  add column if not exists mime_type text,
  add column if not exists notes text,
  add column if not exists metadata jsonb default '{}'::jsonb,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Storage buckets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vita-medical-documents', 'vita-medical-documents', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vita-wallet-cards', 'vita-wallet-cards', false, 10485760, array['image/jpeg','image/png','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

-- =========================
-- RLS
-- =========================
do $$
declare t text;
begin
  foreach t in array array[
    'calendar_events','medical_appointments','medical_documents','medications',
    'shopping_lists','shopping_list_items','wishlist_viewers','wallet_cards'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

drop policy if exists "medical_appointments_all_own" on public.medical_appointments;
create policy "medical_appointments_all_own" on public.medical_appointments
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "medical_documents_all_own" on public.medical_documents;
create policy "medical_documents_all_own" on public.medical_documents
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "medications_all_own" on public.medications;
create policy "medications_all_own" on public.medications
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "wallet_cards_all_own" on public.wallet_cards;
create policy "wallet_cards_all_own" on public.wallet_cards
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "calendar_events_visible" on public.calendar_events;
create policy "calendar_events_visible" on public.calendar_events
for select to authenticated
using (
  (visibility = 'private' and owner_id = auth.uid())
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "calendar_events_insert_visible" on public.calendar_events;
create policy "calendar_events_insert_visible" on public.calendar_events
for insert to authenticated
with check (
  (visibility = 'private' and owner_id = auth.uid())
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "calendar_events_update_visible" on public.calendar_events;
create policy "calendar_events_update_visible" on public.calendar_events
for update to authenticated
using (
  (visibility = 'private' and owner_id = auth.uid())
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
)
with check (
  (visibility = 'private' and owner_id = auth.uid())
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "calendar_events_delete_visible" on public.calendar_events;
create policy "calendar_events_delete_visible" on public.calendar_events
for delete to authenticated
using (
  (visibility = 'private' and owner_id = auth.uid())
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "shopping_lists_select_visible" on public.shopping_lists;
create policy "shopping_lists_select_visible" on public.shopping_lists
for select to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
  or exists (select 1 from public.wishlist_viewers w where w.list_id = shopping_lists.id and w.viewer_id = auth.uid())
);

drop policy if exists "shopping_lists_insert_visible" on public.shopping_lists;
create policy "shopping_lists_insert_visible" on public.shopping_lists
for insert to authenticated
with check (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "shopping_lists_update_visible" on public.shopping_lists;
create policy "shopping_lists_update_visible" on public.shopping_lists
for update to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
)
with check (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "shopping_lists_delete_visible" on public.shopping_lists;
create policy "shopping_lists_delete_visible" on public.shopping_lists
for delete to authenticated
using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
);

drop policy if exists "shopping_items_select_visible" on public.shopping_list_items;
create policy "shopping_items_select_visible" on public.shopping_list_items
for select to authenticated
using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (
      l.owner_id = auth.uid()
      or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid()))
      or exists (select 1 from public.wishlist_viewers w where w.list_id = l.id and w.viewer_id = auth.uid())
      or exists (select 1 from public.wishlist_viewers w where w.item_id = shopping_list_items.id and w.viewer_id = auth.uid())
    )
  )
);

drop policy if exists "shopping_items_insert_visible" on public.shopping_list_items;
create policy "shopping_items_insert_visible" on public.shopping_list_items
for insert to authenticated
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid())))
  )
);

drop policy if exists "shopping_items_update_visible" on public.shopping_list_items;
create policy "shopping_items_update_visible" on public.shopping_list_items
for update to authenticated
using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid())))
  )
)
with check (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid())))
  )
);

drop policy if exists "shopping_items_delete_visible" on public.shopping_list_items;
create policy "shopping_items_delete_visible" on public.shopping_list_items
for delete to authenticated
using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid())))
  )
);

drop policy if exists "wishlist_viewers_select_visible" on public.wishlist_viewers;
create policy "wishlist_viewers_select_visible" on public.wishlist_viewers
for select to authenticated
using (
  viewer_id = auth.uid()
  or exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
  or exists (
    select 1 from public.shopping_list_items i
    join public.shopping_lists l on l.id = i.list_id
    where i.id = wishlist_viewers.item_id and l.owner_id = auth.uid()
  )
);

drop policy if exists "wishlist_viewers_all_owner" on public.wishlist_viewers;
create policy "wishlist_viewers_all_owner" on public.wishlist_viewers
for all to authenticated
using (
  exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
  or exists (
    select 1 from public.shopping_list_items i
    join public.shopping_lists l on l.id = i.list_id
    where i.id = wishlist_viewers.item_id and l.owner_id = auth.uid()
  )
)
with check (
  exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
  or exists (
    select 1 from public.shopping_list_items i
    join public.shopping_lists l on l.id = i.list_id
    where i.id = wishlist_viewers.item_id and l.owner_id = auth.uid()
  )
);

drop policy if exists "medical_documents_storage_own" on storage.objects;
create policy "medical_documents_storage_own" on storage.objects
for all to authenticated
using (bucket_id = 'vita-medical-documents' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'vita-medical-documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "wallet_cards_storage_own" on storage.objects;
create policy "wallet_cards_storage_own" on storage.objects
for all to authenticated
using (bucket_id = 'vita-wallet-cards' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'vita-wallet-cards' and (storage.foldername(name))[1] = auth.uid()::text);

-- =========================
-- DATOS BASE
-- =========================

-- Una única lista de compra compartida por hogar. Incluye name y title para evitar NOT NULL antiguos.
insert into public.shopping_lists (household_id, owner_id, list_type, name, title, visibility, active)
select hm.household_id, min(hm.user_id::text)::uuid, 'shared', 'Lista de la compra', 'Lista de la compra', 'household', true
from public.household_members hm
where hm.status = 'active'
group by hm.household_id
having not exists (
  select 1 from public.shopping_lists l
  where l.household_id = hm.household_id
  and l.list_type = 'shared'
  and l.visibility = 'household'
);

-- Lista privada por usuario.
insert into public.shopping_lists (household_id, owner_id, list_type, name, title, visibility, active)
select hm.household_id, hm.user_id, 'private', 'Mi lista privada', 'Mi lista privada', 'private', true
from public.household_members hm
where hm.status = 'active'
and not exists (
  select 1 from public.shopping_lists l
  where l.owner_id = hm.user_id and l.list_type = 'private'
);

-- Lista de deseos por usuario.
insert into public.shopping_lists (household_id, owner_id, list_type, name, title, visibility, active)
select hm.household_id, hm.user_id, 'wishlist', 'Mis deseos', 'Mis deseos', 'selected', true
from public.household_members hm
where hm.status = 'active'
and not exists (
  select 1 from public.shopping_lists l
  where l.owner_id = hm.user_id and l.list_type = 'wishlist'
);

update public.shopping_list_items i
set created_by = l.owner_id
from public.shopping_lists l
where i.list_id = l.id
and i.created_by is null
and l.owner_id is not null;

-- Medicación Patricia.
with patricia as (select id from public.profiles where email = 'patricia@vitaapp.com' limit 1)
insert into public.medications (owner_id, name, dose_text, schedule_times, units_per_box, current_stock, warning_threshold_days, active)
select id, 'Eutirox 112 microgramos', '1 comprimido/día en ayunas', array['08:00'], 100, 37, 7, true from patricia
where not exists (select 1 from public.medications m join patricia p on p.id = m.owner_id where lower(m.name) = lower('Eutirox 112 microgramos'));

with patricia as (select id from public.profiles where email = 'patricia@vitaapp.com' limit 1)
insert into public.medications (owner_id, name, dose_text, schedule_times, units_per_box, current_stock, warning_threshold_days, active)
select id, 'Bilasten 20 mg', '1 comprimido/día en ayunas', array['08:00'], 20, 11, 7, true from patricia
where not exists (select 1 from public.medications m join patricia p on p.id = m.owner_id where lower(m.name) = lower('Bilasten 20 mg'));

-- Wallet Patricia.
with patricia as (select id from public.profiles where email = 'patricia@vitaapp.com' limit 1)
insert into public.wallet_cards (owner_id, name, provider, card_type, show_in_shopping, active)
select id, 'Eroski Club', 'Eroski', 'loyalty', true, true from patricia
where not exists (select 1 from public.wallet_cards w join patricia p on p.id = w.owner_id where lower(w.name) = lower('Eroski Club'));

with patricia as (select id from public.profiles where email = 'patricia@vitaapp.com' limit 1)
insert into public.wallet_cards (owner_id, name, provider, card_type, show_in_shopping, active)
select id, 'IKEA Family', 'IKEA', 'loyalty', true, true from patricia
where not exists (select 1 from public.wallet_cards w join patricia p on p.id = w.owner_id where lower(w.name) = lower('IKEA Family'));

-- Renta: limpiar duplicados genéricos y dejar un evento privado por persona.
delete from public.household_bills
where lower(title) in (lower('Cargo domiciliación impuesto de la renta'), lower('Cargo renta 2026'));

delete from public.calendar_events
where lower(title) = lower('Cargo domiciliación impuesto de la renta');

insert into public.calendar_events (household_id, owner_id, visibility, event_type, title, start_at, all_day, location, notes, status)
select hm.household_id, p.id, 'private', 'tax', 'Cargo renta 2026', timestamptz '2026-06-30 09:00:00+02', true, 'Cuenta bancaria', 'Cargo domiciliado del impuesto de la renta. Ha salido a pagar.', 'active'
from public.profiles p
join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (
  select 1 from public.calendar_events ce
  where ce.owner_id = p.id
  and ce.event_type = 'tax'
  and ce.title = 'Cargo renta 2026'
  and ce.start_at::date = date '2026-06-30'
);

with ranked as (
  select id, row_number() over (partition by owner_id, title, start_at::date order by created_at, id) as rn
  from public.calendar_events
  where title = 'Cargo renta 2026'
  and start_at::date = date '2026-06-30'
)
delete from public.calendar_events ce
using ranked r
where ce.id = r.id and r.rn > 1;

-- Índices.
create unique index if not exists wishlist_viewers_list_viewer_uidx on public.wishlist_viewers(list_id, viewer_id) where list_id is not null and viewer_id is not null;
create unique index if not exists wishlist_viewers_item_viewer_uidx on public.wishlist_viewers(item_id, viewer_id) where item_id is not null and viewer_id is not null;
create index if not exists calendar_events_start_idx on public.calendar_events(start_at);
create index if not exists appointments_owner_date_idx on public.medical_appointments(owner_id, appointment_at);
create index if not exists documents_owner_status_idx on public.medical_documents(owner_id, status);
create index if not exists medications_owner_active_idx on public.medications(owner_id, active);
create index if not exists shopping_lists_owner_type_idx on public.shopping_lists(owner_id, list_type);
create index if not exists shopping_items_list_idx on public.shopping_list_items(list_id);
create index if not exists shopping_items_created_by_idx on public.shopping_list_items(created_by);
create index if not exists wallet_cards_owner_idx on public.wallet_cards(owner_id, active);

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in (
  'calendar_events',
  'medical_appointments',
  'medical_documents',
  'medications',
  'shopping_lists',
  'shopping_list_items',
  'wishlist_viewers',
  'wallet_cards'
)
order by table_name;
