-- VITA v0.3
-- Añade documentos generados, listas de compra y listas de deseos.
-- Ejecutar después de docs/supabase_v0_2.sql.

create table if not exists public.generated_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'household')),
  title text not null,
  document_type text not null check (document_type in ('health_report', 'shopping_list', 'home_report', 'wishlist', 'university_report', 'custom')),
  format text not null default 'pdf' check (format in ('pdf', 'zip', 'csv', 'json', 'txt')),
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  emailed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid references public.households(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'shared', 'household')),
  name text not null,
  list_type text not null default 'personal' check (list_type in ('personal', 'household', 'wishlist')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  quantity text,
  notes text,
  url text,
  image_path text,
  price_estimate numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'bought', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_viewers (
  item_id uuid not null references public.shopping_list_items(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (item_id, viewer_id)
);

drop trigger if exists shopping_lists_set_updated_at on public.shopping_lists;
create trigger shopping_lists_set_updated_at
before update on public.shopping_lists
for each row execute function public.set_updated_at();

drop trigger if exists shopping_list_items_set_updated_at on public.shopping_list_items;
create trigger shopping_list_items_set_updated_at
before update on public.shopping_list_items
for each row execute function public.set_updated_at();

alter table public.generated_documents enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_list_items enable row level security;
alter table public.wishlist_viewers enable row level security;

drop policy if exists "generated_documents_select_visible" on public.generated_documents;
create policy "generated_documents_select_visible"
on public.generated_documents
for select
to authenticated
using (
  owner_id = auth.uid()
  or (
    household_id is not null
    and visibility in ('shared', 'household')
    and public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "generated_documents_insert_owner" on public.generated_documents;
create policy "generated_documents_insert_owner"
on public.generated_documents
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    household_id is null
    or public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "generated_documents_update_owner" on public.generated_documents;
create policy "generated_documents_update_owner"
on public.generated_documents
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "shopping_lists_select_visible" on public.shopping_lists;
create policy "shopping_lists_select_visible"
on public.shopping_lists
for select
to authenticated
using (
  owner_id = auth.uid()
  or (
    household_id is not null
    and visibility in ('shared', 'household')
    and public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "shopping_lists_insert_owner" on public.shopping_lists;
create policy "shopping_lists_insert_owner"
on public.shopping_lists
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and (
    household_id is null
    or public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "shopping_lists_update_owner_or_household" on public.shopping_lists;
create policy "shopping_lists_update_owner_or_household"
on public.shopping_lists
for update
to authenticated
using (
  owner_id = auth.uid()
  or (
    household_id is not null
    and public.is_household_member(household_id, auth.uid())
  )
)
with check (
  owner_id = auth.uid()
  or (
    household_id is not null
    and public.is_household_member(household_id, auth.uid())
  )
);

drop policy if exists "shopping_items_select_visible" on public.shopping_list_items;
create policy "shopping_items_select_visible"
on public.shopping_list_items
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id
      and (
        sl.owner_id = auth.uid()
        or (
          sl.household_id is not null
          and sl.visibility in ('shared', 'household')
          and public.is_household_member(sl.household_id, auth.uid())
        )
      )
  )
  or exists (
    select 1
    from public.wishlist_viewers wv
    where wv.item_id = shopping_list_items.id
      and wv.viewer_id = auth.uid()
  )
);

drop policy if exists "shopping_items_insert_owner" on public.shopping_list_items;
create policy "shopping_items_insert_owner"
on public.shopping_list_items
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id
      and (
        sl.owner_id = auth.uid()
        or (
          sl.household_id is not null
          and public.is_household_member(sl.household_id, auth.uid())
        )
      )
  )
);

drop policy if exists "shopping_items_update_visible" on public.shopping_list_items;
create policy "shopping_items_update_visible"
on public.shopping_list_items
for update
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id
      and sl.household_id is not null
      and public.is_household_member(sl.household_id, auth.uid())
  )
)
with check (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.shopping_lists sl
    where sl.id = shopping_list_items.list_id
      and sl.household_id is not null
      and public.is_household_member(sl.household_id, auth.uid())
  )
);

drop policy if exists "wishlist_viewers_select_related" on public.wishlist_viewers;
create policy "wishlist_viewers_select_related"
on public.wishlist_viewers
for select
to authenticated
using (
  viewer_id = auth.uid()
  or exists (
    select 1
    from public.shopping_list_items sli
    where sli.id = wishlist_viewers.item_id
      and sli.owner_id = auth.uid()
  )
);

drop policy if exists "wishlist_viewers_insert_owner" on public.wishlist_viewers;
create policy "wishlist_viewers_insert_owner"
on public.wishlist_viewers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shopping_list_items sli
    where sli.id = wishlist_viewers.item_id
      and sli.owner_id = auth.uid()
  )
);
