import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Pencil } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, OralExaminationFinding } from "@/lib/database.types"
import { DENTITION_LABELS } from "@/lib/dental-charting"
import { chiefComplaintFromRow, chiefComplaintSummary } from "@/lib/chief-complaint"
import ExamFindingsTable from "@/components/dental/exam-findings-table"

const QUICK_LABELS: Record<string, string> = { clinical: "Yes (Clinical)", aesthetic: "Yes (Aesthetic)", no: "No" }

export default async function ViewOralExamPage({
  params,
}: {
  params: Promise<{ id: string; examId: string }>
}) {
  await requireAuth()
  const { id, examId } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: examData }, { data: findingRows }] = await Promise.all([
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
  ])

  const exam = examData as OralExamination | null
  if (!exam || exam.patient_id !== id) notFound()

  const findings = (findingRows as OralExaminationFinding[] | null) ?? []
  const chiefComplaint = chiefComplaintSummary(chiefComplaintFromRow(exam.chief_complaint, null))

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/dashboard/patients/${id}/oral-exams`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
            <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
            Back to oral exams
          </Link>
          <h1 className="font-heading text-3xl">Oral exam</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {exam.exam_date} · {DENTITION_LABELS[exam.dentition]}
          </p>
        </div>
        <Link
          href={`/dashboard/patients/${id}/oral-exams/${exam.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <Pencil className="size-3.5 shrink-0" aria-hidden />
          Edit
        </Link>
      </header>

      <div className="rounded-lg border bg-white p-4 text-sm">
        {chiefComplaint ? <p><span className="font-medium">Chief complaint:</span> {chiefComplaint}</p> : null}
        {exam.quick_findings?.malocclusion ? (
          <p><span className="font-medium">Malocclusion:</span> {QUICK_LABELS[exam.quick_findings.malocclusion]}</p>
        ) : null}
        {exam.quick_findings?.missing_tooth ? (
          <p><span className="font-medium">Missing tooth:</span> {QUICK_LABELS[exam.quick_findings.missing_tooth]}</p>
        ) : null}
        {exam.notes ? <p className="mt-1 text-muted-foreground">Note: {exam.notes}</p> : null}
      </div>

      <ExamFindingsTable findings={findings} />
    </section>
  )
}
