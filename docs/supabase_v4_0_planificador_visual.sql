
-- VITA v4.0
-- Planificador visual: calendario, citas médicas, volantes y listas.
-- Ejecutar completo en Supabase SQL Editor. No borra datos personales, salvo duplicados genéricos del aviso de renta.

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

create table if not exists public.medical_appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  appointment_at timestamptz not null,
  specialty text,
  provider text,
  location text,
  status text not null default 'scheduled',
  notes text,
  summary text,
  referral_given boolean not null default false,
  referral_for text,
  followup_needed boolean not null default false,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.medical_appointments
  add column if not exists specialty text,
  add column if not exists provider text,
  add column if not exists location text,
  add column if not exists summary text,
  add column if not exists referral_given boolean default false,
  add column if not exists referral_for text,
  add column if not exists followup_needed boolean default false,
  add column if not exists completed_at timestamptz;

create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.medical_appointments(id) on delete set null,
  title text not null,
  document_type text not null default 'referral',
  status text not null default 'pending_upload',
  related_specialty text,
  file_path text,
  file_name text,
  mime_type text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  list_type text not null default 'private',
  title text not null,
  visibility text not null default 'private',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  quantity text,
  url text,
  image_url text,
  notes text,
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_viewers (
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, viewer_id)
);

alter table public.medical_appointments enable row level security;
alter table public.medical_documents enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.wishlist_viewers enable row level security;

drop policy if exists "medical_appointments_all_own" on public.medical_appointments;
create policy "medical_appointments_all_own" on public.medical_appointments
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "medical_documents_all_own" on public.medical_documents;
create policy "medical_documents_all_own" on public.medical_documents
for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "shopping_lists_select_visible" on public.shopping_lists;
create policy "shopping_lists_select_visible" on public.shopping_lists
for select to authenticated using (
  owner_id = auth.uid()
  or (visibility = 'household' and public.is_household_member(household_id, auth.uid()))
  or exists (select 1 from public.wishlist_viewers w where w.list_id = shopping_lists.id and w.viewer_id = auth.uid())
);

drop policy if exists "shopping_lists_insert_own" on public.shopping_lists;
create policy "shopping_lists_insert_own" on public.shopping_lists
for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "shopping_lists_update_own" on public.shopping_lists;
create policy "shopping_lists_update_own" on public.shopping_lists
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "shopping_lists_delete_own" on public.shopping_lists;
create policy "shopping_lists_delete_own" on public.shopping_lists
for delete to authenticated using (owner_id = auth.uid());

drop policy if exists "shopping_items_select_visible" on public.shopping_list_items;
create policy "shopping_items_select_visible" on public.shopping_list_items
for select to authenticated using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (
      l.owner_id = auth.uid()
      or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid()))
      or exists (select 1 from public.wishlist_viewers w where w.list_id = l.id and w.viewer_id = auth.uid())
    )
  )
);

drop policy if exists "shopping_items_insert_visible" on public.shopping_list_items;
create policy "shopping_items_insert_visible" on public.shopping_list_items
for insert to authenticated with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid())))
  )
);

drop policy if exists "shopping_items_update_visible" on public.shopping_list_items;
create policy "shopping_items_update_visible" on public.shopping_list_items
for update to authenticated using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid()))
    )
  )
);

drop policy if exists "shopping_items_delete_visible" on public.shopping_list_items;
create policy "shopping_items_delete_visible" on public.shopping_list_items
for delete to authenticated using (
  exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.list_id
    and (l.owner_id = auth.uid() or (l.visibility = 'household' and public.is_household_member(l.household_id, auth.uid()))
    )
  )
);

drop policy if exists "wishlist_viewers_select_visible" on public.wishlist_viewers;
create policy "wishlist_viewers_select_visible" on public.wishlist_viewers
for select to authenticated using (
  viewer_id = auth.uid()
  or exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
);

drop policy if exists "wishlist_viewers_all_owner" on public.wishlist_viewers;
create policy "wishlist_viewers_all_owner" on public.wishlist_viewers
for all to authenticated using (
  exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
) with check (
  exists (select 1 from public.shopping_lists l where l.id = wishlist_viewers.list_id and l.owner_id = auth.uid())
);

-- Limpieza cargo renta duplicado genérico.
delete from public.household_bills
where lower(title) = lower('Cargo domiciliación impuesto de la renta');

delete from public.calendar_events
where lower(title) = lower('Cargo domiciliación impuesto de la renta');

-- Cargo renta, uno por usuario, privado, 30 de junio.
insert into public.calendar_events (household_id, owner_id, visibility, event_type, title, start_at, all_day, location, notes, status)
select hm.household_id, p.id, 'private', 'tax', 'Cargo renta 2026', timestamptz '2026-06-30 09:00:00+02', true, 'Cuenta bancaria', 'Cargo domiciliado del impuesto de la renta. Ha salido a pagar.', 'active'
from public.profiles p
join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (
  select 1 from public.calendar_events ce
  where ce.owner_id = p.id and ce.event_type='tax' and ce.title='Cargo renta 2026' and ce.start_at::date = date '2026-06-30'
);

-- Listas por usuario y hogar.
insert into public.shopping_lists (household_id, owner_id, list_type, title, visibility, active)
select hm.household_id, p.id, 'shared', 'Lista de la compra', 'household', true
from public.profiles p join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (select 1 from public.shopping_lists l where l.owner_id = p.id and l.list_type = 'shared');

insert into public.shopping_lists (household_id, owner_id, list_type, title, visibility, active)
select hm.household_id, p.id, 'private', 'Mi lista privada', 'private', true
from public.profiles p join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (select 1 from public.shopping_lists l where l.owner_id = p.id and l.list_type = 'private');

insert into public.shopping_lists (household_id, owner_id, list_type, title, visibility, active)
select hm.household_id, p.id, 'wishlist', 'Mis deseos', 'selected', true
from public.profiles p join public.household_members hm on hm.user_id = p.id and hm.status = 'active'
where p.email in ('patricia@vitaapp.com','roman@vitaapp.com')
and not exists (select 1 from public.shopping_lists l where l.owner_id = p.id and l.list_type = 'wishlist');

create index if not exists appointments_owner_date_idx on public.medical_appointments(owner_id, appointment_at);
create index if not exists documents_owner_status_idx on public.medical_documents(owner_id, status);
create index if not exists shopping_lists_owner_type_idx on public.shopping_lists(owner_id, list_type);
create index if not exists shopping_items_list_idx on public.shopping_list_items(list_id);

select table_name
from information_schema.tables
where table_schema = 'public'
and table_name in ('medical_appointments','medical_documents','shopping_lists','shopping_list_items','wishlist_viewers')
order by table_name;
