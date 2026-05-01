import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { chiefComplaintFromRow } from "@/lib/chief-complaint"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BOOKING_TIME_SLOTS } from "@/lib/appointment-schedule"

export default async function AppointmentViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: patients }, { data: doctors }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase.from("profiles").select("id, full_name").eq("role", "doctor").order("full_name"),
  ])

  let appointmentResult = await supabase
    .from("appointments")
    .select("id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment, chief_complaint, notes")
    .eq("id", id)
    .maybeSingle()
  if (appointmentResult.error && /chief_complaint/i.test(appointmentResult.error.message)) {
    appointmentResult = await supabase
      .from("appointments")
      .select("id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment, notes")
      .eq("id", id)
      .maybeSingle()
  }
  const appointment = appointmentResult.data as
    | {
        id: string
        patient_id: string
        doctor_id: string
        appointment_date: string
        appointment_time: string
        status: "scheduled" | "completed" | "cancelled"
        treatment: string | null
        chief_complaint?: unknown
        notes: string | null
      }
    | null

  if (!appointment) notFound()
  const chiefComplaint = chiefComplaintFromRow(appointment.chief_complaint, appointment.treatment)

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Link href="/dashboard/appointments" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to appointments
        </Link>
        <h1 className="font-heading text-3xl">View appointment</h1>
        <p className="text-sm text-muted-foreground">Read-only appointment details.</p>
      </header>

      <section className="rounded-lg border bg-white p-5">
        <fieldset disabled className="grid gap-3 md:grid-cols-2 disabled:opacity-100">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Patient</span>
            <select value={appointment.patient_id} className="w-full rounded-md border px-3 py-2 text-sm">
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
            <select value={appointment.doctor_id} className="w-full rounded-md border px-3 py-2 text-sm">
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
            <input type="date" value={appointment.appointment_date} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Appointment time</span>
            <select value={appointment.appointment_time?.slice(0, 5)} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select time slot</option>
              {BOOKING_TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Chief complaint</span>
            <div className="rounded-md border p-3">
              {chiefComplaint.tags.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {chiefComplaint.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-[var(--yellow-lightest)] px-3 py-1 text-xs font-medium text-[var(--brand-dark)] ring-1 ring-[var(--yellow-mid)]/40">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <p className="text-sm text-slate-700">{chiefComplaint.other || "—"}</p>
            </div>
          </div>

          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Status</span>
            <select value={appointment.status} className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Notes</span>
            <textarea value={appointment.notes ?? ""} placeholder="Notes" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </fieldset>
      </section>
    </section>
  )
}
