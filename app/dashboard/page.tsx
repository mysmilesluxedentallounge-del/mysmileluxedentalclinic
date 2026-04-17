import { requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function DashboardOverviewPage() {
  await requireAuth()
  const supabase = await createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const monthStart = `${today.slice(0, 8)}01`

  const [{ count: totalPatients }, { count: todayAppointments }, { data: monthInvoices }, { count: unpaidInvoices }] =
    await Promise.all([
      supabase.from("patients").select("*", { count: "exact", head: true }),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("appointment_date", today),
      supabase.from("invoices").select("amount").gte("invoice_date", monthStart).lte("invoice_date", today),
      supabase.from("invoices").select("*", { count: "exact", head: true }).neq("status", "paid"),
    ])

  const monthlyRevenue =
    monthInvoices?.reduce((sum, invoice) => sum + Number(invoice.amount ?? 0), 0) ?? 0

  const cards = [
    { label: "Total Patients", value: String(totalPatients ?? 0) },
    { label: "Today's Appointments", value: String(todayAppointments ?? 0) },
    { label: "Monthly Revenue", value: formatCurrency(monthlyRevenue) },
    { label: "Unpaid Invoices", value: String(unpaidInvoices ?? 0) },
  ]

  return (
    <section>
      <h1 className="font-heading text-3xl text-slate-900">Overview</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Snapshot of patient flow and clinic financials.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-lg border bg-white p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
