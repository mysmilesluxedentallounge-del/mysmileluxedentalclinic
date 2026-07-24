import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteOralExaminationAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, OralExaminationFinding } from "@/lib/database.types"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { DENTITION_LABELS } from "@/lib/dental-charting"
import ExamFindingsTable from "@/components/dental/exam-findings-table"
import PipelineSteps from "@/components/dental/pipeline-steps"
import SubmitButton from "@/app/dashboard/submit-button"
import { ArrowRight } from "lucide-react"

const QUICK_LABELS: Record<string, string> = { clinical: "Yes (Clinical)", aesthetic: "Yes (Aesthetic)", no: "No" }

export default async function OralExamsListPage({
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

  const { data: examRows } = await supabase
    .from("oral_examinations")
    .select("id, patient_id, appointment_id, dentition, quick_findings, chief_complaint, notes, examined_by, exam_date, created_at")
    .eq("patient_id", id)
    .order("exam_date", { ascending: false })
    .order("created_at", { ascending: false })

  const exams = (examRows as OralExamination[] | null) ?? []
  const examIds = exams.map((exam) => exam.id)

  const [{ data: findingRows }, { data: examiners }] = await Promise.all([
    examIds.length
      ? supabase
          .from("oral_examination_findings")
          .select("id, examination_id, tooth_number, tooth_site_perio, soft_tissue, hard_tissue, notes, sort_order, created_at")
          .in("examination_id", examIds)
          .order("sort_order")
      : Promise.resolve({ data: [] as OralExaminationFinding[] }),
    supabase.from("profiles").select("id, full_name"),
  ])

  const findingsByExam = new Map<string, OralExaminationFinding[]>()
  for (const finding of (findingRows as OralExaminationFinding[] | null) ?? []) {
    const list = findingsByExam.get(finding.examination_id) ?? []
    list.push(finding)
    findingsByExam.set(finding.examination_id, list)
  }
  const examinerNames = new Map<string, string>()
  for (const examiner of (examiners as { id: string; full_name: string | null }[] | null) ?? []) {
    examinerNames.set(examiner.id, examiner.full_name || "Unknown")
  }

  const banner = added
    ? "Oral exam findings added successfully."
    : updated
      ? "Oral exam updated successfully."
      : deleted
        ? "Oral exam deleted."
        : null

  return (
    <section className="space-y-6">
      {banner ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          <span>{banner}</span>
          {added ? (
            <Link
              href={`/dashboard/patients/${id}/treatment-plan/new`}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 font-medium text-white hover:bg-emerald-700"
            >
              Continue to Treatment Plan
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
          <h1 className="font-heading text-3xl">Oral exams</h1>
          <p className="mt-1 text-sm text-muted-foreground">{patient.full_name}</p>
        </div>
        <Link href={`/dashboard/patients/${id}/oral-exams/new`} className={dashboardPrimaryButtonClass}>
          <Plus className="size-4 shrink-0" aria-hidden />
          Add oral exam
        </Link>
      </header>

      <PipelineSteps patientId={id} current="oral-exam" />

      {exams.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          No oral examinations recorded yet. Use “Add oral exam” to record findings.
        </p>
      ) : (
        <div className="space-y-5">
          {exams.map((exam) => (
            <article key={exam.id} className="space-y-3 rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="text-sm">
                  <p className="font-semibold text-[var(--brand-dark)]">
                    {exam.exam_date} · {DENTITION_LABELS[exam.dentition]}
                  </p>
                  <p className="text-muted-foreground">Examined by {examinerNames.get(exam.examined_by) ?? "Unknown"}</p>
                  {exam.quick_findings ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {exam.quick_findings.malocclusion
                        ? `Malocclusion: ${QUICK_LABELS[exam.quick_findings.malocclusion]}`
                        : null}
                      {exam.quick_findings.malocclusion && exam.quick_findings.missing_tooth ? " · " : null}
                      {exam.quick_findings.missing_tooth
                        ? `Missing tooth: ${QUICK_LABELS[exam.quick_findings.missing_tooth]}`
                        : null}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/patients/${id}/oral-exams/${exam.id}/view`}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:underline"
                  >
                    <Eye className="size-3.5 shrink-0" aria-hidden />
                    View
                  </Link>
                  <Link
                    href={`/dashboard/patients/${id}/oral-exams/${exam.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <Pencil className="size-3.5 shrink-0" aria-hidden />
                    Edit
                  </Link>
                  <form action={deleteOralExaminationAction}>
                    <input type="hidden" name="patient_id" value={id} />
                    <input type="hidden" name="examination_id" value={exam.id} />
                    <SubmitButton pendingText="Deleting…" className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50">
                      <Trash2 className="size-3.5 shrink-0" aria-hidden />
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
              <ExamFindingsTable findings={findingsByExam.get(exam.id) ?? []} showTreatmentNeeds />
              {exam.notes ? <p className="text-sm text-muted-foreground">Note: {exam.notes}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
