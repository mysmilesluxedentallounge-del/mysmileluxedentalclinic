-- Enable Supabase Realtime for the tables the dashboard watches, so new
-- bookings / changes appear live without a page refresh. Idempotent.

do $$
begin
  begin
    alter publication supabase_realtime add table public.appointments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.patients;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.invoices;
  exception when duplicate_object then null;
  end;
end $$;
