import Link from "next/link"
import { CalendarPlus, CalendarRange, ChevronLeft, ChevronRight, ListFilter, Pencil, RotateCcw, Save, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import {
  dashboardDeleteActionClass,
  dashboardEditActionClass,
  dashboardPrimaryButtonClass,
  dashboardSecondaryButtonClass,
} from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableEmptyRowClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
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
  added?: string
}

const PAGE_SIZE = 10

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<AppointmentSearchParams>
}) {
  await requireAuth()
  const { q = "", status = "", date = "", page = "1", added } = await searchParams
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
      {added ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Appointment added successfully.
        </p>
      ) : null}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Appointments</h1>
          <p className="mt-2 text-sm text-muted-foreground">Schedule and update appointments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/scheduler"
            className={`${dashboardSecondaryButtonClass} border-slate-300 bg-white`}
          >
            <CalendarRange className="size-4 shrink-0" aria-hidden />
            Scheduler
          </Link>
          <Link href="/dashboard/appointments/new" className={dashboardPrimaryButtonClass}>
            <CalendarPlus className="size-4 shrink-0" aria-hidden />
            Add Appointment
          </Link>
        </div>
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
            <button type="submit" className={dashboardPrimaryButtonClass}>
              <ListFilter className="size-4 shrink-0" aria-hidden />
              Apply
            </button>
            <Link href="/dashboard/appointments" className={`${dashboardSecondaryButtonClass} border-slate-300 bg-white`}>
              <RotateCcw className="size-4 shrink-0" aria-hidden />
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className={dashboardTableWrapperClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Date & time</th>
              <th className={dashboardTableThClass}>Patient</th>
              <th className={dashboardTableThClass}>Doctor</th>
              <th className={dashboardTableThClass}>Status</th>
              <th className={dashboardTableThClass}>Update</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAppointments.map((appointment, index) => (
              <tr key={appointment.id} className={dashboardTableBodyRowClass(index)}>
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
                    <button
                      className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs text-white"
                      type="submit"
                    >
                      <Save className="size-3 shrink-0" aria-hidden />
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/dashboard/appointments/${appointment.id}`} className={dashboardEditActionClass}>
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                    <form action={deleteAppointmentAction} className="inline">
                      <input type="hidden" name="appointment_id" value={appointment.id} />
                      <button type="submit" className={dashboardDeleteActionClass}>
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAppointments.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={7}>
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
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={getPageHref(Math.min(totalPages, currentPage + 1))}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
              <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
