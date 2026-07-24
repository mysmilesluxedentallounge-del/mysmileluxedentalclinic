import { Save } from "lucide-react"
import { createOralExaminationAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import ChiefComplaintFields from "@/app/dashboard/appointments/chief-complaint-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import OralExamFields from "../oral-exams/oral-exam-fields"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline "add oral exam" form — full tooth chart without leaving the page. */
export default async function InlineOralExamForm({
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
    <form action={createOralExaminationAction} className="space-y-4">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Exam date</FormLabel>
        <input name="exam_date" type="date" required defaultValue={today} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Link appointment (optional)</span>
        <select name="appointment_id" className={fieldClass}>
          <option value="">No appointment</option>
          {appointments?.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.appointment_date} - {appointment.id.slice(0, 8)}
            </option>
          ))}
        </select>
      </label>

      <ChiefComplaintFields />
      <OralExamFields />

      <label className="block space-y-1">
        <span className={labelClass}>Overall exam notes (optional)</span>
        <textarea name="notes" className={`min-h-20 ${fieldClass}`} />
      </label>

      <SubmitButton pendingText="Saving exam…" className={dashboardPrimaryButtonClass}>
        <Save className="size-4 shrink-0" aria-hidden />
        Save oral exam
      </SubmitButton>
    </form>
  )
}
