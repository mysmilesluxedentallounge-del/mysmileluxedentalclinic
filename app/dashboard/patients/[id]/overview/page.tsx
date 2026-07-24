import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  MessageSquare,
  Receipt,
  Stethoscope,
  UserRound,
  Wallet,
} from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { OralExamination, Patient, PatientFile, WorkDone } from "@/lib/database.types"
import { DENTITION_LABELS, toothLabel } from "@/lib/dental-charting"
import { WORK_DONE_STATUS_LABELS } from "@/lib/work-done"
import { chiefComplaintFromRow, chiefComplaintSummary } from "@/lib/chief-complaint"
import { fileCategoryLabel } from "@/lib/patient-files"
import DownloadInvoiceButton from "@/app/dashboard/billing/download-invoice-button"
import InlineFormCard from "@/components/dashboard/inline-form-card"
import InlineOralExamForm from "../inline-forms/oral-exam-form"
import InlineWorkDoneForm from "../inline-forms/work-done-form"
import InlineInvoiceForm from "../inline-forms/invoice-form"
import InlineAppointmentForm from "../inline-forms/appointment-form"
import InlineFileUploadForm from "../inline-forms/file-upload-form"
import InlinePatientProfileForm from "../inline-forms/patient-profile-form"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

const emptyText = "No records yet."

type InvoiceRow = { id: string; amount: number; status: string; invoice_date: string }
type AppointmentRow = {
  id: string
  appointment_date: string
  appointment_time: string
  status: string
  chief_complaint: unknown
  treatment: string | null
}

export default async function PatientOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ added?: string; updated?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { added, updated } = await searchParams
  const supabase = await createSupabaseServerClient()
  const base = `/dashboard/patients/${id}`
  const here = (kind: string) => `${base}/overview?added=${kind}`

  const [
    { data: patientData },
    { data: invoiceRows },
    { data: examRows },
    { data: workRows },
    { data: apptRows },
    { data: fileRows },
  ] = await Promise.all([
    supabase.from("patients").select("id, full_name, phone, email, gender, dob, address").eq("id", id).maybeSingle(),
    supabase.from("invoices").select("id, amount, status, invoice_date").eq("patient_id", id).order("invoice_date", { ascending: false }),
    supabase.from("oral_examinations").select("id, exam_date, dentition").eq("patient_id", id).order("exam_date", { ascending: false }).limit(4),
    supabase.from("work_done").select("id, treatment_name, tooth_number, status, work_date").eq("patient_id", id).order("work_date", { ascending: false }).limit(4),
    supabase.from("appointments").select("id, appointment_date, appointment_time, status, chief_complaint, treatment, doctor_id").eq("patient_id", id).order("appointment_date", { ascending: false }).limit(4),
    supabase.from("patient_files").select("id, category, file_name, label, created_at").eq("patient_id", id).order("created_at", { ascending: false }).limit(4),
  ])

  if (!patientData) notFound()
  const patient = patientData as Pick<Patient, "id" | "full_name" | "phone" | "email" | "gender" | "dob" | "address">

  const invoices = (invoiceRows as InvoiceRow[] | null) ?? []
  const exams = (examRows as Pick<OralExamination, "id" | "exam_date" | "dentition">[] | null) ?? []
  const work = (workRows as Pick<WorkDone, "id" | "treatment_name" | "tooth_number" | "status" | "work_date">[] | null) ?? []
  const appointments = (apptRows as (AppointmentRow & { doctor_id: string })[] | null) ?? []
  const files = (fileRows as Pick<PatientFile, "id" | "category" | "file_name" | "label" | "created_at">[] | null) ?? []

  const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0)
  const totalDue = invoices.filter((inv) => inv.status !== "paid").reduce((sum, inv) => sum + Number(inv.amount), 0)

  let primaryDentist = "Not assigned"
  const doctorId = appointments[0]?.doctor_id
  if (doctorId) {
    const { data: doc } = await supabase.from("profiles").select("full_name").eq("id", doctorId).maybeSingle()
    if (doc?.full_name) primaryDentist = doc.full_name
  }

  const complaints = appointments
    .map((appt) => ({ id: appt.id, date: appt.appointment_date, text: chiefComplaintSummary(chiefComplaintFromRow(appt.chief_complaint, appt.treatment)) }))
    .filter((item) => item.text)

  const banner = added
    ? added === "exam"
      ? "Oral examination saved."
      : added === "plan"
        ? "Treatment plan saved."
        : added === "work"
          ? "Work done recorded."
          : added === "invoice"
            ? "Invoice created."
            : added === "appointment"
              ? "Appointment booked."
              : added === "file"
                ? "File uploaded."
                : "Record saved."
    : updated
      ? "Patient profile updated."
      : null

  return (
    <section className="space-y-6">
      {banner ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{banner}</p>
      ) : null}

      <header className="rounded-lg border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/dashboard/patients" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
              Back to patients
            </Link>
            <h1 className="font-heading text-3xl">{patient.full_name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.phone || "No phone"} · Primary Dentist: {primaryDentist}
            </p>
          </div>
          <div className="flex gap-6 rounded-md border bg-slate-50 px-4 py-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Invoiced</p>
              <p className="font-semibold">{formatCurrency(totalInvoiced)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Amount Due</p>
              <p className={`font-semibold ${totalDue > 0 ? "text-red-600" : "text-emerald-600"}`}>{formatCurrency(totalDue)}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT: Profile · File · Appointment · Receipt */}
        <div className="space-y-5">
          <InlineFormCard
            title="Patient Profile"
            icon={<UserRound className="size-4 shrink-0" aria-hidden />}
            viewAllHref={`${base}/view`}
            addLabel="Edit profile"
            form={<InlinePatientProfileForm patient={patient} redirectTo={`${base}/overview?updated=1`} />}
          >
            <p className="font-medium">{patient.full_name}</p>
            <p className="text-muted-foreground">{patient.phone || "No phone"} · {patient.email || "No email"}</p>
            <p className="text-muted-foreground">{patient.address || "No address"}</p>
          </InlineFormCard>

          <InlineFormCard
            title="File"
            icon={<FolderOpen className="size-4 shrink-0" aria-hidden />}
            viewAllHref={`${base}/files`}
            addLabel="Upload file"
            form={<InlineFileUploadForm patientId={id} redirectTo={here("file")} />}
          >
            {files.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {files.map((file) => (
                  <li key={file.id} className="flex justify-between gap-2">
                    <span className="truncate">{file.label || file.file_name}</span>
                    <span className="shrink-0 text-muted-foreground">{fileCategoryLabel(file.category)}</span>
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>

          <InlineFormCard
            title="Appointment"
            icon={<CalendarDays className="size-4 shrink-0" aria-hidden />}
            viewAllHref="/dashboard/appointments"
            addLabel="Book appointment"
            form={<InlineAppointmentForm patientId={id} redirectTo={here("appointment")} />}
          >
            {appointments.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {appointments.map((appt) => (
                  <li key={appt.id}>
                    <Link href={`/dashboard/appointments/${appt.id}`} className="flex justify-between gap-2 hover:underline">
                      <span>{appt.appointment_date} {appt.appointment_time?.slice(0, 5)}</span>
                      <span className="text-muted-foreground capitalize">{appt.status}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>

          <InlineFormCard
            title="Receipt"
            icon={<Receipt className="size-4 shrink-0" aria-hidden />}
            viewAllHref="/dashboard/billing"
          >
            {invoices.length === 0 ? (
              <p className="text-muted-foreground">No receipts yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {invoices.slice(0, 4).map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2">
                    <span>{inv.invoice_date} · {formatCurrency(Number(inv.amount))}</span>
                    <DownloadInvoiceButton invoiceId={inv.id} />
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>
        </div>

        {/* RIGHT: Chief Complaint · Oral Examination · Work Done · Invoice */}
        <div className="space-y-5">
          <InlineFormCard
            title="Chief Complaint"
            icon={<MessageSquare className="size-4 shrink-0" aria-hidden />}
            viewAllHref={`${base}/oral-exams`}
          >
            {complaints.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {complaints.map((item) => (
                  <li key={item.id} className="flex justify-between gap-2">
                    <span className="truncate">{item.text}</span>
                    <span className="shrink-0 text-muted-foreground">{item.date}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Recorded with each appointment and oral examination.
            </p>
          </InlineFormCard>

          <InlineFormCard
            title="Oral Examination"
            icon={<Stethoscope className="size-4 shrink-0" aria-hidden />}
            viewAllHref={`${base}/oral-exams`}
            addLabel="Add oral exam"
            form={<InlineOralExamForm patientId={id} redirectTo={here("exam")} />}
          >
            {exams.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {exams.map((exam) => (
                  <li key={exam.id}>
                    <Link href={`${base}/oral-exams/${exam.id}/view`} className="flex justify-between hover:underline">
                      <span>{exam.exam_date}</span>
                      <span className="text-muted-foreground">{DENTITION_LABELS[exam.dentition]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>

          <InlineFormCard
            title="Work Done"
            icon={<ClipboardCheck className="size-4 shrink-0" aria-hidden />}
            viewAllHref={`${base}/work-done`}
            addLabel="Record work done"
            form={<InlineWorkDoneForm patientId={id} redirectTo={here("work")} />}
          >
            {work.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {work.map((row) => (
                  <li key={row.id} className="flex justify-between gap-2">
                    <span className="truncate">
                      {row.treatment_name}
                      {row.tooth_number ? <span className="text-muted-foreground"> · {toothLabel(row.tooth_number)}</span> : null}
                    </span>
                    <span className="shrink-0 text-muted-foreground">{WORK_DONE_STATUS_LABELS[row.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>

          <InlineFormCard
            title="Invoice"
            icon={<Wallet className="size-4 shrink-0" aria-hidden />}
            viewAllHref="/dashboard/billing"
            addLabel="Create invoice"
            form={<InlineInvoiceForm patientId={id} redirectTo={here("invoice")} />}
          >
            {invoices.length === 0 ? (
              <p className="text-muted-foreground">{emptyText}</p>
            ) : (
              <ul className="space-y-1.5">
                {invoices.slice(0, 4).map((inv) => (
                  <li key={inv.id}>
                    <Link href={`/dashboard/billing/${inv.id}`} className="flex justify-between hover:underline">
                      <span>{inv.invoice_date}</span>
                      <span className="text-muted-foreground">
                        {formatCurrency(Number(inv.amount))} · {inv.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </InlineFormCard>
        </div>
      </div>
    </section>
  )
}
