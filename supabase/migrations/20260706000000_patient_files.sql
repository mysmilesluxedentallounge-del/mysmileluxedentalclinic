-- Patient Files module: metadata table (files themselves live in the
-- "patient-files" Storage bucket, accessed via the service role from the server).
-- Idempotent.

create table if not exists public.patient_files (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  category text not null check (category in ('oral_image', 'xray', 'profile', 'document')),
  file_path text not null,
  file_name text not null,
  mime_type text,
  label text,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists patient_files_patient_idx on public.patient_files(patient_id);

alter table public.patient_files enable row level security;

drop policy if exists "patient_files_auth_rw" on public.patient_files;
create policy "patient_files_auth_rw"
on public.patient_files for all
using (auth.uid() is not null)
with check (auth.uid() is not null);
