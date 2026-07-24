import { Save } from "lucide-react"
import { createTreatmentPlanAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExaminationFinding } from "@/lib/database.types"
import { buildFindingSuggestions, PLAN_STATUS_LABELS, PLAN_STATUS_VALUES } from "@/lib/treatment-plan"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import type { CatalogLite } from "@/components/dental/treatment-catalog-picker"
import SubmitButton from "@/app/dashboard/submit-button"
import TreatmentPlanItemsFields from "../treatment-plan/treatment-plan-items-fields"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline "create treatment plan" form — builds a priced plan on the page. */
export default async function InlineTreatmentPlanForm({
  patientId,
  redirectTo,
}: {
  patientId: string
  redirectTo: string
}) {
  const supabase = await createSupabaseServerClient()

  const [{ data: catalogRows }, { data: latestExam }, { data: appointments }] = await Promise.all([
    supabase
      .from("treatment_catalog")
      .select("id, category, name, price")
      .eq("is_active", true)
      .order("category")
      .order("sort_order")
      .order("name"),
    supabase
      .from("oral_examinations")
      .select("id")
      .eq("patient_id", patientId)
      .order("exam_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("appointments")
      .select("id, appointment_date")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: false }),
  ])

  const exam = latestExam as { id: string } | null
  const { data: findingRows } = exam
    ? await supabase
        .from("oral_examination_findings")
        .select("id, examination_id, tooth_number, tooth_site_perio, soft_tissue, hard_tissue, notes, sort_order, created_at")
        .eq("examination_id", exam.id)
        .order("sort_order")
    : { data: [] as OralExaminationFinding[] }

  const suggestions = buildFindingSuggestions((findingRows as OralExaminationFinding[] | null) ?? [])
  const catalog = (catalogRows as CatalogLite[] | null) ?? []

  return (
    <>
      {catalog.length === 0 ? (
        <p className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No active treatments in the catalog. An admin must add treatments under Treatments first.
        </p>
      ) : null}
      <form action={createTreatmentPlanAction} className="space-y-4">
        <input type="hidden" name="patient_id" value={patientId} />
        <input type="hidden" name="redirect_to" value={redirectTo} />
        {exam ? <input type="hidden" name="oral_examination_id" value={exam.id} /> : null}

        <label className="block space-y-1">
          <span className={labelClass}>Status</span>
          <select name="status" defaultValue="draft" className={fieldClass}>
            {PLAN_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {PLAN_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
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

        <TreatmentPlanItemsFields catalog={catalog} suggestions={suggestions} />

        <label className="block space-y-1">
          <span className={labelClass}>Plan notes (optional)</span>
          <textarea name="notes" className={`min-h-20 ${fieldClass}`} />
        </label>

        <SubmitButton pendingText="Saving plan…" className={dashboardPrimaryButtonClass}>
          <Save className="size-4 shrink-0" aria-hidden />
          Save treatment plan
        </SubmitButton>
      </form>
    </>
  )
}
