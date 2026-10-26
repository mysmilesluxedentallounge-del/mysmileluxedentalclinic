-- Smile Predictor leads captured from predict.mysmileluxedentallounge.com
--
-- Rows are inserted server-side with the service-role key (the public form is
-- anonymous), so RLS only needs to cover staff reads and status updates.

create table if not exists public.smile_predictions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  address text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'converted', 'not_interested')),
  source text not null default 'smile_predictor',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- The dashboard lists newest first and filters by status.
create index if not exists smile_predictions_created_at_idx
  on public.smile_predictions (created_at desc);
create index if not exists smile_predictions_status_idx
  on public.smile_predictions (status);

alter table public.smile_predictions enable row level security;

drop policy if exists "smile_predictions_auth_rw" on public.smile_predictions;
create policy "smile_predictions_auth_rw"
on public.smile_predictions for all
using (auth.uid() is not null)
with check (auth.uid() is not null);
