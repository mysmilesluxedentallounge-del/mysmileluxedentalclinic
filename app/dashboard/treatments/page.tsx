import Link from "next/link"
import { ChevronLeft, ChevronRight, ListFilter, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import {
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
  dashboardTableWrapperScrollClass,
} from "@/lib/dashboard-table"
import { deleteTreatmentCatalogAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { TREATMENT_CATEGORIES } from "@/lib/treatment-catalog"
import ClickableRow from "@/components/dashboard/clickable-row"
import type { TreatmentCatalogEntry } from "@/lib/database.types"
import SubmitButton from "../submit-button"

const PAGE_SIZE = 12

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

type TreatmentsSearchParams = {
  q?: string
  category?: string
  page?: string
  added?: string
  updated?: string
  deleted?: string
}

export default async function TreatmentsPage({
  searchParams,
}: {
  searchParams: Promise<TreatmentsSearchParams>
}) {
  await requireAdmin()
  const { q = "", category = "", page = "1", added, updated, deleted } = await searchParams
  const searchQuery = q.trim()
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from("treatment_catalog")
    .select("id, category, name, price, code, is_active, sort_order, created_at")

  if (category && TREATMENT_CATEGORIES.includes(category as (typeof TREATMENT_CATEGORIES)[number])) {
    query = query.eq("category", category)
  }

  const { data } = await query.order("category").order("sort_order").order("name")
  const rows = (data as TreatmentCatalogEntry[] | null) ?? []

  const filtered = rows.filter((row) => {
    if (!searchQuery) return true
    const haystack = `${row.name} ${row.category} ${row.code ?? ""}`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginated = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  function getPageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (category) params.set("category", category)
    params.set("page", String(nextPage))
    return `/dashboard/treatments?${params.toString()}`
  }

  const banner = added
    ? "Treatment added successfully."
    : updated
      ? "Treatment updated successfully."
      : deleted
        ? "Treatment deleted."
        : null

  return (
    <section className="space-y-6">
      {banner ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {banner}
        </p>
      ) : null}

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Treatment catalog</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Master priced treatment list used when building patient treatment plans (admin only).
          </p>
        </div>
        <Link href="/dashboard/treatments/new" className={dashboardPrimaryButtonClass}>
          <Plus className="size-4 shrink-0" aria-hidden />
          Add Treatment
        </Link>
      </header>

      <form className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search treatment, code"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
          <select name="category" defaultValue={category} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All categories</option>
            {TREATMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className={dashboardPrimaryButtonClass}>
              <ListFilter className="size-4 shrink-0" aria-hidden />
              Apply
            </button>
            <Link href="/dashboard/treatments" className={`${dashboardSecondaryButtonClass} border-slate-300 bg-white`}>
              <RotateCcw className="size-4 shrink-0" aria-hidden />
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className={dashboardTableWrapperScrollClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Category</th>
              <th className={dashboardTableThClass}>Treatment</th>
              <th className={dashboardTableThClass}>Code</th>
              <th className={dashboardTableThClass}>Price</th>
              <th className={dashboardTableThClass}>Active</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, index) => (
              <ClickableRow key={row.id} href={`/dashboard/treatments/${row.id}`} className={dashboardTableBodyRowClass(index)}>
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{row.category}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.code || "—"}</td>
                <td className="px-4 py-2">{formatCurrency(Number(row.price))}</td>
                <td className="px-4 py-2">{row.is_active ? "Yes" : "No"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link href={`/dashboard/treatments/${row.id}`} className={dashboardEditActionClass}>
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                    <form action={deleteTreatmentCatalogAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <SubmitButton pendingText="Deleting…" className="inline-flex cursor-pointer items-center gap-1.5 text-red-600 hover:underline text-sm disabled:opacity-50">
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                </td>
              </ClickableRow>
            ))}
            {filtered.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={7}>
                  No treatments found. Add treatments to build the catalog.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filtered.length)} of {filtered.length}
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
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
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
