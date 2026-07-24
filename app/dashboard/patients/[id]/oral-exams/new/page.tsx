import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createOralExaminationAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import ChiefComplaintFields from "@/app/dashboard/appointments/chief-complaint-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import OralExamFields from "../oral-exam-fields"

export default async function NewOralExamPage({
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

  const [{ data: patient }, { data: appointments }] = await Promise.all([
    supabase.from("patients").select("id, full_name").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("id, appointment_date")
      .eq("patient_id", id)
      .order("appointment_date", { ascending: false }),
  ])
  if (!patient) notFound()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "save_failed" ? "Could not save the oral exam. Please try again." : `Could not save: ${error}`}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href={`/dashboard/patients/${id}/oral-exams`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to oral exams
        </Link>
        <h1 className="font-heading text-3xl">New oral exam</h1>
        <p className="text-sm text-muted-foreground">{patient.full_name}</p>
      </header>

      <form action={createOralExaminationAction} className="space-y-5">
        <input type="hidden" name="patient_id" value={id} />

        <div className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Exam date
            </FormLabel>
            <input name="exam_date" type="date" required defaultValue={today} className="w-full rounded-md border px-3 py-2 text-sm" />
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

        <ChiefComplaintFields />

        <OralExamFields />

        <label className="block space-y-1 rounded-lg border bg-white p-4">
          <span className="block text-sm font-medium text-slate-700">Overall exam notes (optional)</span>
          <textarea name="notes" placeholder="Summary notes for this examination" className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" />
        </label>

        <SubmitButton pendingText="Saving exam…" className={dashboardPrimaryButtonClass}>
          <Save className="size-4 shrink-0" aria-hidden />
          Save oral exam
        </SubmitButton>
      </form>
    </section>
  )
}
