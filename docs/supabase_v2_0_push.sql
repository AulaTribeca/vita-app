-- VITA v2.0
-- PWA instalada y notificaciones push reales con Supabase.
--
-- Ejecutar en Supabase SQL Editor.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  enabled boolean not null default true,
  last_success_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists web_push_subscriptions_set_updated_at on public.web_push_subscriptions;
create trigger web_push_subscriptions_set_updated_at
before update on public.web_push_subscriptions
for each row execute function public.set_updated_at();

alter table public.web_push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_select_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_insert_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_update_own" on public.web_push_subscriptions;
drop policy if exists "push_subscriptions_delete_own" on public.web_push_subscriptions;

create policy "push_subscriptions_select_own"
on public.web_push_subscriptions
for select
to authenticated
using (owner_id = auth.uid());

create policy "push_subscriptions_insert_own"
on public.web_push_subscriptions
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "push_subscriptions_update_own"
on public.web_push_subscriptions
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "push_subscriptions_delete_own"
on public.web_push_subscriptions
for delete
to authenticated
using (owner_id = auth.uid());

create table if not exists public.notification_preferences (
  owner_id uuid primary key references public.profiles(id) on delete cascade,
  medication boolean not null default true,
  appointments boolean not null default true,
  documents boolean not null default true,
  home boolean not null default true,
  health boolean not null default true,
  quiet_start time,
  quiet_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;

drop policy if exists "notification_preferences_select_own" on public.notification_preferences;
drop policy if exists "notification_preferences_insert_own" on public.notification_preferences;
drop policy if exists "notification_preferences_update_own" on public.notification_preferences;
drop policy if exists "notification_preferences_delete_own" on public.notification_preferences;

create policy "notification_preferences_select_own"
on public.notification_preferences
for select
to authenticated
using (owner_id = auth.uid());

create policy "notification_preferences_insert_own"
on public.notification_preferences
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "notification_preferences_update_own"
on public.notification_preferences
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "notification_preferences_delete_own"
on public.notification_preferences
for delete
to authenticated
using (owner_id = auth.uid());

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  dedupe_key text not null,
  title text not null,
  body text not null,
  target text not null default 'hoy',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_at timestamptz not null default now(),
  sent_at timestamptz,
  dismissed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (owner_id, dedupe_key)
);

alter table public.notification_events enable row level security;

drop policy if exists "notification_events_select_own" on public.notification_events;
drop policy if exists "notification_events_update_own" on public.notification_events;

create policy "notification_events_select_own"
on public.notification_events
for select
to authenticated
using (owner_id = auth.uid());

create policy "notification_events_update_own"
on public.notification_events
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create index if not exists push_subscriptions_owner_enabled_idx
on public.web_push_subscriptions(owner_id, enabled);

create index if not exists notification_events_pending_idx
on public.notification_events(sent_at, due_at)
where sent_at is null and dismissed_at is null;

create or replace function public.create_vita_due_notifications()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  today_key text := to_char(now(), 'YYYY-MM-DD');
begin
  -- Medicación: stock bajo.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    m.owner_id,
    'medication_stock',
    'stock:' || today_key || ':' || m.id::text,
    'Comprar o retirar ' || m.name,
    'Quedan aproximadamente ' || greatest(0, floor(coalesce(m.current_stock, 0)::numeric / greatest(1, cardinality(m.schedule_times))))::text || ' días de medicación.',
    'medicacion',
    case when greatest(0, floor(coalesce(m.current_stock, 0)::numeric / greatest(1, cardinality(m.schedule_times)))) <= 2 then 'high' else 'medium' end,
    now(),
    jsonb_build_object('medication_id', m.id)
  from public.medications m
  left join public.notification_preferences np on np.owner_id = m.owner_id
  where m.active = true
    and coalesce(np.medication, true) = true
    and greatest(0, floor(coalesce(m.current_stock, 0)::numeric / greatest(1, cardinality(m.schedule_times)))) <= coalesce(m.warning_threshold_days, 7)
  on conflict (owner_id, dedupe_key) do nothing;

  get diagnostics inserted_count = row_count;

  -- Citas próximas, 24 horas.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    a.owner_id,
    'appointment',
    'appointment:' || a.id::text || ':' || to_char(a.appointment_at, 'YYYY-MM-DD'),
    'Cita: ' || a.title,
    to_char(a.appointment_at at time zone 'Europe/Madrid', 'DD/MM HH24:MI') ||
      case when a.needs_referral_document then ' · Llevar volante o informe' else '' end,
    'citas',
    case when a.appointment_at <= now() + interval '6 hours' then 'high' else 'medium' end,
    now(),
    jsonb_build_object('appointment_id', a.id)
  from public.medical_appointments a
  left join public.notification_preferences np on np.owner_id = a.owner_id
  where a.status = 'scheduled'
    and a.appointment_at between now() and now() + interval '24 hours'
    and coalesce(np.appointments, true) = true
  on conflict (owner_id, dedupe_key) do nothing;

  -- Volantes/documentos pendientes, diario.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    d.owner_id,
    'document',
    'document:' || today_key || ':' || d.id::text,
    case when d.status = 'pending_upload' then 'Subir archivo: ' || d.title else 'Llevar documento: ' || d.title end,
    coalesce(d.related_specialty, 'Documento médico pendiente'),
    'citas',
    case when d.status = 'pending_to_use' then 'high' else 'medium' end,
    now(),
    jsonb_build_object('document_id', d.id)
  from public.medical_documents d
  left join public.notification_preferences np on np.owner_id = d.owner_id
  where d.status in ('pending_upload', 'pending_to_use')
    and coalesce(np.documents, true) = true
  on conflict (owner_id, dedupe_key) do nothing;

  -- Facturas próximas o vencidas, por miembros del hogar.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    hm.user_id,
    'bill',
    'bill:' || today_key || ':' || b.id::text,
    'Factura: ' || b.title,
    coalesce(b.amount::text || ' € · ', '') || coalesce(to_char(b.due_date, 'DD/MM'), 'sin fecha'),
    'hogar',
    case when b.due_date < current_date then 'high' else 'medium' end,
    now(),
    jsonb_build_object('bill_id', b.id)
  from public.household_bills b
  join public.household_members hm on hm.household_id = b.household_id and hm.status = 'active'
  left join public.notification_preferences np on np.owner_id = hm.user_id
  where b.status <> 'paid'
    and b.due_date <= current_date + 7
    and coalesce(np.home, true) = true
  on conflict (owner_id, dedupe_key) do nothing;

  -- Coche.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    hm.user_id,
    'vehicle',
    'vehicle:' || today_key || ':' || vt.id::text,
    'Coche: ' || vt.title,
    coalesce(to_char(vt.due_date, 'DD/MM'), 'sin fecha'),
    'hogar',
    case when vt.due_date < current_date or vt.due_date <= current_date + 7 then 'high' else 'medium' end,
    now(),
    jsonb_build_object('vehicle_task_id', vt.id)
  from public.vehicle_tasks vt
  join public.household_members hm on hm.household_id = vt.household_id and hm.status = 'active'
  left join public.notification_preferences np on np.owner_id = hm.user_id
  where vt.status <> 'done'
    and vt.due_date <= current_date + 30
    and coalesce(np.home, true) = true
  on conflict (owner_id, dedupe_key) do nothing;

  -- Gestiones.
  insert into public.notification_events(owner_id, event_type, dedupe_key, title, body, target, priority, due_at, metadata)
  select
    hm.user_id,
    'task',
    'task:' || today_key || ':' || ht.id::text,
    'Gestión pendiente: ' || ht.title,
    coalesce(to_char(ht.due_date, 'DD/MM'), 'sin fecha'),
    'hogar',
    case when ht.due_date < current_date then 'high' else 'medium' end,
    now(),
    jsonb_build_object('household_task_id', ht.id)
  from public.household_tasks ht
  join public.household_members hm on hm.household_id = ht.household_id and hm.status = 'active'
  left join public.notification_preferences np on np.owner_id = hm.user_id
  where ht.status <> 'done'
    and ht.due_date <= current_date + 7
    and coalesce(np.home, true) = true
  on conflict (owner_id, dedupe_key) do nothing;

  return inserted_count;
end;
$$;
