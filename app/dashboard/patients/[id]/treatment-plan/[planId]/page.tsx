import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteTreatmentPlanAction, updateTreatmentPlanAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExaminationFinding, TreatmentPlan, TreatmentPlanItem } from "@/lib/database.types"
import { buildFindingSuggestions, PLAN_STATUS_LABELS, PLAN_STATUS_VALUES } from "@/lib/treatment-plan"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import type { CatalogLite } from "@/components/dental/treatment-catalog-picker"
import SubmitButton from "@/app/dashboard/submit-button"
import TreatmentPlanItemsFields, { type PlanItemInput } from "../treatment-plan-items-fields"

export default async function EditTreatmentPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const { id, planId } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [{ data: planData }, { data: itemRows }, { data: catalogRows }, { data: appointments }] = await Promise.all([
    supabase
      .from("treatment_plans")
      .select("id, patient_id, appointment_id, oral_examination_id, status, notes, created_by, created_at")
      .eq("id", planId)
      .maybeSingle(),
    supabase
      .from("treatment_plan_items")
      .select("id, plan_id, treatment_catalog_id, tooth_number, surface, finding_key, treatment_name, price, priority, is_part_of_bridge, status, sort_order, created_at")
      .eq("plan_id", planId)
      .order("sort_order"),
    supabase.from("treatment_catalog").select("id, category, name, price").eq("is_active", true).order("category").order("sort_order").order("name"),
    supabase.from("appointments").select("id, appointment_date").eq("patient_id", id).order("appointment_date", { ascending: false }),
  ])

  const plan = planData as TreatmentPlan | null
  if (!plan || plan.patient_id !== id) notFound()

  const { data: findingRows } = plan.oral_examination_id
    ? await supabase
        .from("oral_examination_findings")
        .select("id, examination_id, tooth_number, tooth_site_perio, soft_tissue, hard_tissue, notes, sort_order, created_at")
        .eq("examination_id", plan.oral_examination_id)
        .order("sort_order")
    : { data: [] as OralExaminationFinding[] }

  const suggestions = buildFindingSuggestions((findingRows as OralExaminationFinding[] | null) ?? [])
  const catalog = (catalogRows as CatalogLite[] | null) ?? []
  const initialItems: PlanItemInput[] = ((itemRows as TreatmentPlanItem[] | null) ?? []).map((item) => ({
    treatment_catalog_id: item.treatment_catalog_id ?? "",
    treatment_name: item.treatment_name,
    price: String(Number(item.price)),
    tooth_number: item.tooth_number ?? "",
    surface: item.surface ?? "",
    finding_key: item.finding_key ?? "",
    priority: item.priority,
    is_part_of_bridge: item.is_part_of_bridge,
    status: item.status,
  }))

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "invalid_input" ? "Add at least one treatment with a valid non-negative price." : `Could not update: ${error}`}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href={`/dashboard/patients/${id}/treatment-plan`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to treatment plans
        </Link>
        <h1 className="font-heading text-3xl">Edit treatment plan</h1>
      </header>

      <form action={updateTreatmentPlanAction} className="space-y-5">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="plan_id" value={plan.id} />

        <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue={plan.status} className="w-full rounded-md border px-3 py-2 text-sm">
              {PLAN_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {PLAN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Link appointment (optional)</span>
            <select name="appointment_id" defaultValue={plan.appointment_id ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">No appointment</option>
              {appointments?.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.appointment_date} - {appointment.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TreatmentPlanItemsFields catalog={catalog} initialItems={initialItems} suggestions={suggestions} />

        <label className="block space-y-1 rounded-lg border bg-white p-4">
          <span className="block text-sm font-medium text-slate-700">Plan notes (optional)</span>
          <textarea name="notes" defaultValue={plan.notes ?? ""} className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
        </label>

        <SubmitButton pendingText="Updating…" className={dashboardPrimaryButtonClass}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update treatment plan
        </SubmitButton>
      </form>

      <form action={deleteTreatmentPlanAction} className="rounded-lg border bg-white p-4">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="plan_id" value={plan.id} />
        <SubmitButton pendingText="Deleting…" className={dashboardDangerOutlineButtonClass}>
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Delete treatment plan
        </SubmitButton>
      </form>
    </section>
  )
}
