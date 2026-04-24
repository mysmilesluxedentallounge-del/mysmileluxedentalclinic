import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createAppointmentAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const DEFAULT_DOCTOR_NAME = "Dr Shridha Prabhu"
const TIME_SLOTS = Array.from({ length: 19 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30
  const hours24 = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const value = `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  const hours12 = hours24 % 12 || 12
  const period = hours24 >= 12 ? "PM" : "AM"
  const label = `${hours12}:${String(minutes).padStart(2, "0")} ${period}`
  return { value, label }
})

function isDefaultDoctorName(name: string | null | undefined) {
  if (!name) return false
  const normalized = name.toLowerCase().replace(/\./g, "").trim()
  return normalized.includes("shridha") && normalized.includes("prabhu")
}

export default async function NewAppointmentPage() {
  await requireAuth()
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
      <header className="space-y-2">
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          &larr; Back to appointments
        </Link>
        <h1 className="font-heading text-3xl">Add appointment</h1>
        <p className="text-sm text-muted-foreground">Enter appointment details to schedule a new visit.</p>
      </header>

      <form action={createAppointmentAction} className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <select name="patient_id" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>

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
                Default doctor profile not found. Create a doctor in Users page with name containing
                "Shridha Prabhu".
              </p>
            )}
          </div>

          <input name="appointment_date" type="date" required className="rounded-md border px-3 py-2 text-sm" />
          <select name="appointment_time" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>
          <input name="treatment" placeholder="Treatment" className="rounded-md border px-3 py-2 text-sm" />
          <select name="status" defaultValue="scheduled" className="rounded-md border px-3 py-2 text-sm">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <textarea name="notes" placeholder="Notes" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save appointment
        </button>
      </form>
    </section>
  )
}
