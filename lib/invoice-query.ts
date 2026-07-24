import type { createSupabaseServerClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

export type InvoiceRecord = {
  id: string
  patient_id: string
  appointment_id: string | null
  amount: number | string
  status: "paid" | "unpaid" | "partial"
  invoice_date: string
  payment_method: string | null
  upi_transaction_id: string | null
  include_treatment_date: boolean | null
  notes: string | null
  created_at: string | null
}

const INVOICE_SELECT_FULL =
  "id, patient_id, appointment_id, amount, status, invoice_date, payment_method, upi_transaction_id, include_treatment_date, notes, created_at"

const INVOICE_SELECT_BASE =
  "id, patient_id, appointment_id, amount, status, invoice_date, payment_method, notes, created_at"

function withInvoiceDefaults(
  row: Omit<InvoiceRecord, "upi_transaction_id" | "include_treatment_date" | "created_at"> &
    Partial<Pick<InvoiceRecord, "upi_transaction_id" | "include_treatment_date" | "created_at">>
): InvoiceRecord {
  return {
    ...row,
    upi_transaction_id: row.upi_transaction_id ?? null,
    include_treatment_date: row.include_treatment_date ?? true,
    created_at: row.created_at ?? null,
  }
}

export async function fetchInvoiceById(
  supabase: SupabaseServerClient,
  invoiceId: string
): Promise<InvoiceRecord | null> {
  const full = await supabase.from("invoices").select(INVOICE_SELECT_FULL).eq("id", invoiceId).maybeSingle()

  if (!full.error && full.data) {
    return withInvoiceDefaults(full.data as InvoiceRecord)
  }

  const base = await supabase.from("invoices").select(INVOICE_SELECT_BASE).eq("id", invoiceId).maybeSingle()

  if (!base.error && base.data) {
    return withInvoiceDefaults(base.data as InvoiceRecord)
  }

  return null
}

export async function fetchDoctorForInvoice(
  supabase: SupabaseServerClient,
  doctorId: string
): Promise<{ full_name: string | null; doctor_signature: string | null } | null> {
  const full = await supabase
    .from("profiles")
    .select("full_name, doctor_signature")
    .eq("id", doctorId)
    .maybeSingle()

  if (!full.error && full.data) {
    return full.data
  }

  if (full.error?.message?.includes("doctor_signature")) {
    const minimal = await supabase.from("profiles").select("full_name").eq("id", doctorId).maybeSingle()
    if (!minimal.error && minimal.data) {
      return { full_name: minimal.data.full_name, doctor_signature: null }
    }
  }

  return null
}

/** pdf-lib StandardFonts only support WinAnsi; strip unsupported characters. */
export function sanitizePdfText(value: string) {
  return value.replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim()
}
