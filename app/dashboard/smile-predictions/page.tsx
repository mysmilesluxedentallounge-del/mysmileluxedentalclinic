import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableEmptyRowClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperScrollClass,
} from "@/lib/dashboard-table"
import {
  SMILE_PREDICTION_STATUSES,
  SMILE_PREDICTION_STATUS_LABELS,
  isSmilePredictionStatus,
  type SmilePredictionRecord,
  type SmilePredictionStatus,
} from "@/lib/smile-predictions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import SmilePredictionStatusSelect from "./status-select"

const PAGE_SIZE = 15

type SearchParams = { page?: string; status?: string }

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date)
}

export default async function SmilePredictionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireAuth()

  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)
  const statusFilter = isSmilePredictionStatus(params.status) ? params.status : null

  const supabase = await createSupabaseServerClient()

  let query = supabase
    .from("smile_predictions")
    .select("id, full_name, phone, email, address, status, notes, created_at", { count: "exact" })
    .order("created_at", { ascending: false })

  if (statusFilter) {
    query = query.eq("status", statusFilter)
  }

  const from = (currentPage - 1) * PAGE_SIZE
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  const rows = (data ?? []) as SmilePredictionRecord[]
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function pageHref(page: number) {
    const search = new URLSearchParams()
    if (page > 1) search.set("page", String(page))
    if (statusFilter) search.set("status", statusFilter)
    const qs = search.toString()
    return `/dashboard/smile-predictions${qs ? `?${qs}` : ""}`
  }

  function filterHref(status: SmilePredictionStatus | null) {
    return status
      ? `/dashboard/smile-predictions?status=${status}`
      : "/dashboard/smile-predictions"
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[var(--brand-dark)]">Smile Predictor leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visitors who completed a prediction at predict.mysmileluxedentallounge.com.
            {total > 0 && ` ${total} total.`}
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={filterHref(null)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            statusFilter === null
              ? "border-[var(--brand-dark)] bg-[var(--brand-dark)] text-white"
              : "border-amber-200 bg-white text-[var(--brand-dark)] hover:bg-[var(--yellow-lightest)]"
          }`}
        >
          All
        </Link>
        {SMILE_PREDICTION_STATUSES.map((status) => (
          <Link
            key={status}
            href={filterHref(status)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              statusFilter === status
                ? "border-[var(--brand-dark)] bg-[var(--brand-dark)] text-white"
                : "border-amber-200 bg-white text-[var(--brand-dark)] hover:bg-[var(--yellow-lightest)]"
            }`}
          >
            {SMILE_PREDICTION_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load leads: {error.message}
        </p>
      )}

      <div className={dashboardTableWrapperScrollClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>Name</th>
              <th className={dashboardTableThClass}>Contact</th>
              <th className={dashboardTableThClass}>Email</th>
              <th className={dashboardTableThClass}>Address</th>
              <th className={dashboardTableThClass}>Submitted</th>
              <th className={dashboardTableThClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No smile predictions yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className={dashboardTableBodyRowClass(index)}>
                  <td className="px-4 py-2.5 font-medium">{row.full_name}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <a href={`tel:${row.phone}`} className="underline underline-offset-2">
                      {row.phone}
                    </a>
                  </td>
                  <td className="px-4 py-2.5">
                    {row.email ? (
                      <a href={`mailto:${row.email}`} className="underline underline-offset-2">
                        {row.email}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="max-w-[220px] px-4 py-2.5">
                    {row.address || <span className="text-slate-400">—</span>}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <SmilePredictionStatusSelect id={row.id} status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={pageHref(currentPage - 1)}
                className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 font-medium transition hover:bg-[var(--yellow-lightest)]"
              >
                <ChevronLeft size={15} />
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={pageHref(currentPage + 1)}
                className="flex items-center gap-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5 font-medium transition hover:bg-[var(--yellow-lightest)]"
              >
                Next
                <ChevronRight size={15} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
