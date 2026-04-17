import { requireAuth } from "@/lib/auth"
import {
  createAppointmentAction,
  updateAppointmentStatusAction,
} from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type AppointmentRow = {
  id: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  patients: { full_name: string } | null
  profiles: { full_name: string } | null
}

export default async function AppointmentsPage() {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const [{ data: patients }, { data: doctors }, { data: appointments }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("role", "doctor")
      .order("full_name"),
    supabase
      .from("appointments")
      .select(
        "id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment, patients(full_name), profiles(full_name)"
      )
      .order("appointment_date", { ascending: true }),
  ])

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl">Appointments</h1>
        <p className="mt-2 text-sm text-muted-foreground">Schedule and update appointments.</p>
      </header>

      <form action={createAppointmentAction} className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Add appointment</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select name="patient_id" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>

          <select
            name="doctor_id"
            required
            defaultValue={profile.role === "doctor" ? profile.id : ""}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="">Select doctor</option>
            {doctors?.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.full_name || doctor.id}
              </option>
            ))}
          </select>

          <input name="appointment_date" type="date" required className="rounded-md border px-3 py-2 text-sm" />
          <input name="appointment_time" type="time" required className="rounded-md border px-3 py-2 text-sm" />
          <input name="treatment" placeholder="Treatment" className="rounded-md border px-3 py-2 text-sm" />
          <select name="status" defaultValue="scheduled" className="rounded-md border px-3 py-2 text-sm">
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <textarea
            name="notes"
            placeholder="Notes"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save appointment
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Date & time</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Doctor</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Update</th>
            </tr>
          </thead>
          <tbody>
            {(appointments as AppointmentRow[] | null)?.map((appointment) => (
              <tr key={appointment.id} className="border-t">
                <td className="px-4 py-2">
                  {appointment.appointment_date} {appointment.appointment_time}
                </td>
                <td className="px-4 py-2">{appointment.patients?.full_name || "-"}</td>
                <td className="px-4 py-2">{appointment.profiles?.full_name || "-"}</td>
                <td className="px-4 py-2">{appointment.status}</td>
                <td className="px-4 py-2">
                  <form action={updateAppointmentStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="appointment_id" value={appointment.id} />
                    <select
                      name="status"
                      defaultValue={appointment.status}
                      className="rounded-md border px-2 py-1 text-xs"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button className="rounded bg-slate-900 px-2 py-1 text-xs text-white" type="submit">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
