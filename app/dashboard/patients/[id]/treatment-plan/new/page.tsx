import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createTreatmentPlanAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, OralExaminationFinding } from "@/lib/database.types"
import { buildFindingSuggestions, PLAN_STATUS_LABELS, PLAN_STATUS_VALUES } from "@/lib/treatment-plan"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import type { CatalogLite } from "@/components/dental/treatment-catalog-picker"
import SubmitButton from "@/app/dashboard/submit-button"
import TreatmentPlanItemsFields from "../treatment-plan-items-fields"

export default async function NewTreatmentPlanPage({
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

  const [{ data: patient }, { data: catalogRows }, { data: latestExam }, { data: appointments }] = await Promise.all([
    supabase.from("patients").select("id, full_name").eq("id", id).maybeSingle(),
    supabase
      .from("treatment_catalog")
      .select("id, category, name, price")
      .eq("is_active", true)
      .order("category")
      .order("sort_order")
      .order("name"),
    supabase
      .from("oral_examinations")
      .select("id, exam_date, created_at")
      .eq("patient_id", id)
      .order("exam_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("appointments").select("id, appointment_date").eq("patient_id", id).order("appointment_date", { ascending: false }),
  ])

  if (!patient) notFound()

  const exam = latestExam as Pick<OralExamination, "id" | "exam_date" | "created_at"> | null
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
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "invalid_input"
            ? "Add at least one treatment with a valid non-negative price."
            : error === "save_failed"
              ? "Could not save the plan. Please try again."
              : `Could not save: ${error}`}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href={`/dashboard/patients/${id}/treatment-plan`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to treatment plans
        </Link>
        <h1 className="font-heading text-3xl">Create treatment plan</h1>
        <p className="text-sm text-muted-foreground">{patient.full_name}</p>
      </header>

      {catalog.length === 0 ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No active treatments in the catalog. An admin must add treatments under Treatments before building a plan.
        </p>
      ) : null}

      <form action={createTreatmentPlanAction} className="space-y-5">
        <input type="hidden" name="patient_id" value={id} />
        {exam ? <input type="hidden" name="oral_examination_id" value={exam.id} /> : null}

        <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue="draft" className="w-full rounded-md border px-3 py-2 text-sm">
              {PLAN_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {PLAN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Link appointment (optional)</span>
            <select name="appointment_id" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">No appointment</option>
              {appointments?.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.appointment_date} - {appointment.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TreatmentPlanItemsFields catalog={catalog} suggestions={suggestions} />

        <label className="block space-y-1 rounded-lg border bg-white p-4">
          <span className="block text-sm font-medium text-slate-700">Plan notes (optional)</span>
          <textarea name="notes" className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
        </label>

        <SubmitButton pendingText="Saving plan…" className={dashboardPrimaryButtonClass}>
          <Save className="size-4 shrink-0" aria-hidden />
          Save treatment plan
        </SubmitButton>
      </form>
    </section>
  )
}
