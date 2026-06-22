-- VITA v0.6 · Comprobación de listas
select
  sl.name,
  sl.list_type,
  sl.visibility,
  p.email as owner_email,
  h.name as household_name
from public.shopping_lists sl
left join public.profiles p on p.id = sl.owner_id
left join public.households h on h.id = sl.household_id
order by sl.created_at asc;

select
  sli.title,
  sli.status,
  sl.name as list_name,
  p.email as owner_email
from public.shopping_list_items sli
join public.shopping_lists sl on sl.id = sli.list_id
join public.profiles p on p.id = sli.owner_id
order by sli.created_at desc;
