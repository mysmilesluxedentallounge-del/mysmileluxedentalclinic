import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardPage() {
  await requireAuth()
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 8)}01`
  const monthCursor = new Date(`${today}T00:00:00`)
  monthCursor.setMonth(monthCursor.getMonth() - 5)
  const sixMonthStart = monthCursor.toISOString().slice(0, 10)

  const [
    { count: totalPatients },
    { count: todayAppointments },
    { count: monthAppointments },
    { count: monthNewPatients },
    { data: monthInvoices },
    { count: unpaidInvoices },
    { data: upcomingAppointments },
    { data: statusBreakdown },
    { data: monthlyAppointmentsRaw },
  ] = await Promise.all([
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("appointment_date", today),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("appointment_date", monthStart)
      .lte("appointment_date", today),
    supabase.from("patients").select("*", { count: "exact", head: true }).gte("created_at", `${monthStart}T00:00:00`),
    supabase.from("invoices").select("amount").gte("invoice_date", monthStart).lte("invoice_date", today),
    supabase.from("invoices").select("*", { count: "exact", head: true }).neq("status", "paid"),
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, patients(full_name)")
      .gte("appointment_date", today)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(7),
    supabase.from("appointments").select("status"),
    supabase.from("appointments").select("appointment_date").gte("appointment_date", sixMonthStart).lte("appointment_date", today),
  ])

  const monthlyRevenue = monthInvoices?.reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0) ?? 0

  const statusCounts = { scheduled: 0, completed: 0, cancelled: 0 }
  statusBreakdown?.forEach((item: { status: "scheduled" | "completed" | "cancelled" }) => {
    statusCounts[item.status] += 1
  })
  const totalStatus = Math.max(1, statusCounts.scheduled + statusCounts.completed + statusCounts.cancelled)
  const scheduledPct = Math.round((statusCounts.scheduled / totalStatus) * 100)
  const completedPct = Math.round((statusCounts.completed / totalStatus) * 100)
  const cancelledPct = Math.round((statusCounts.cancelled / totalStatus) * 100)

  const monthLabels: string[] = []
  const monthKeys: string[] = []
  const anchor = new Date(`${today}T00:00:00`)
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(anchor)
    d.setMonth(anchor.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    monthKeys.push(key)
    monthLabels.push(d.toLocaleString("en-IN", { month: "short" }))
  }
  const monthlyCounts = monthKeys.reduce<Record<string, number>>((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
  monthlyAppointmentsRaw?.forEach((item: { appointment_date: string }) => {
    const date = item.appointment_date
    if (!date) return
    const key = date.slice(0, 7)
    if (key in monthlyCounts) monthlyCounts[key] += 1
  })
  const monthlySeries = monthKeys.map((key, idx) => ({
    label: monthLabels[idx],
    count: monthlyCounts[key] ?? 0,
  }))
  const monthlyMax = Math.max(1, ...monthlySeries.map((item) => item.count))

  const cards = [
    { label: "Total Patients", value: String(totalPatients ?? 0) },
    { label: "Today's Appointments", value: String(todayAppointments ?? 0) },
    { label: "Monthly Revenue", value: formatCurrency(monthlyRevenue) },
    { label: "Unpaid Invoices", value: String(unpaidInvoices ?? 0) },
  ]

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Insights across patients, appointments, and collections.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border bg-white p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Appointments Trend (Bar Chart)</h2>
          <p className="mt-1 text-sm text-muted-foreground">Last 6 months appointment count.</p>
          <div className="mt-5">
            <div className="flex h-44 items-end justify-between gap-3 rounded-md border p-3">
              {monthlySeries.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-xs text-muted-foreground">{item.count}</span>
                  <div
                    className="w-full rounded-t bg-slate-900"
                    style={{ height: `${Math.max(8, Math.round((item.count / monthlyMax) * 120))}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Appointments Analytics</h2>
          <p className="mt-1 text-sm text-muted-foreground">Status distribution for all appointments.</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Scheduled", value: statusCounts.scheduled, pct: scheduledPct, color: "bg-blue-500" },
              { label: "Completed", value: statusCounts.completed, pct: completedPct, color: "bg-emerald-500" },
              { label: "Cancelled", value: statusCounts.cancelled, pct: cancelledPct, color: "bg-red-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span>
                    {item.value} ({item.pct}%)
                  </span>
                </div>
                <div className="mt-1 h-2.5 rounded bg-slate-100">
                  <div className={`h-2.5 rounded ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Patients & Appointments (This Month)</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quick monthly trend snapshot.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded border p-4">
              <p className="text-sm text-muted-foreground">New Patients</p>
              <p className="mt-2 text-3xl font-semibold">{monthNewPatients ?? 0}</p>
            </div>
            <div className="rounded border p-4">
              <p className="text-sm text-muted-foreground">Appointments</p>
              <p className="mt-2 text-3xl font-semibold">{monthAppointments ?? 0}</p>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
        <p className="mt-1 text-sm text-muted-foreground">Next 7 upcoming appointments.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {upcomingAppointments?.length ? (
            upcomingAppointments.map(
              (item: {
                id: string
                appointment_date: string
                appointment_time: string
                status: string
                patients: { full_name: string } | null
              }) => (
                <li key={item.id} className="rounded border p-3">
                  <p className="font-medium">{item.patients?.full_name || "Patient"}</p>
                  <p className="text-muted-foreground">
                    {item.appointment_date} at {item.appointment_time} - {item.status}
                  </p>
                </li>
              )
            )
          ) : (
            <li className="rounded border p-3 text-muted-foreground">No upcoming appointments found.</li>
          )}
        </ul>
      </article>
    </section>
  )
}
