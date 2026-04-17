import { requireAuth } from "@/lib/auth"
import { createInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type InvoiceRow = {
  id: string
  amount: number | string
  status: "paid" | "unpaid" | "partial"
  invoice_date: string
  patients: { full_name: string } | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value)
}

export default async function BillingPage() {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const [{ data: patients }, { data: appointments }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("id, full_name").order("full_name"),
    supabase.from("appointments").select("id, patient_id, appointment_date").order("appointment_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, patient_id, amount, status, invoice_date, patients(full_name)")
      .order("invoice_date", { ascending: false }),
  ])

  const typedInvoices = (invoices as InvoiceRow[] | null) ?? []
  const totalBilled = typedInvoices.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalCollected =
    typedInvoices
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + Number(item.amount), 0)
  const outstanding = totalBilled - totalCollected

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl">Billing</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track invoices, collections, and outstanding payments.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total billed</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalBilled)}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total collected</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(totalCollected)}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(outstanding)}</p>
        </article>
      </div>

      <form action={createInvoiceAction} className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Create invoice</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <select name="patient_id" required className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select patient</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.full_name}
              </option>
            ))}
          </select>
          <select name="appointment_id" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Link appointment (optional)</option>
            {appointments?.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.appointment_date} - {appointment.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <input name="amount" type="number" step="0.01" required placeholder="Amount" className="rounded-md border px-3 py-2 text-sm" />
          <input name="invoice_date" type="date" required className="rounded-md border px-3 py-2 text-sm" />
          <select name="status" defaultValue="unpaid" className="rounded-md border px-3 py-2 text-sm">
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
          </select>
          <input name="payment_method" placeholder="Payment method" className="rounded-md border px-3 py-2 text-sm" />
          <textarea name="notes" placeholder="Notes" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save invoice
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {typedInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-t">
                <td className="px-4 py-2">{invoice.invoice_date}</td>
                <td className="px-4 py-2">{invoice.patients?.full_name || "-"}</td>
                <td className="px-4 py-2">{formatCurrency(Number(invoice.amount))}</td>
                <td className="px-4 py-2">{invoice.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
