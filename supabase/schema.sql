-- Doctor Management System schema for Supabase

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'doctor' check (role in ('admin', 'doctor')),
  doctor_signature text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles
add column if not exists doctor_signature text;

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  gender text check (gender in ('male', 'female', 'other')),
  dob date,
  address text,
  patient_notes text,
  medical_history jsonb,
  dental_visit text,
  medication text,
  allergies text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

-- Existing databases: add clinical columns and migrate legacy `notes` -> `patient_notes`
alter table public.patients add column if not exists patient_notes text;
alter table public.patients add column if not exists medical_history jsonb;
alter table public.patients add column if not exists dental_visit text;
alter table public.patients add column if not exists medication text;
alter table public.patients add column if not exists allergies text;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'patients' and column_name = 'notes'
  ) then
    update public.patients
    set patient_notes = notes
    where patient_notes is null and notes is not null;
    alter table public.patients drop column notes;
  end if;
end $$;

alter table public.patients
add column if not exists gender text check (gender in ('male', 'female', 'other'));

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete restrict,
  appointment_date date not null,
  appointment_time time not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  treatment text,
  chief_complaint jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.appointments
add column if not exists chief_complaint jsonb;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'partial')),
  payment_method text check (payment_method in ('upi', 'cash', 'bank_transfer')),
  upi_transaction_id text,
  invoice_date date not null default current_date,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  treatment_name text not null,
  treatment_date date,
  cost numeric(12,2) not null check (cost >= 0),
  offer_amount numeric(12,2) check (offer_amount is null or offer_amount >= 0),
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.invoice_items
add column if not exists treatment_date date;

alter table public.invoice_items
add column if not exists offer_amount numeric(12,2) check (offer_amount is null or offer_amount >= 0);

alter table public.invoices
add column if not exists upi_transaction_id text;

alter table public.invoices
add column if not exists include_treatment_date boolean not null default true;

create table if not exists public.clinic_monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  allocated_amount numeric(12,2) not null check (allocated_amount >= 0),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (year, month)
);

create table if not exists public.clinic_expenses (
  id uuid primary key default gen_random_uuid(),
  expense_date date not null,
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  description text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

-- Clinical modules: master priced treatment catalog (admin-managed).
create table if not exists public.treatment_catalog (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  code text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  unique (category, name)
);

-- Clinical modules: oral examination session (one per exam).
create table if not exists public.oral_examinations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  dentition text not null default 'adult' check (dentition in ('adult', 'pedo', 'mixed')),
  quick_findings jsonb,
  chief_complaint jsonb,
  notes text,
  examined_by uuid not null references public.profiles(id) on delete restrict,
  exam_date date not null default current_date,
  created_at timestamptz not null default timezone('utc', now())
);

-- Clinical modules: per-tooth findings within an oral examination.
create table if not exists public.oral_examination_findings (
  id uuid primary key default gen_random_uuid(),
  examination_id uuid not null references public.oral_examinations(id) on delete cascade,
  tooth_number text not null,
  tooth_site_perio jsonb,
  soft_tissue jsonb,
  hard_tissue jsonb,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

-- Clinical modules: treatment plan (finalized set of planned treatments).
create table if not exists public.treatment_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  oral_examination_id uuid references public.oral_examinations(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'proposed', 'accepted', 'completed', 'cancelled')),
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

-- Clinical modules: line items within a treatment plan (price snapshot).
create table if not exists public.treatment_plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.treatment_plans(id) on delete cascade,
  treatment_catalog_id uuid references public.treatment_catalog(id) on delete set null,
  tooth_number text,
  surface text,
  finding_key text,
  treatment_name text not null,
  price numeric(12,2) not null check (price >= 0),
  priority text not null default 'primary' check (priority in ('primary', 'secondary')),
  is_part_of_bridge boolean not null default false,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled')),
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

-- Clinical modules: work done (executed treatments).
create table if not exists public.work_done (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  plan_item_id uuid references public.treatment_plan_items(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  treatment_name text not null,
  tooth_number text,
  treating_dentist_id uuid not null references public.profiles(id) on delete restrict,
  price numeric(12,2) not null default 0 check (price >= 0),
  stage text,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  work_date date not null default current_date,
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists oral_examinations_patient_idx on public.oral_examinations(patient_id);
create index if not exists oral_examination_findings_exam_idx on public.oral_examination_findings(examination_id);
create index if not exists treatment_plans_patient_idx on public.treatment_plans(patient_id);
create index if not exists treatment_plan_items_plan_idx on public.treatment_plan_items(plan_id);
create index if not exists work_done_patient_idx on public.work_done(patient_id);
create index if not exists work_done_plan_item_idx on public.work_done(plan_item_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'doctor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.clinic_monthly_budgets enable row level security;
alter table public.clinic_expenses enable row level security;
alter table public.treatment_catalog enable row level security;
alter table public.oral_examinations enable row level security;
alter table public.oral_examination_findings enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.treatment_plan_items enable row level security;
alter table public.work_done enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
$$;

drop policy if exists "read_profiles_admin_only" on public.profiles;
drop policy if exists "read_profiles_self_or_admin" on public.profiles;
create policy "read_profiles_self_or_admin"
on public.profiles for select
using (auth.uid() = id or public.current_user_role() = 'admin');

drop policy if exists "write_profiles_admin_only" on public.profiles;
create policy "write_profiles_admin_only"
on public.profiles for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "patients_auth_rw" on public.patients;
create policy "patients_auth_rw"
on public.patients for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "appointments_auth_rw" on public.appointments;
create policy "appointments_auth_rw"
on public.appointments for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "invoices_auth_rw" on public.invoices;
create policy "invoices_auth_rw"
on public.invoices for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "invoice_items_auth_rw" on public.invoice_items;
create policy "invoice_items_auth_rw"
on public.invoice_items for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "clinic_monthly_budgets_admin_all" on public.clinic_monthly_budgets;
create policy "clinic_monthly_budgets_admin_all"
on public.clinic_monthly_budgets for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

drop policy if exists "clinic_expenses_admin_all" on public.clinic_expenses;
create policy "clinic_expenses_admin_all"
on public.clinic_expenses for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Treatment catalog: readable by any authenticated user, writable by admin only.
drop policy if exists "treatment_catalog_read_auth" on public.treatment_catalog;
create policy "treatment_catalog_read_auth"
on public.treatment_catalog for select
using (auth.uid() is not null);

drop policy if exists "treatment_catalog_write_admin" on public.treatment_catalog;
create policy "treatment_catalog_write_admin"
on public.treatment_catalog for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Clinical records: any authenticated user may read/write (mirrors appointments_auth_rw).
drop policy if exists "oral_examinations_auth_rw" on public.oral_examinations;
create policy "oral_examinations_auth_rw"
on public.oral_examinations for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "oral_examination_findings_auth_rw" on public.oral_examination_findings;
create policy "oral_examination_findings_auth_rw"
on public.oral_examination_findings for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "treatment_plans_auth_rw" on public.treatment_plans;
create policy "treatment_plans_auth_rw"
on public.treatment_plans for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "treatment_plan_items_auth_rw" on public.treatment_plan_items;
create policy "treatment_plan_items_auth_rw"
on public.treatment_plan_items for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

drop policy if exists "work_done_auth_rw" on public.work_done;
create policy "work_done_auth_rw"
on public.work_done for all
using (auth.uid() is not null)
with check (auth.uid() is not null);

-- Patient files (metadata; blobs live in the "patient-files" Storage bucket).
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

-- Seed default doctor user so appointment defaults work out of the box.
-- Change this password after first login.
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'dr.shridha@mysmile.com',
  crypt('Shridha@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Dr Shridha Prabhu","role":"doctor"}',
  now(),
  now()
where not exists (
  select 1 from auth.users where email = 'dr.shridha@mysmile.com'
);

-- Seed default admin user.
-- Change this password after first login.
insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@mysmile.com',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Clinic Admin","role":"admin"}',
  now(),
  now()
where not exists (
  select 1 from auth.users where email = 'admin@mysmile.com'
);

