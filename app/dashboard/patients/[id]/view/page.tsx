import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Patient } from "@/lib/database.types"
import PatientClinicalFields from "@/app/dashboard/patients/patient-clinical-fields"

export default async function PatientViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: patient }, { data: appointments }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, treatment")
      .eq("patient_id", id)
      .order("appointment_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, amount, status, invoice_date")
      .eq("patient_id", id)
      .order("invoice_date", { ascending: false }),
  ])

  if (!patient) notFound()
  const typedPatient = patient as Patient

  return (
    <section className="space-y-6">
      <header className="rounded-lg border bg-white p-5">
        <Link href="/dashboard/patients" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to patients
        </Link>
        <h1 className="font-heading text-3xl">{patient.full_name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {patient.phone || "No phone"} | {patient.email || "No email"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Gender: {patient.gender || "Not specified"}</p>
        <p className="mt-1 text-sm text-muted-foreground">{patient.address || "No address"}</p>
      </header>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Patient details</h2>
        <fieldset disabled className="mt-3 grid gap-3 md:grid-cols-2 disabled:opacity-100">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Full name</span>
            <input value={patient.full_name ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Phone</span>
            <input value={patient.phone ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Email</span>
            <input value={patient.email ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Gender</span>
            <select value={patient.gender ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Date of birth</span>
            <input type="date" value={patient.dob ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Address</span>
            <input value={patient.address ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </fieldset>
      </section>

      <section className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Clinical information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Medical history, dental visit, medication, allergies, and patient notes.</p>
        <fieldset disabled className="mt-4 disabled:opacity-100">
          <PatientClinicalFields
            defaultMedicalHistory={typedPatient.medical_history}
            defaultDentalVisit={typedPatient.dental_visit}
            defaultMedication={typedPatient.medication}
            defaultAllergies={typedPatient.allergies}
            defaultPatientNotes={typedPatient.patient_notes}
          />
        </fieldset>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Appointments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {appointments?.map((item) => (
              <li key={item.id} className="rounded border p-3">
                <p>
                  {item.appointment_date} at {item.appointment_time}
                </p>
                <p className="text-muted-foreground">{item.status}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invoices?.map((item) => (
              <li key={item.id} className="rounded border p-3">
                <p>Rs. {Number(item.amount).toFixed(2)}</p>
                <p className="text-muted-foreground">
                  {item.status} - {item.invoice_date}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
