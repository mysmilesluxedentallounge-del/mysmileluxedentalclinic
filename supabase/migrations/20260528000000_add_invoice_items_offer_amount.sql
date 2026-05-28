-- Run in Supabase SQL Editor if invoice/PDF features fail with missing column errors.

alter table public.invoice_items
add column if not exists offer_amount numeric(12,2) check (offer_amount is null or offer_amount >= 0);

alter table public.invoice_items
add column if not exists treatment_date date;

alter table public.invoices
add column if not exists upi_transaction_id text;

alter table public.invoices
add column if not exists include_treatment_date boolean not null default true;
