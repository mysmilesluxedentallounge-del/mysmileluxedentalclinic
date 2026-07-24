import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CheckCircle2, Pencil, Plus, RotateCcw, Trash2, Undo2, X } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import {
  createWorkDoneAction,
  createWorkDoneFromPlanItemAction,
  deleteWorkDoneAction,
  retreatWorkDoneAction,
  updateWorkDoneAction,
  updateWorkDoneStatusAction,
} from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { TreatmentPlan, TreatmentPlanItem, WorkDone } from "@/lib/database.types"
import { WORK_DONE_STATUS_LABELS, WORK_DONE_STATUS_VALUES } from "@/lib/work-done"
import { PLAN_ITEM_STATUS_LABELS } from "@/lib/treatment-plan"
import { toothLabel } from "@/lib/dental-charting"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableEmptyRowClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperScrollClass,
} from "@/lib/dashboard-table"
import { FormLabel } from "@/components/form-label"
import PipelineSteps from "@/components/dental/pipeline-steps"
import SubmitButton from "@/app/dashboard/submit-button"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

type DoctorRow = { id: string; full_name: string | null }

export default async function WorkDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ added?: string; updated?: string; deleted?: string; error?: string; edit?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { added, updated, deleted, error, edit } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: patient } = await supabase.from("patients").select("id, full_name").eq("id", id).maybeSingle()
  if (!patient) notFound()

  const [{ data: workRows }, { data: doctors }, { data: planRows }] = await Promise.all([
    supabase
      .from("work_done")
      .select("id, patient_id, plan_item_id, appointment_id, invoice_id, treatment_name, tooth_number, treating_dentist_id, price, stage, status, work_date, notes, sort_order, created_at")
      .eq("patient_id", id)
      .order("work_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name").eq("role", "doctor").order("full_name"),
    supabase.from("treatment_plans").select("id").eq("patient_id", id),
  ])

  const work = (workRows as WorkDone[] | null) ?? []
  const doctorList = (doctors as DoctorRow[] | null) ?? []
  const doctorNames = new Map(doctorList.map((doctor) => [doctor.id, doctor.full_name || "Unknown"]))
  const planIds = ((planRows as Pick<TreatmentPlan, "id">[] | null) ?? []).map((plan) => plan.id)

  const { data: planItemRows } = planIds.length
    ? await supabase
        .from("treatment_plan_items")
        .select("id, plan_id, treatment_name, tooth_number, price, status, sort_order")
        .in("plan_id", planIds)
        .neq("status", "cancelled")
        .order("sort_order")
    : { data: [] as TreatmentPlanItem[] }
  const openPlanItems = ((planItemRows as TreatmentPlanItem[] | null) ?? []).filter((item) => item.status !== "completed")

  const editing = edit ? work.find((row) => row.id === edit) ?? null : null
  const today = new Date().toISOString().slice(0, 10)
  const defaultDentist = doctorList[0]?.id ?? ""

  const banner = added
    ? "Work done recorded."
    : updated
      ? "Work done updated."
      : deleted
        ? "Work done deleted."
        : null

  return (
    <section className="space-y-6">
      {banner ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{banner}</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Please fill all required fields with valid values.
        </p>
      ) : null}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={`/dashboard/patients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
            Back to patient
          </Link>
          <h1 className="font-heading text-3xl">Work done</h1>
          <p className="mt-1 text-sm text-muted-foreground">{patient.full_name}</p>
        </div>
        {work.some((row) => row.status === "completed" && !row.invoice_id) ? (
          <Link href={`/dashboard/billing/new?patient=${id}&source=work_done`} className={dashboardPrimaryButtonClass}>
            <Plus className="size-4 shrink-0" aria-hidden />
            Generate invoice
          </Link>
        ) : null}
      </header>

      <PipelineSteps patientId={id} current="work-done" />

      {/* Work done table (top) */}
      <div className={dashboardTableWrapperScrollClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>Treatment</th>
              <th className={dashboardTableThClass}>Tooth</th>
              <th className={dashboardTableThClass}>Dentist</th>
              <th className={dashboardTableThClass}>Date</th>
              <th className={dashboardTableThClass}>Price</th>
              <th className={dashboardTableThClass}>Status</th>
              <th className={dashboardTableThClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {work.map((row, index) => (
              <tr key={row.id} className={dashboardTableBodyRowClass(index)}>
                <td className="px-4 py-2">
                  {row.treatment_name}
                  {row.stage ? <span className="block text-xs text-muted-foreground">{row.stage}</span> : null}
                  {row.plan_item_id ? <span className="block text-xs text-muted-foreground">From plan</span> : null}
                </td>
                <td className="px-4 py-2">{row.tooth_number ? toothLabel(row.tooth_number) : "—"}</td>
                <td className="px-4 py-2">{doctorNames.get(row.treating_dentist_id) ?? "Unknown"}</td>
                <td className="px-4 py-2">{row.work_date}</td>
                <td className="px-4 py-2">{formatCurrency(Number(row.price))}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${row.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {WORK_DONE_STATUS_LABELS[row.status]}
                  </span>
                  {row.invoice_id ? <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Invoiced</span> : null}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <form action={updateWorkDoneStatusAction}>
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="work_done_id" value={row.id} />
                      <input type="hidden" name="status" value={row.status === "completed" ? "in_progress" : "completed"} />
                      <SubmitButton
                        pendingText="…"
                        className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:underline disabled:opacity-50"
                      >
                        {row.status === "completed" ? (
                          <>
                            <Undo2 className="size-3.5 shrink-0" aria-hidden />
                            Reopen
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                            Complete
                          </>
                        )}
                      </SubmitButton>
                    </form>
                    {row.status === "completed" ? (
                      <form action={retreatWorkDoneAction}>
                        <input type="hidden" name="patient_id" value={id} />
                        <input type="hidden" name="work_done_id" value={row.id} />
                        <SubmitButton pendingText="…" className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline disabled:opacity-50">
                          <RotateCcw className="size-3.5 shrink-0" aria-hidden />
                          Re-treat
                        </SubmitButton>
                      </form>
                    ) : null}
                    <Link href={`/dashboard/patients/${id}/work-done?edit=${row.id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                    <form action={deleteWorkDoneAction}>
                      <input type="hidden" name="patient_id" value={id} />
                      <input type="hidden" name="work_done_id" value={row.id} />
                      <SubmitButton pendingText="…" className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50">
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {work.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={7}>
                  No work done recorded yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Add from treatment plan */}
      {openPlanItems.length > 0 ? (
        <div className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Start work from treatment plan</h2>
          <p className="mt-1 text-sm text-muted-foreground">Promote a planned treatment into work done.</p>
          <ul className="mt-3 space-y-2">
            {openPlanItems.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3 text-sm">
                <span>
                  <span className="font-medium">{item.treatment_name}</span>
                  {item.tooth_number ? <span className="text-muted-foreground"> · Tooth {toothLabel(item.tooth_number)}</span> : null}
                  <span className="text-muted-foreground"> · {formatCurrency(Number(item.price))} · {PLAN_ITEM_STATUS_LABELS[item.status]}</span>
                </span>
                <form action={createWorkDoneFromPlanItemAction}>
                  <input type="hidden" name="patient_id" value={id} />
                  <input type="hidden" name="plan_item_id" value={item.id} />
                  <SubmitButton pendingText="Starting…" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50">
                    <Plus className="size-3.5 shrink-0" aria-hidden />
                    Start work
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Manual add / edit */}
      <form
        action={editing ? updateWorkDoneAction : createWorkDoneAction}
        className={`rounded-lg border p-4 ${editing ? "border-blue-200 bg-blue-50/40" : "bg-white"}`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">{editing ? "Edit work done" : "Record work done"}</h2>
          {editing ? (
            <Link href={`/dashboard/patients/${id}/work-done`} className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline">
              <X className="size-3.5 shrink-0" aria-hidden />
              Cancel
            </Link>
          ) : null}
        </div>
        <input type="hidden" name="patient_id" value={id} />
        {editing ? <input type="hidden" name="work_done_id" value={editing.id} /> : null}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Treatment
            </FormLabel>
            <input name="treatment_name" required defaultValue={editing?.treatment_name ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Tooth (optional)</span>
            <input name="tooth_number" defaultValue={editing?.tooth_number ?? ""} placeholder="e.g. 36" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Treating dentist
            </FormLabel>
            <select name="treating_dentist_id" required defaultValue={editing?.treating_dentist_id ?? defaultDentist} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select dentist</option>
              {doctorList.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name || "Unknown"}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Date</span>
            <input name="work_date" type="date" defaultValue={editing?.work_date ?? today} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue={editing?.status ?? "in_progress"} className="w-full rounded-md border px-3 py-2 text-sm">
              {WORK_DONE_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {WORK_DONE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Stage (optional)</span>
            <input name="stage" defaultValue={editing?.stage ?? ""} placeholder="e.g. Crown prep" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Notes (optional)</span>
            <textarea name="notes" defaultValue={editing?.notes ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>
        <SubmitButton pendingText="Saving…" className={`${dashboardPrimaryButtonClass} mt-3`}>
          <Plus className="size-4 shrink-0" aria-hidden />
          {editing ? "Update work done" : "Record work done"}
        </SubmitButton>
      </form>
    </section>
  )
}
