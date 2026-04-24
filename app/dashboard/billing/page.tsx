import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { deleteInvoiceAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import DownloadInvoiceButton from "./download-invoice-button"

type InvoiceRow = {
  id: string
  amount: number | string
  status: "paid" | "unpaid" | "partial"
  invoice_date: string
  patients: { full_name: string } | null
}

type BillingSearchParams = {
  page?: string
}

const PAGE_SIZE = 10

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value)
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<BillingSearchParams>
}) {
  await requireAuth()
  const { page = "1" } = await searchParams
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, patient_id, amount, status, invoice_date, patients(full_name)")
    .order("invoice_date", { ascending: false })

  const typedInvoices = (invoices as InvoiceRow[] | null) ?? []
  const totalPages = Math.max(1, Math.ceil(typedInvoices.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedInvoices = typedInvoices.slice(startIndex, startIndex + PAGE_SIZE)
  const totalBilled = typedInvoices.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalCollected =
    typedInvoices
      .filter((item) => item.status === "paid")
      .reduce((sum, item) => sum + Number(item.amount), 0)
  const outstanding = totalBilled - totalCollected

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Billing</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track invoices, collections, and outstanding payments.</p>
        </div>
        <Link
          href="/dashboard/billing/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Generate Invoice
        </Link>
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

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Patient</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">PDF</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice, index) => (
              <tr key={invoice.id} className="border-t">
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{invoice.invoice_date}</td>
                <td className="px-4 py-2">{invoice.patients?.full_name || "-"}</td>
                <td className="px-4 py-2">{formatCurrency(Number(invoice.amount))}</td>
                <td className="px-4 py-2">{invoice.status}</td>
                <td className="px-4 py-2">
                  <DownloadInvoiceButton invoiceId={invoice.id} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/billing/${invoice.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deleteInvoiceAction}>
                      <input type="hidden" name="invoice_id" value={invoice.id} />
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {typedInvoices.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, typedInvoices.length)} of {typedInvoices.length}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/billing?page=${Math.max(1, currentPage - 1)}`}
              className={`rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/billing?page=${Math.min(totalPages, currentPage + 1)}`}
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
