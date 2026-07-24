import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteTreatmentPlanAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TreatmentPlan, TreatmentPlanItem } from "@/lib/database.types"
import { PLAN_ITEM_STATUS_LABELS, PLAN_STATUS_LABELS, planTotal } from "@/lib/treatment-plan"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { toothLabel } from "@/lib/dental-charting"
import { surfaceLabel } from "@/lib/oral-examination"
import PipelineSteps from "@/components/dental/pipeline-steps"
import SubmitButton from "@/app/dashboard/submit-button"
import { ArrowRight } from "lucide-react"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

export default async function TreatmentPlanListPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ added?: string; updated?: string; deleted?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { added, updated, deleted } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: patient } = await supabase.from("patients").select("id, full_name").eq("id", id).maybeSingle()
  if (!patient) notFound()

  const { data: planRows } = await supabase
    .from("treatment_plans")
    .select("id, patient_id, appointment_id, oral_examination_id, status, notes, created_by, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })

  const plans = (planRows as TreatmentPlan[] | null) ?? []
  const planIds = plans.map((plan) => plan.id)

  const { data: itemRows } = planIds.length
    ? await supabase
        .from("treatment_plan_items")
        .select("id, plan_id, treatment_catalog_id, tooth_number, surface, finding_key, treatment_name, price, priority, is_part_of_bridge, status, sort_order, created_at")
        .in("plan_id", planIds)
        .order("sort_order")
    : { data: [] as TreatmentPlanItem[] }

  const itemsByPlan = new Map<string, TreatmentPlanItem[]>()
  for (const item of (itemRows as TreatmentPlanItem[] | null) ?? []) {
    const list = itemsByPlan.get(item.plan_id) ?? []
    list.push(item)
    itemsByPlan.set(item.plan_id, list)
  }

  const banner = added
    ? "Treatment plan created."
    : updated
      ? "Treatment plan updated."
      : deleted
        ? "Treatment plan deleted."
        : null

  return (
    <section className="space-y-6">
      {banner ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          <span>{banner}</span>
          {added || updated ? (
            <Link
              href={`/dashboard/patients/${id}/work-done`}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
            >
              Continue to Work Done
              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/dashboard/patients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
            Back to patient
          </Link>
          <h1 className="font-heading text-3xl">Treatment plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">{patient.full_name}</p>
        </div>
        <Link href={`/dashboard/patients/${id}/treatment-plan/new`} className={dashboardPrimaryButtonClass}>
          <Plus className="size-4 shrink-0" aria-hidden />
          Create plan
        </Link>
      </header>

      <PipelineSteps patientId={id} current="treatment-plan" />

      {plans.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          No treatment plans yet. Record oral exam findings first, then create a plan.
        </p>
      ) : (
        <div className="space-y-5">
          {plans.map((plan) => {
            const items = itemsByPlan.get(plan.id) ?? []
            const total = planTotal(items.map((item) => ({ price: Number(item.price) })))
            return (
              <article key={plan.id} className="space-y-3 rounded-lg border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-semibold text-[var(--brand-dark)]">
                      {new Date(plan.created_at).toLocaleDateString("en-IN")} · {PLAN_STATUS_LABELS[plan.status]}
                    </p>
                    <p className="text-muted-foreground">{items.length} treatment(s) · {formatCurrency(total)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/patients/${id}/treatment-plan/${plan.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                    <form action={deleteTreatmentPlanAction}>
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="plan_id" value={plan.id} />
                      <SubmitButton pendingText="Deleting…" className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50">
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-[var(--yellow-light)] text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Treatment</th>
                        <th className="px-3 py-2 font-semibold">Tooth</th>
                        <th className="px-3 py-2 font-semibold">Priority</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                        <th className="px-3 py-2 font-semibold">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            {item.treatment_name}
                            {item.is_part_of_bridge ? <span className="ml-1 text-xs text-slate-500">(bridge)</span> : null}
                          </td>
                          <td className="px-3 py-2">
                            {item.tooth_number ? toothLabel(item.tooth_number) : "—"}
                            {item.surface ? ` · ${surfaceLabel(item.surface)}` : ""}
                          </td>
                          <td className="px-3 py-2 capitalize">{item.priority}</td>
                          <td className="px-3 py-2">{PLAN_ITEM_STATUS_LABELS[item.status]}</td>
                          <td className="px-3 py-2">{formatCurrency(Number(item.price))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {plan.notes ? <p className="text-sm text-muted-foreground">Note: {plan.notes}</p> : null}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
