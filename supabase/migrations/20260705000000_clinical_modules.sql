-- Clinical modules: Oral Examination, Treatment Catalog, Treatment Plan, Work Done.
-- Idempotent so it can be run repeatedly and alongside supabase/schema.sql.

create extension if not exists "pgcrypto";

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

alter table public.treatment_catalog enable row level security;
alter table public.oral_examinations enable row level security;
alter table public.oral_examination_findings enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.treatment_plan_items enable row level security;
alter table public.work_done enable row level security;

drop policy if exists "treatment_catalog_read_auth" on public.treatment_catalog;
create policy "treatment_catalog_read_auth"
on public.treatment_catalog for select
using (auth.uid() is not null);

drop policy if exists "treatment_catalog_write_admin" on public.treatment_catalog;
create policy "treatment_catalog_write_admin"
on public.treatment_catalog for all
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

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
