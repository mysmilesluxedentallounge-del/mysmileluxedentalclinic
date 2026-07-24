import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteOralExaminationAction, updateOralExaminationAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, OralExaminationFinding } from "@/lib/database.types"
import { chiefComplaintFromRow } from "@/lib/chief-complaint"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import ChiefComplaintFields from "@/app/dashboard/appointments/chief-complaint-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import OralExamFields, { type InitialFinding } from "../oral-exam-fields"

export default async function EditOralExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; examId: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const { id, examId } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const [{ data: examData }, { data: findingRows }, { data: appointments }] = await Promise.all([
    supabase
      .from("oral_examinations")
      .select("id, patient_id, appointment_id, dentition, quick_findings, chief_complaint, notes, examined_by, exam_date, created_at")
      .eq("id", examId)
      .maybeSingle(),
    supabase
      .from("oral_examination_findings")
      .select("id, examination_id, tooth_number, tooth_site_perio, soft_tissue, hard_tissue, notes, sort_order, created_at")
      .eq("examination_id", examId)
      .order("sort_order"),
    supabase.from("appointments").select("id, appointment_date").eq("patient_id", id).order("appointment_date", { ascending: false }),
  ])

  const exam = examData as OralExamination | null
  if (!exam || exam.patient_id !== id) notFound()

  const findings = (findingRows as OralExaminationFinding[] | null) ?? []
  const initialFindings: InitialFinding[] = findings.map((finding) => ({
    tooth_number: finding.tooth_number,
    tooth_site_perio: finding.tooth_site_perio,
    soft_tissue: finding.soft_tissue,
    hard_tissue: finding.hard_tissue,
    notes: finding.notes,
  }))

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">Could not update: {error}</p>
      ) : null}

      <header className="space-y-2">
        <Link href={`/dashboard/patients/${id}/oral-exams`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to oral exams
        </Link>
        <h1 className="font-heading text-3xl">Edit oral exam</h1>
      </header>

      <form action={updateOralExaminationAction} className="space-y-5">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="examination_id" value={exam.id} />

        <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Exam date
            </FormLabel>
            <input name="exam_date" type="date" required defaultValue={exam.exam_date} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Link appointment (optional)</span>
            <select name="appointment_id" defaultValue={exam.appointment_id ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">No appointment</option>
              {appointments?.map((appointment) => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.appointment_date} - {appointment.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ChiefComplaintFields initial={chiefComplaintFromRow(exam.chief_complaint, null)} />

        <OralExamFields
          initialDentition={exam.dentition}
          initialQuickFindings={exam.quick_findings}
          initialFindings={initialFindings}
        />

        <label className="block space-y-1 rounded-lg border bg-white p-4">
          <span className="block text-sm font-medium text-slate-700">Overall exam notes (optional)</span>
          <textarea name="notes" defaultValue={exam.notes ?? ""} className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
        </label>

        <SubmitButton pendingText="Updating…" className={dashboardPrimaryButtonClass}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update oral exam
        </SubmitButton>
      </form>

      <form action={deleteOralExaminationAction} className="rounded-lg border bg-white p-4">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="examination_id" value={exam.id} />
        <SubmitButton pendingText="Deleting…" className={dashboardDangerOutlineButtonClass}>
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Delete oral exam
        </SubmitButton>
      </form>
    </section>
  )
}
