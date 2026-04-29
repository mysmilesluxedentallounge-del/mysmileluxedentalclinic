import Link from "next/link"
import { ChevronLeft, ChevronRight, FilePlus2, Pencil, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import {
  dashboardDeleteActionClass,
  dashboardEditActionClass,
  dashboardPrimaryButtonClass,
} from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
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
  added?: string
  updated?: string
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
  const { page = "1", added, updated } = await searchParams
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
      {added ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Invoice added successfully.
        </p>
      ) : null}
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Invoice updated successfully.
        </p>
      ) : null}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Billing</h1>
          <p className="mt-2 text-sm text-muted-foreground">Track invoices, collections, and outstanding payments.</p>
        </div>
        <Link href="/dashboard/billing/new" className={dashboardPrimaryButtonClass}>
          <FilePlus2 className="size-4 shrink-0" aria-hidden />
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

      <div className={dashboardTableWrapperClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Date</th>
              <th className={dashboardTableThClass}>Patient</th>
              <th className={dashboardTableThClass}>Amount</th>
              <th className={dashboardTableThClass}>Status</th>
              <th className={dashboardTableThClass}>PDF</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInvoices.map((invoice, index) => (
              <tr key={invoice.id} className={dashboardTableBodyRowClass(index)}>
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{invoice.invoice_date}</td>
                <td className="px-4 py-2">{invoice.patients?.full_name || "-"}</td>
                <td className="px-4 py-2">{formatCurrency(Number(invoice.amount))}</td>
                <td className="px-4 py-2">{invoice.status}</td>
                <td className="px-4 py-2">
                  <DownloadInvoiceButton invoiceId={invoice.id} />
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/dashboard/billing/${invoice.id}`} className={dashboardEditActionClass}>
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                    <form action={deleteInvoiceAction} className="inline">
                      <input type="hidden" name="invoice_id" value={invoice.id} />
                      <button type="submit" className={dashboardDeleteActionClass}>
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
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
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/billing?page=${Math.min(totalPages, currentPage + 1)}`}
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
