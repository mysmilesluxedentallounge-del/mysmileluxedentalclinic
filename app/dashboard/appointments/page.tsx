import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { deleteAppointmentAction, updateAppointmentStatusAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type AppointmentRow = {
  id: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  treatment: string | null
  patients: { full_name: string } | null
  profiles: { full_name: string } | null
}

type AppointmentSearchParams = {
  q?: string
  status?: string
  date?: string
  page?: string
}

const PAGE_SIZE = 10

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<AppointmentSearchParams>
}) {
  await requireAuth()
  const { q = "", status = "", date = "", page = "1" } = await searchParams
  const searchQuery = q.trim()
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from("appointments")
    .select(
      "id, patient_id, doctor_id, appointment_date, appointment_time, status, treatment, patients(full_name), profiles(full_name)"
    )

  if (status && ["scheduled", "completed", "cancelled"].includes(status)) {
    query = query.eq("status", status)
  }
  if (date) {
    query = query.eq("appointment_date", date)
  }

  const { data: appointments } = await query.order("appointment_date", { ascending: true })
  const filteredAppointments = ((appointments as AppointmentRow[] | null) ?? []).filter((appointment) => {
    if (!searchQuery) return true
    const haystack = `${appointment.patients?.full_name ?? ""} ${appointment.profiles?.full_name ?? ""} ${
      appointment.treatment ?? ""
    }`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + PAGE_SIZE)

  function getPageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (status) params.set("status", status)
    if (date) params.set("date", date)
    params.set("page", String(nextPage))
    return `/dashboard/appointments?${params.toString()}`
  }

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Appointments</h1>
          <p className="mt-2 text-sm text-muted-foreground">Schedule and update appointments.</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Appointment
        </Link>
      </header>

      <form className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search patient, doctor, treatment"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
          <select name="status" defaultValue={status} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input type="date" name="date" defaultValue={date} className="rounded-md border px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Apply
            </button>
            <Link href="/dashboard/appointments" className="rounded-md border px-4 py-2 text-sm font-medium">
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Date & time</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Doctor</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Update</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((appointment, index) => (
              <tr key={appointment.id} className="border-t">
                <td className="px-4 py-2">{startIndex + index + 1}</td>
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
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/appointments/${appointment.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deleteAppointmentAction}>
                      <input type="hidden" name="appointment_id" value={appointment.id} />
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAppointments.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={8}>
                  No appointments found for current search/filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filteredAppointments.length)} of{" "}
            {filteredAppointments.length}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={getPageHref(Math.max(1, currentPage - 1))}
              className={`rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={getPageHref(Math.min(totalPages, currentPage + 1))}
              className={`rounded-md border px-3 py-1 text-sm ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
