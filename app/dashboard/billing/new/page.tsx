import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { InvoiceItemsFields } from "@/app/dashboard/billing/invoice-items-fields"

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [{ data: patients }, { data: appointments }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase.from("appointments").select("id, patient_id, appointment_date").order("appointment_date", { ascending: false }),
  ])

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "upi_txn_required"
            ? "UPI Transaction ID is required when payment method is UPI."
            : error === "invalid_input"
              ? "Please fill all required fields with valid values."
              : `Could not create invoice: ${error}`}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href="/dashboard/billing" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          &larr; Back to billing
        </Link>
        <h1 className="font-heading text-3xl">Generate invoice</h1>
        <p className="text-sm text-muted-foreground">Create a new invoice for treatment and payment tracking.</p>
      </header>

      <form action={createInvoiceAction} className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select name="patient_id" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          <select name="appointment_id" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Link appointment (optional)</option>
            {appointments?.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.appointment_date} - {appointment.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <input name="invoice_date" type="date" required className="rounded-md border px-3 py-2 text-sm" />
          <select name="status" defaultValue="unpaid" className="rounded-md border px-3 py-2 text-sm">
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <select name="payment_method" defaultValue="" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select payment method</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
          <input
            name="upi_transaction_id"
            placeholder="UPI Transaction ID (required for UPI)"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              name="include_treatment_date"
              id="include_treatment_date_new"
              defaultChecked
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="include_treatment_date_new" className="text-sm text-slate-700">
              Include treatment date column in invoice PDF
            </label>
          </div>
          <InvoiceItemsFields />
          <textarea name="notes" placeholder="Notes" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save invoice
        </button>
      </form>
    </section>
  )
}
