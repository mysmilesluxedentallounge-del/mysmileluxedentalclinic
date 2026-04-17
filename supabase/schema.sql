-- Doctor Management System schema for Supabase

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'doctor' check (role in ('admin', 'doctor')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  dob date,
  address text,
  notes text,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

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
  payment_method text,
  invoice_date date not null default current_date,
  notes text,
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
create policy "read_profiles_admin_only"
on public.profiles for select
using (public.current_user_role() = 'admin');

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
