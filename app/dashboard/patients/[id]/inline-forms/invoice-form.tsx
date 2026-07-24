import { Save } from "lucide-react"
import { createInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import { InvoiceItemsFields } from "@/app/dashboard/billing/invoice-items-fields"
import SubmitButton from "@/app/dashboard/submit-button"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline "create invoice" form — bills the patient without leaving the page. */
export default async function InlineInvoiceForm({
  patientId,
  redirectTo,
}: {
  patientId: string
  redirectTo: string
}) {
  const supabase = await createSupabaseServerClient()
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, appointment_date")
    .eq("patient_id", patientId)
    .order("appointment_date", { ascending: false })

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={createInvoiceAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Invoice date</FormLabel>
        <input name="invoice_date" type="date" required defaultValue={today} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Appointment (optional)</span>
        <select name="appointment_id" className={fieldClass}>
          <option value="">Link appointment (optional)</option>
          {appointments?.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.appointment_date} - {appointment.id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Status</span>
        <select name="status" defaultValue="unpaid" className={fieldClass}>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Payment method</span>
        <select name="payment_method" defaultValue="" className={fieldClass}>
          <option value="">Select payment method</option>
          <option value="upi">UPI</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>UPI transaction ID</span>
        <input name="upi_transaction_id" placeholder="Required for UPI" className={fieldClass} />
      </label>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="include_treatment_date"
          id={`include_treatment_date_inline_${patientId}`}
          defaultChecked
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor={`include_treatment_date_inline_${patientId}`} className="text-sm text-slate-700">
          Include treatment date column in PDF
        </label>
      </div>

      <InvoiceItemsFields compact />

      <label className="block space-y-1">
        <span className={labelClass}>Notes</span>
        <textarea name="notes" placeholder="Notes" className={fieldClass} />
      </label>

      <SubmitButton pendingText="Saving invoice…" className={dashboardPrimaryButtonClass}>
        <Save className="size-4 shrink-0" aria-hidden />
        Save invoice
      </SubmitButton>
    </form>
  )
}
