-- VITA v0.7
-- Políticas necesarias para listas de deseos con visibilidad seleccionada.

-- 1. Permitir ver perfiles básicos de miembros del mismo hogar.
create or replace function public.can_view_profile(
  target_profile_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
set search_path = public
as $$
  select target_profile_id = target_user_id
  or exists (
    select 1
    from public.household_members hm_self
    join public.household_members hm_target
      on hm_target.household_id = hm_self.household_id
    where hm_self.user_id = target_user_id
      and hm_self.status = 'active'
      and hm_target.user_id = target_profile_id
      and hm_target.status = 'active'
  );
$$;

drop policy if exists "profiles_select_household_v070" on public.profiles;

create policy "profiles_select_household_v070"
on public.profiles
for select
to authenticated
using (public.can_view_profile(id, auth.uid()));

-- 2. Asegurar que las políticas de wishlist_viewers permiten gestionar visibilidad propia.
drop policy if exists "wishlist_viewers_select_related_v070" on public.wishlist_viewers;
drop policy if exists "wishlist_viewers_insert_owner_v070" on public.wishlist_viewers;
drop policy if exists "wishlist_viewers_delete_owner_v070" on public.wishlist_viewers;

create policy "wishlist_viewers_select_related_v070"
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

create policy "wishlist_viewers_insert_owner_v070"
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

create policy "wishlist_viewers_delete_owner_v070"
on public.wishlist_viewers
for delete
to authenticated
using (
  exists (
    select 1
    from public.shopping_list_items sli
    where sli.id = wishlist_viewers.item_id
      and sli.owner_id = auth.uid()
  )
);

-- 3. Comprobación.
select
  p.email,
  p.preferred_name,
  h.name as household_name
from public.profiles p
left join public.household_members hm on hm.user_id = p.id
left join public.households h on h.id = hm.household_id
where p.email in ('patricia@vitaapp.com', 'roman@vitaapp.com')
order by p.email;
