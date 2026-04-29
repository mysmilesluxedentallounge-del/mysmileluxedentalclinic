import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deletePatientAction, updatePatientClinicalAction, updatePatientDetailsAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Patient } from "@/lib/database.types"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import PatientClinicalFields from "@/app/dashboard/patients/patient-clinical-fields"

export default async function PatientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { updated } = await searchParams
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

  if (!patient) {
    notFound()
  }

  const typedPatient = patient as Patient

  return (
    <section className="space-y-6">
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {updated === "details"
            ? "Patient details updated successfully."
            : updated === "clinical"
              ? "Clinical information updated successfully."
              : "Updated successfully."}
        </p>
      ) : null}

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
        <form action={deletePatientAction} className="mt-3">
          <input type="hidden" name="patient_id" value={patient.id} />
          <input type="hidden" name="redirect_to" value="/dashboard/patients" />
          <button type="submit" className={`${dashboardDangerOutlineButtonClass} mt-3`}>
            <Trash2 className="size-4 shrink-0" aria-hidden />
            Delete patient
          </button>
        </form>
      </header>

      <form action={updatePatientDetailsAction} className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Patient details</h2>
        <input type="hidden" name="patient_id" value={patient.id} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Full name</span>
            <input
              name="full_name"
              required
              defaultValue={patient.full_name ?? ""}
              placeholder="Full name"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Phone</span>
            <input
              name="phone"
              defaultValue={patient.phone ?? ""}
              placeholder="Phone"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={patient.email ?? ""}
              placeholder="Email"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Gender</span>
            <select name="gender" defaultValue={patient.gender ?? ""} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Date of birth</span>
            <input name="dob" type="date" defaultValue={patient.dob ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Address</span>
            <input
              name="address"
              defaultValue={patient.address ?? ""}
              placeholder="Address"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <button type="submit" className={`${dashboardPrimaryButtonClass} mt-3`}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update patient details
        </button>
      </form>

      <form action={updatePatientClinicalAction} className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Clinical information</h2>
        <p className="mt-1 text-sm text-muted-foreground">Medical history, dental visit, medication, allergies, and patient notes.</p>
        <input type="hidden" name="patient_id" value={patient.id} />
        <div className="mt-4">
          <PatientClinicalFields
            defaultMedicalHistory={typedPatient.medical_history}
            defaultDentalVisit={typedPatient.dental_visit}
            defaultMedication={typedPatient.medication}
            defaultAllergies={typedPatient.allergies}
            defaultPatientNotes={typedPatient.patient_notes}
          />
        </div>
        <button type="submit" className={`${dashboardPrimaryButtonClass} mt-4`}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update clinical information
        </button>
      </form>

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
