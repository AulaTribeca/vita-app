-- VITA v1.0
-- Volantes y documentos médicos con Supabase Storage.
--
-- Ejecutar en Supabase → SQL Editor antes de probar la pantalla Volantes.

-- 1. Crear bucket privado para documentos médicos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vita-medical-documents',
  'vita-medical-documents',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'application/pdf'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2. Tabla de documentos médicos.
create table if not exists public.medical_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.medical_appointments(id) on delete set null,
  document_type text not null default 'referral' check (
    document_type in ('referral', 'report', 'prescription', 'test_request', 'other')
  ),
  title text not null,
  status text not null default 'pending_to_use' check (
    status in ('pending_upload', 'pending_to_use', 'used', 'archived')
  ),
  related_specialty text,
  file_path text,
  file_name text,
  mime_type text,
  size_bytes bigint,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists medical_documents_set_updated_at on public.medical_documents;
create trigger medical_documents_set_updated_at
before update on public.medical_documents
for each row execute function public.set_updated_at();

alter table public.medical_documents enable row level security;

drop policy if exists "medical_documents_select_own" on public.medical_documents;
drop policy if exists "medical_documents_insert_own" on public.medical_documents;
drop policy if exists "medical_documents_update_own" on public.medical_documents;
drop policy if exists "medical_documents_delete_own" on public.medical_documents;

create policy "medical_documents_select_own"
on public.medical_documents
for select
to authenticated
using (owner_id = auth.uid());

create policy "medical_documents_insert_own"
on public.medical_documents
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "medical_documents_update_own"
on public.medical_documents
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "medical_documents_delete_own"
on public.medical_documents
for delete
to authenticated
using (owner_id = auth.uid());

create index if not exists medical_documents_owner_status_idx
on public.medical_documents(owner_id, status);

create index if not exists medical_documents_owner_created_idx
on public.medical_documents(owner_id, created_at desc);

-- 3. Políticas de Storage.
-- La ruta de cada archivo empieza por el UUID del usuario:
-- auth.uid()/archivo.pdf

drop policy if exists "medical_storage_select_own" on storage.objects;
drop policy if exists "medical_storage_insert_own" on storage.objects;
drop policy if exists "medical_storage_update_own" on storage.objects;
drop policy if exists "medical_storage_delete_own" on storage.objects;

create policy "medical_storage_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vita-medical-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "medical_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'vita-medical-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "medical_storage_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'vita-medical-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'vita-medical-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "medical_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'vita-medical-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Comprobación.
select
  id,
  name,
  public,
  file_size_limit
from storage.buckets
where id = 'vita-medical-documents';

select
  table_name,
  column_name,
  data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'medical_documents'
order by ordinal_position;
