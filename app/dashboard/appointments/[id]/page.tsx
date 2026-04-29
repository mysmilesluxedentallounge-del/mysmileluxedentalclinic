import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deleteAppointmentAction, updateAppointmentDetailsAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BOOKING_TIME_SLOTS } from "@/lib/appointment-schedule"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"

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
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to appointments
        </Link>
        <h1 className="font-heading text-3xl">Update appointment</h1>
        <p className="text-sm text-muted-foreground">Edit patient, doctor, schedule, status, and notes.</p>
      </header>

      <form action={updateAppointmentDetailsAction} className="rounded-lg border bg-white p-5">
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Patient</span>
            <select
              name="patient_id"
              required
              defaultValue={appointment.patient_id}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select patient</option>
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Doctor</span>
            <select
              name="doctor_id"
              required
              defaultValue={appointment.doctor_id}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select doctor</option>
              {doctors?.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name || "Doctor"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Appointment date</span>
            <input
              name="appointment_date"
              type="date"
              required
              defaultValue={appointment.appointment_date}
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Appointment time</span>
            <select
              name="appointment_time"
              required
              defaultValue={appointment.appointment_time?.slice(0, 5)}
              className="w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="">Select time slot</option>
              {BOOKING_TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Treatment</span>
            <input
              name="treatment"
              defaultValue={appointment.treatment ?? ""}
              placeholder="Treatment"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select name="status" defaultValue={appointment.status} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Notes</span>
            <textarea
              name="notes"
              defaultValue={appointment.notes ?? ""}
              placeholder="Notes"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button type="submit" className={`${dashboardPrimaryButtonClass} mt-4`}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update appointment
        </button>
      </form>

      <form action={deleteAppointmentAction}>
        <input type="hidden" name="appointment_id" value={appointment.id} />
        <input type="hidden" name="redirect_to" value="/dashboard/appointments" />
        <button type="submit" className={dashboardDangerOutlineButtonClass}>
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Delete appointment
        </button>
      </form>
    </section>
  )
}
