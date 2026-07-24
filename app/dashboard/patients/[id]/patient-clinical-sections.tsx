import { ClipboardCheck, Stethoscope, Wallet, FileText } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, TreatmentPlan, TreatmentPlanItem, WorkDone } from "@/lib/database.types"
import { DENTITION_LABELS, toothLabel } from "@/lib/dental-charting"
import { PLAN_STATUS_LABELS } from "@/lib/treatment-plan"
import { WORK_DONE_STATUS_LABELS } from "@/lib/work-done"
import ClickableRow from "@/components/dashboard/clickable-row"
import InlineFormCard from "@/components/dashboard/inline-form-card"
import InlineOralExamForm from "./inline-forms/oral-exam-form"
import InlineTreatmentPlanForm from "./inline-forms/treatment-plan-form"
import InlineWorkDoneForm from "./inline-forms/work-done-form"
import InlineInvoiceForm from "./inline-forms/invoice-form"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

const theadClass = "bg-slate-100 text-left text-slate-700"
const thClass = "px-3 py-2 font-semibold"
const tableWrapClass = "overflow-x-auto rounded-lg border border-slate-200"

type InvoiceRow = { id: string; amount: number; status: string; invoice_date: string }

/**
 * Clinical sections on the patient page. Each section lists recent records and
 * carries an inline add-form, so records are created without leaving this page.
 */
export default async function PatientClinicalSections({ patientId }: { patientId: string }) {
  const supabase = await createSupabaseServerClient()
  const base = `/dashboard/patients/${patientId}`
  const backHere = (kind: string) => `${base}?added=${kind}`

  const [{ data: examRows }, { data: planRows }, { data: workRows }, { data: invoiceRows }] = await Promise.all([
    supabase
      .from("oral_examinations")
      .select("id, exam_date, dentition, created_at")
      .eq("patient_id", patientId)
      .order("exam_date", { ascending: false })
      .limit(5),
    supabase
      .from("treatment_plans")
      .select("id, status, notes, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("work_done")
      .select("id, treatment_name, tooth_number, status, work_date, price")
      .eq("patient_id", patientId)
      .order("work_date", { ascending: false })
      .limit(5),
    supabase
      .from("invoices")
      .select("id, amount, status, invoice_date")
      .eq("patient_id", patientId)
      .order("invoice_date", { ascending: false })
      .limit(5),
  ])

  const exams = (examRows as Pick<OralExamination, "id" | "exam_date" | "dentition" | "created_at">[] | null) ?? []
  const plans = (planRows as Pick<TreatmentPlan, "id" | "status" | "notes" | "created_at">[] | null) ?? []
  const work = (workRows as Pick<WorkDone, "id" | "treatment_name" | "tooth_number" | "status" | "work_date" | "price">[] | null) ?? []
  const invoices = (invoiceRows as InvoiceRow[] | null) ?? []

  // Totals per plan (sum of item prices).
  const planIds = plans.map((plan) => plan.id)
  const { data: itemRows } = planIds.length
    ? await supabase.from("treatment_plan_items").select("plan_id, price").in("plan_id", planIds)
    : { data: [] as Pick<TreatmentPlanItem, "plan_id" | "price">[] }
  const totalByPlan = new Map<string, number>()
  for (const item of (itemRows as Pick<TreatmentPlanItem, "plan_id" | "price">[] | null) ?? []) {
    totalByPlan.set(item.plan_id, (totalByPlan.get(item.plan_id) ?? 0) + Number(item.price))
  }

  return (
    <div className="space-y-6">
      {/* Oral Examination */}
      <InlineFormCard
        title="Oral Examination"
        icon={<Stethoscope className="size-4 shrink-0" aria-hidden />}
        viewAllHref={`${base}/oral-exams`}
        addLabel="Add oral exam"
        form={<InlineOralExamForm patientId={patientId} redirectTo={backHere("exam")} />}
      >
        <div className={tableWrapClass}>
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Dentition</th>
                <th className={thClass}>&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-muted-foreground">No oral examinations yet.</td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <ClickableRow key={exam.id} href={`${base}/oral-exams/${exam.id}/view`} className="border-t border-slate-100">
                    <td className="px-3 py-2">{exam.exam_date}</td>
                    <td className="px-3 py-2">{DENTITION_LABELS[exam.dentition]}</td>
                    <td className="px-3 py-2 text-right text-blue-600">View</td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InlineFormCard>

      {/* Treatment Plan */}
      <InlineFormCard
        title="Treatment Plan"
        icon={<ClipboardCheck className="size-4 shrink-0" aria-hidden />}
        viewAllHref={`${base}/treatment-plan`}
        addLabel="Create treatment plan"
        form={<InlineTreatmentPlanForm patientId={patientId} redirectTo={backHere("plan")} />}
      >
        <div className={tableWrapClass}>
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-muted-foreground">No treatment plans yet.</td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <ClickableRow key={plan.id} href={`${base}/treatment-plan/${plan.id}`} className="border-t border-slate-100">
                    <td className="px-3 py-2">{new Date(plan.created_at).toLocaleDateString("en-IN")}</td>
                    <td className="px-3 py-2">{PLAN_STATUS_LABELS[plan.status]}</td>
                    <td className="px-3 py-2">{formatCurrency(totalByPlan.get(plan.id) ?? 0)}</td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InlineFormCard>

      {/* Work Done */}
      <InlineFormCard
        title="Work Done"
        icon={<FileText className="size-4 shrink-0" aria-hidden />}
        viewAllHref={`${base}/work-done`}
        addLabel="Record work done"
        form={<InlineWorkDoneForm patientId={patientId} redirectTo={backHere("work")} />}
      >
        <div className={tableWrapClass}>
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Treatment</th>
                <th className={thClass}>Tooth</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {work.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-3 text-muted-foreground">No work done yet.</td>
                </tr>
              ) : (
                work.map((row) => (
                  <ClickableRow key={row.id} href={`${base}/work-done`} className="border-t border-slate-100">
                    <td className="px-3 py-2">{row.work_date}</td>
                    <td className="px-3 py-2">{row.treatment_name}</td>
                    <td className="px-3 py-2">{row.tooth_number ? toothLabel(row.tooth_number) : "—"}</td>
                    <td className="px-3 py-2">{WORK_DONE_STATUS_LABELS[row.status]}</td>
                    <td className="px-3 py-2">{formatCurrency(Number(row.price))}</td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InlineFormCard>

      {/* Billing */}
      <InlineFormCard
        title="Billing"
        icon={<Wallet className="size-4 shrink-0" aria-hidden />}
        viewAllHref="/dashboard/billing"
        addLabel="Create invoice"
        form={<InlineInvoiceForm patientId={patientId} redirectTo={backHere("invoice")} />}
      >
        <div className={tableWrapClass}>
          <table className="w-full text-sm">
            <thead className={theadClass}>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Amount</th>
                <th className={thClass}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-3 text-muted-foreground">No invoices yet.</td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <ClickableRow key={invoice.id} href={`/dashboard/billing/${invoice.id}`} className="border-t border-slate-100">
                    <td className="px-3 py-2">{invoice.invoice_date}</td>
                    <td className="px-3 py-2">{formatCurrency(Number(invoice.amount))}</td>
                    <td className="px-3 py-2 capitalize">{invoice.status}</td>
                  </ClickableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </InlineFormCard>
    </div>
  )
}
