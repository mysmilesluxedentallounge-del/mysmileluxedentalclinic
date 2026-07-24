import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { InvoiceItemsFields } from "@/app/dashboard/billing/invoice-items-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import { ArrowLeft, Save } from "lucide-react"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"

type WorkDoneLite = {
  id: string
  treatment_name: string
  work_date: string
  price: number | string
}

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; patient?: string; source?: string }>
}) {
  await requireAuth()
  const { error, patient: patientParam, source } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [{ data: patients }, { data: appointments }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase.from("appointments").select("id, patient_id, appointment_date").order("appointment_date", { ascending: false }),
  ])

  // Optional prefill from a patient's completed, not-yet-invoiced work done.
  let prefillItems: { treatment_name: string; treatment_date: string; cost: string; offer_amount: string }[] = []
  let prefillWorkDoneIds: string[] = []
  const prefillPatientId = source === "work_done" && patientParam ? patientParam : ""
  if (prefillPatientId) {
    const { data: completedWork } = await supabase
      .from("work_done")
      .select("id, treatment_name, work_date, price")
      .eq("patient_id", prefillPatientId)
      .eq("status", "completed")
      .is("invoice_id", null)
      .order("work_date")
    const rows = (completedWork as WorkDoneLite[] | null) ?? []
    prefillItems = rows.map((row) => ({
      treatment_name: row.treatment_name,
      treatment_date: row.work_date ?? "",
      cost: String(Number(row.price)),
      offer_amount: "",
    }))
    prefillWorkDoneIds = rows.map((row) => row.id)
  }

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
        <Link href="/dashboard/billing" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to billing
        </Link>
        <h1 className="font-heading text-3xl">Generate invoice</h1>
        <p className="text-sm text-muted-foreground">Create a new invoice for treatment and payment tracking.</p>
      </header>

      {prefillItems.length > 0 ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Prefilled {prefillItems.length} completed treatment(s) from Work Done. Review and save to bill them.
        </p>
      ) : null}

      <form action={createInvoiceAction} className="rounded-lg border bg-white p-4">
        {prefillWorkDoneIds.map((workDoneId) => (
          <input key={workDoneId} type="hidden" name="work_done_ids" value={workDoneId} />
        ))}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Patient
            </FormLabel>
            <select name="patient_id" required defaultValue={prefillPatientId} className="w-full rounded-md border px-3 py-2 text-sm">
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
            <select name="appointment_id" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Link appointment (optional)</option>
              {appointments?.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.appointment_date} - {appointment.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Invoice date
            </FormLabel>
            <input name="invoice_date" type="date" required className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue="unpaid" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Payment method</span>
            <select name="payment_method" defaultValue="" className="w-full rounded-md border px-3 py-2 text-sm">
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
              placeholder="UPI Transaction ID (required for UPI)"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
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
          <InvoiceItemsFields initialItems={prefillItems} />
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Notes</span>
            <textarea name="notes" placeholder="Notes" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>
        <SubmitButton
          pendingText="Saving invoice..."
          className={`${dashboardPrimaryButtonClass} mt-3`}
        >
          <Save className="size-4 shrink-0" aria-hidden />
          Save invoice
        </SubmitButton>
      </form>
    </section>
  )
}
