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
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

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
  sort_order int not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.invoice_items
add column if not exists treatment_date date;

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

