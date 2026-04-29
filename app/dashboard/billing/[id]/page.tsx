import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteInvoiceAction, updateInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { InvoiceItemsFields } from "@/app/dashboard/billing/invoice-items-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"

function extractUpiTxnIdFromNotes(notes: string | null | undefined) {
  if (!notes) return null
  const match = notes.match(/UPI_TXN_ID\s*:\s*([^\r\n]+)/i)
  return match?.[1]?.trim() ?? null
}

function stripLegacyUpiTxnLine(notes: string | null | undefined) {
  if (!notes) return ""
  return notes
    .split("\n")
    .filter((line) => !/^UPI_TXN_ID\s*:/i.test(line.trim()))
    .join("\n")
    .trim()
}

export default async function EditInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [{ data: invoiceWithUpi, error: invoiceWithUpiError }, { data: patients }, { data: appointments }] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("id, patient_id, appointment_id, amount, status, payment_method, upi_transaction_id, include_treatment_date, invoice_date, notes")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("patients").select("id, full_name").order("full_name"),
      supabase.from("appointments").select("id, patient_id, appointment_date").order("appointment_date", { ascending: false }),
    ])

  let invoice = invoiceWithUpi
  if (invoiceWithUpiError?.message?.includes("upi_transaction_id")) {
    const { data: fallbackInvoice } = await supabase
      .from("invoices")
      .select("id, patient_id, appointment_id, amount, status, payment_method, invoice_date, notes")
      .eq("id", id)
      .maybeSingle()
    invoice = fallbackInvoice ? { ...fallbackInvoice, upi_transaction_id: null, include_treatment_date: true } : null
  }

  if (!invoice) {
    notFound()
  }

  const { data: invoiceItems } = await supabase
    .from("invoice_items")
    .select("treatment_name, treatment_date, cost, sort_order")
    .eq("invoice_id", invoice.id)
    .order("sort_order")

  let initialItems =
    invoiceItems?.map((item) => ({
      treatment_name: item.treatment_name ?? "",
      treatment_date: item.treatment_date ?? "",
      cost: String(item.cost ?? ""),
    })) ?? []

  if (initialItems.length === 0) {
    const { data: appointmentForFallback } = invoice.appointment_id
      ? await supabase.from("appointments").select("treatment").eq("id", invoice.appointment_id).maybeSingle()
      : { data: null }

    initialItems = [
      {
        treatment_name: appointmentForFallback?.treatment || "Consultation / Treatment",
        treatment_date: "",
        cost: String(invoice.amount ?? ""),
      },
    ]
  }

  const resolvedUpiTxnId = invoice.upi_transaction_id ?? extractUpiTxnIdFromNotes(invoice.notes)
  const cleanedNotes = stripLegacyUpiTxnLine(invoice.notes)

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Could not update invoice: {error}
        </p>
      ) : null}
      <header className="space-y-2">
        <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to billing
        </Link>
        <h1 className="font-heading text-3xl">Edit invoice</h1>
      </header>

      <div className="rounded-lg border bg-white p-4">
        <form action={updateInvoiceAction}>
          <input type="hidden" name="invoice_id" value={invoice.id} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Patient</span>
              <select name="patient_id" required defaultValue={invoice.patient_id} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Select patient</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Appointment (optional)</span>
              <select name="appointment_id" defaultValue={invoice.appointment_id ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="">Link appointment (optional)</option>
                {appointments?.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.appointment_date} - {appointment.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Invoice date</span>
              <input
                name="invoice_date"
                type="date"
                required
                defaultValue={invoice.invoice_date}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Status</span>
              <select name="status" defaultValue={invoice.status} className="w-full rounded-md border px-3 py-2 text-sm">
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">Payment method</span>
              <select
                name="payment_method"
                defaultValue={invoice.payment_method ?? ""}
                className="w-full rounded-md border px-3 py-2 text-sm"
              >
                <option value="">Select payment method</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-medium text-slate-700">UPI transaction ID</span>
              <input
                name="upi_transaction_id"
                defaultValue={resolvedUpiTxnId ?? ""}
                placeholder="UPI Transaction ID (required for UPI)"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="include_treatment_date"
              id="include_treatment_date_edit"
              defaultChecked={invoice.include_treatment_date !== false}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="include_treatment_date_edit" className="text-sm text-slate-700">
              Include treatment date column in invoice PDF
            </label>
            </div>
            <InvoiceItemsFields initialItems={initialItems} />
            <label className="space-y-1 md:col-span-2">
              <span className="block text-sm font-medium text-slate-700">Notes</span>
              <textarea
                name="notes"
                defaultValue={cleanedNotes}
                placeholder="Notes"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>

          <div className="mt-4">
            <SubmitButton
              pendingText="Updating invoice..."
              className={`${dashboardPrimaryButtonClass} mt-4`}
            >
              <Save className="size-4 shrink-0" aria-hidden />
              Update invoice
            </SubmitButton>
          </div>
        </form>

        <form action={deleteInvoiceAction} className="mt-3">
          <input type="hidden" name="invoice_id" value={invoice.id} />
          <input type="hidden" name="redirect_to" value="/dashboard/billing" />
          <button type="submit" className={`${dashboardDangerOutlineButtonClass} mt-3`}>
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Delete invoice
          </button>
        </form>
      </div>
    </section>
  )
}
