import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { addDaysToISODate, getWeekDayDates, resolveSchedulerWeekStart } from "@/lib/scheduler-week"
import SchedulerView, { type SchedulerAppointment } from "./scheduler-view"

type SchedulerSearchParams = {
  week?: string
}

const dayHeaderFormatter = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  month: "short",
  day: "numeric",
})

const rangeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export default async function SchedulerPage({
  searchParams,
}: {
  searchParams: Promise<SchedulerSearchParams>
}) {
  await requireAuth()
  const { week } = await searchParams
  const weekStart = resolveSchedulerWeekStart(week)
  const weekEnd = addDaysToISODate(weekStart, 6)
  const weekDates = getWeekDayDates(weekStart)

  const weekDays = weekDates.map((date) => ({
    date,
    headerLabel: dayHeaderFormatter.format(new Date(`${date}T12:00:00.000Z`)),
  }))

  const rangeLabel = `${rangeFormatter.format(new Date(`${weekStart}T12:00:00.000Z`))} – ${rangeFormatter.format(
    new Date(`${weekEnd}T12:00:00.000Z`)
  )}`

  const prevWeekStart = addDaysToISODate(weekStart, -7)
  const nextWeekStart = addDaysToISODate(weekStart, 7)

  const supabase = await createSupabaseServerClient()
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, patient_id, appointment_date, appointment_time, status, treatment, patients(id, full_name, phone, email), profiles(full_name)"
    )
    .gte("appointment_date", weekStart)
    .lte("appointment_date", weekEnd)
    .order("appointment_date", { ascending: true })
    .order("appointment_time", { ascending: true })

  const typedAppointments = ((appointments ?? []) as unknown) as SchedulerAppointment[]

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl">Scheduler</h1>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/scheduler?week=${prevWeekStart}`}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Previous week"
            >
              <ChevronLeft size={18} aria-hidden />
              <span className="hidden sm:inline">Previous</span>
            </Link>
            <Link
              href={`/dashboard/scheduler?week=${nextWeekStart}`}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              aria-label="Next week"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight size={18} aria-hidden />
            </Link>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-slate-700 sm:text-left">{rangeLabel}</p>
        <p className="text-sm text-muted-foreground">
          Two-hour blocks match clinic hours. Click a cell to see 30-minute slots and booked patients.
        </p>
        <p className="text-xs text-muted-foreground">
          Week boundaries use UTC calendar dates; adjust if you need strict local-time weeks.
        </p>
      </header>

      <SchedulerView weekDays={weekDays} appointments={typedAppointments} />
    </section>
  )
}
