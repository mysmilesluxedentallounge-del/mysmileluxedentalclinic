import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createAppointmentAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import ChiefComplaintFields from "@/app/dashboard/appointments/chief-complaint-fields"
import SubmitButton from "@/app/dashboard/submit-button"
import { BOOKING_TIME_SLOTS } from "@/lib/appointment-schedule"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"

const DEFAULT_DOCTOR_NAME = "Dr Shridha Prabhu"

function isDefaultDoctorName(name: string | null | undefined) {
  if (!name) return false
  const normalized = name.toLowerCase().replace(/\./g, "").trim()
  return normalized.includes("shridha") && normalized.includes("prabhu")
}

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  await requireAuth()
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()
  const [{ data: patients }, { data: doctors }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "doctor")
      .order("full_name"),
  ])
  const defaultDoctor = doctors?.find((doctor) => isDefaultDoctorName(doctor.full_name)) ?? null

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "missing_required_fields"
            ? "Please fill all required fields."
            : "Could not save appointment. Please try again."}
        </p>
      ) : null}
      <header className="space-y-2">
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to appointments
        </Link>
        <h1 className="font-heading text-3xl">Add appointment</h1>
        <p className="text-sm text-muted-foreground">Enter appointment details to schedule a new visit.</p>
      </header>

      <form action={createAppointmentAction} className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Patient</span>
            <select name="patient_id" required className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select patient</option>
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Doctor</p>
            <input
              value={DEFAULT_DOCTOR_NAME}
              readOnly
              className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            {defaultDoctor ? (
              <input type="hidden" name="doctor_id" value={defaultDoctor.id} />
            ) : (
              <p className="text-xs text-red-600">
                Default doctor profile not found. Create a doctor in Users page with name containing{' '}
                <span className="whitespace-nowrap">&quot;Shridha Prabhu&quot;.</span>
              </p>
            )}
          </div>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Appointment date</span>
            <input name="appointment_date" type="date" required className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Appointment time</span>
            <select name="appointment_time" required className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select time slot</option>
              {BOOKING_TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <ChiefComplaintFields className="md:col-span-2" />
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue="scheduled" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Notes</span>
            <textarea name="notes" placeholder="Notes" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>
        <SubmitButton
          pendingText="Saving appointment..."
          className={`${dashboardPrimaryButtonClass} mt-3 disabled:opacity-60`}
        >
          <Save className="size-4 shrink-0" aria-hidden />
          Save appointment
        </SubmitButton>
      </form>
    </section>
  )
}
