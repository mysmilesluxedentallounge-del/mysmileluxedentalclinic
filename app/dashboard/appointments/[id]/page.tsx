import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { deleteAppointmentAction, updateAppointmentDetailsAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

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

export default async function AppointmentDetailPage({
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

  const [{ data: appointment }, { data: patients }, { data: doctors }] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment, notes")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase.from("profiles").select("id, full_name").eq("role", "doctor").order("full_name"),
  ])

  if (!appointment) {
    notFound()
  }

  return (
    <section className="space-y-6">
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Appointment updated successfully.
        </p>
      ) : null}

      <header className="space-y-2">
        <Link
          href="/dashboard/appointments"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          &larr; Back to appointments
        </Link>
        <h1 className="font-heading text-3xl">Update appointment</h1>
        <p className="text-sm text-muted-foreground">Edit patient, doctor, schedule, status, and notes.</p>
      </header>

      <form action={updateAppointmentDetailsAction} className="rounded-lg border bg-white p-5">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <select name="patient_id" required defaultValue={appointment.patient_id} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>

          <select name="doctor_id" required defaultValue={appointment.doctor_id} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select doctor</option>
            {doctors?.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name || "Doctor"}
              </option>
            ))}
          </select>

          <input
            name="appointment_date"
            type="date"
            required
            defaultValue={appointment.appointment_date}
            className="rounded-md border px-3 py-2 text-sm"
          />

          <select
            name="appointment_time"
            required
            defaultValue={appointment.appointment_time?.slice(0, 5)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select time slot</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label}
              </option>
            ))}
          </select>

          <input
            name="treatment"
            defaultValue={appointment.treatment ?? ""}
            placeholder="Treatment"
            className="rounded-md border px-3 py-2 text-sm"
          />

          <select name="status" defaultValue={appointment.status} className="rounded-md border px-3 py-2 text-sm">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <textarea
            name="notes"
            defaultValue={appointment.notes ?? ""}
            placeholder="Notes"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
        </div>

        <button type="submit" className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Update appointment
        </button>
      </form>

      <form action={deleteAppointmentAction}>
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <input type="hidden" name="redirect_to" value="/dashboard/appointments" />
        <button type="submit" className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600">
          Delete appointment
        </button>
      </form>
    </section>
  )
}
