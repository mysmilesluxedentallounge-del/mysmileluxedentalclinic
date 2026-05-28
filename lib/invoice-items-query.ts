import type { createSupabaseServerClient } from "@/lib/supabase/server"

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

export type InvoiceItemRow = {
  treatment_name: string
  treatment_date: string | null
  cost: number | string
  offer_amount: number | string | null
  sort_order: number
}

export async function fetchInvoiceItems(
  supabase: SupabaseServerClient,
  invoiceId: string
): Promise<InvoiceItemRow[]> {
  const withOffer = await supabase
    .from("invoice_items")
    .select("treatment_name, treatment_date, cost, offer_amount, sort_order")
    .eq("invoice_id", invoiceId)
    .order("sort_order")

  if (!withOffer.error) {
    return (withOffer.data ?? []) as InvoiceItemRow[]
  }

  if (!withOffer.error.message?.includes("offer_amount")) {
    return []
  }

  const withoutOffer = await supabase
    .from("invoice_items")
    .select("treatment_name, treatment_date, cost, sort_order")
    .eq("invoice_id", invoiceId)
    .order("sort_order")

  return ((withoutOffer.data ?? []) as Omit<InvoiceItemRow, "offer_amount">[]).map((item) => ({
    ...item,
    offer_amount: null,
  }))
}
