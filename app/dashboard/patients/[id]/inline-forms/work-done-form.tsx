import { Save } from "lucide-react"
import { createWorkDoneAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { WORK_DONE_STATUS_LABELS, WORK_DONE_STATUS_VALUES } from "@/lib/work-done"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import SubmitButton from "@/app/dashboard/submit-button"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline "record work done" form — saves without leaving the page. */
export default async function InlineWorkDoneForm({
  patientId,
  redirectTo,
}: {
  patientId: string
  redirectTo: string
}) {
  const supabase = await createSupabaseServerClient()
  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "doctor")
    .order("full_name")

  const doctorList = (doctors as { id: string; full_name: string | null }[] | null) ?? []
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={createWorkDoneAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Treatment</FormLabel>
        <input name="treatment_name" required className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Tooth (optional)</span>
        <input name="tooth_number" placeholder="e.g. 36" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Treating dentist</FormLabel>
        <select name="treating_dentist_id" required defaultValue={doctorList[0]?.id ?? ""} className={fieldClass}>
          <option value="">Select dentist</option>
          {doctorList.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name || "Unknown"}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Date</span>
        <input name="work_date" type="date" defaultValue={today} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Status</span>
        <select name="status" defaultValue="in_progress" className={fieldClass}>
          {WORK_DONE_STATUS_VALUES.map((status) => (
            <option key={status} value={status}>
              {WORK_DONE_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Stage (optional)</span>
        <input name="stage" placeholder="e.g. Crown prep" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Notes (optional)</span>
        <textarea name="notes" className={fieldClass} />
      </label>

      <SubmitButton pendingText="Saving…" className={dashboardPrimaryButtonClass}>
        <Save className="size-4 shrink-0" aria-hidden />
        Save work done
      </SubmitButton>
    </form>
  )
}
