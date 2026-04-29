import Link from "next/link"
import { ChevronLeft, ChevronRight, Pencil, Plus, Save, Trash2, X } from "lucide-react"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
import {
  dashboardDeleteActionClass,
  dashboardEditActionClass,
  dashboardPrimaryButtonClass,
} from "@/lib/dashboard-action-styles"
import {
  createExpenseAction,
  deleteExpenseAction,
  updateExpenseAction,
  upsertMonthlyBudgetAction,
} from "@/lib/budget-actions"
import { requireAdmin } from "@/lib/auth"
import type { ClinicExpense, ClinicMonthlyBudget } from "@/lib/database.types"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import SubmitButton from "../submit-button"

const PAGE_SIZE = 10

const CATEGORY_SUGGESTIONS = [
  "Rent",
  "Utilities",
  "Supplies",
  "Lab fees",
  "Salaries",
  "Marketing",
  "Equipment",
  "Insurance",
  "Miscellaneous",
]

type BudgetSearchParams = {
  year?: string
  month?: string
  page?: string
  edit?: string
  updated?: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value)
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(
    new Date(year, month - 1, 1)
  )
}

function resolveYearMonth(y?: string, m?: string) {
  const d = new Date()
  const year = Math.max(2000, Math.min(3000, Number(y) || d.getFullYear()))
  const month = Math.max(1, Math.min(12, Number(m) || d.getMonth() + 1))
  return { year, month }
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function firstAndLastDateStr(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`
  const last = new Date(year, month, 0)
  const end = `${year}-${String(month).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`
  return { start, end }
}

function defaultExpenseDateStr(year: number, month: number) {
  const d = new Date()
  if (d.getFullYear() === year && d.getMonth() + 1 === month) {
    return `${year}-${String(month).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }
  return `${year}-${String(month).padStart(2, "0")}-01`
}

function buildBudgetQuery(year: number, month: number, extra?: Record<string, string | undefined>) {
  const p = new URLSearchParams({ year: String(year), month: String(month) })
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) p.set(k, v)
    }
  }
  return p.toString()
}

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<BudgetSearchParams>
}) {
  await requireAdmin()
  const { year: yParam, month: mParam, page = "1", edit, updated } = await searchParams
  const { year, month } = resolveYearMonth(yParam, mParam)
  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)
  const { start, end } = firstAndLastDateStr(year, month)

  const supabase = await createSupabaseServerClient()

  const { data: budgetRow } = await supabase
    .from("clinic_monthly_budgets")
    .select("id, year, month, allocated_amount, notes, created_at")
    .eq("year", year)
    .eq("month", month)
    .maybeSingle()

  const { data: expenseRows } = await supabase
    .from("clinic_expenses")
    .select("id, expense_date, amount, category, description, created_by, created_at")
    .gte("expense_date", start)
    .lte("expense_date", end)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })

  const expenses = (expenseRows as ClinicExpense[] | null) ?? []
  const budget = (budgetRow as ClinicMonthlyBudget | null) ?? null
  const allocated = budget ? Number(budget.allocated_amount) : 0
  const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const remaining = allocated - spent

  const requestedPage = Math.max(1, Number(page) || 1)
  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginated = expenses.slice(startIndex, startIndex + PAGE_SIZE)

  let editingExpense: ClinicExpense | null = null
  if (edit) {
    editingExpense = expenses.find((e) => e.id === edit) ?? null
  }

  return (
    <section className="space-y-6">
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Changes saved.
        </p>
      ) : null}

      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl">Clinic budget</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monthly allocation and operating expenses (admin only).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/budget?${buildBudgetQuery(prev.year, prev.month)}`}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </Link>
          <p className="min-w-[10rem] text-center text-sm font-medium">{monthLabel(year, month)}</p>
          <Link
            href={`/dashboard/budget?${buildBudgetQuery(next.year, next.month)}`}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Allocated</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(allocated)}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Spent</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(spent)}</p>
        </article>
        <article className="rounded-lg border bg-white p-4">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="mt-2 text-2xl font-semibold">{formatCurrency(remaining)}</p>
        </article>
      </div>

      <form action={upsertMonthlyBudgetAction} className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Monthly allocation</h2>
        <p className="mt-1 text-sm text-muted-foreground">Set the budget for the selected month.</p>
        <input type="hidden" name="year" value={year} />
        <input type="hidden" name="month" value={month} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted-foreground">Amount (INR)</span>
            <input
              name="allocated_amount"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={allocated || ""}
              placeholder="0"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm md:col-span-1">
            <span className="text-muted-foreground">Notes (optional)</span>
            <input
              name="notes"
              defaultValue={budget?.notes ?? ""}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="e.g. cap for marketing"
            />
          </label>
        </div>
        <div className="mt-3">
          <SubmitButton
            pendingText="Saving..."
            className={`${dashboardPrimaryButtonClass} mt-3`}
          >
            <Save className="size-4 shrink-0" aria-hidden />
            Save allocation
          </SubmitButton>
        </div>
      </form>

      {editingExpense ? (
        <form action={updateExpenseAction} className="rounded-lg border border-blue-200 bg-blue-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Edit expense</h2>
            <Link
              href={`/dashboard/budget?${buildBudgetQuery(year, month)}`}
              className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline"
            >
              <X className="size-3.5 shrink-0" aria-hidden />
              Cancel
            </Link>
          </div>
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="expense_id" value={editingExpense.id} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-foreground">Date</span>
              <input
                name="expense_date"
                type="date"
                required
                defaultValue={editingExpense.expense_date}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Amount (INR)</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                defaultValue={Number(editingExpense.amount)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Category</span>
              <input
                name="category"
                required
                list="budget-categories"
                defaultValue={editingExpense.category}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. Rent"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-muted-foreground">Description (optional)</span>
              <input
                name="description"
                defaultValue={editingExpense.description ?? ""}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3">
            <SubmitButton
              pendingText="Updating..."
              className={`${dashboardPrimaryButtonClass} mt-3`}
            >
              <Save className="size-4 shrink-0" aria-hidden />
              Update expense
            </SubmitButton>
          </div>
        </form>
      ) : (
        <form action={createExpenseAction} className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Add expense</h2>
          <p className="mt-1 text-sm text-muted-foreground">Recorded under the month of the date you pick.</p>
          <input type="hidden" name="year" value={year} />
          <input type="hidden" name="month" value={month} />
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted-foreground">Date</span>
              <input
                name="expense_date"
                type="date"
                required
                defaultValue={defaultExpenseDateStr(year, month)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Amount (INR)</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Category</span>
              <input
                name="category"
                required
                list="budget-categories"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                placeholder="e.g. Supplies"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="text-muted-foreground">Description (optional)</span>
              <input
                name="description"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-3">
            <SubmitButton
              pendingText="Adding..."
              className={`${dashboardPrimaryButtonClass} mt-3`}
            >
              <Plus className="size-4 shrink-0" aria-hidden />
              Add expense
            </SubmitButton>
          </div>
        </form>
      )}

      <datalist id="budget-categories">
        {CATEGORY_SUGGESTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Expenses this month</h2>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No expenses yet for {monthLabel(year, month)}.</p>
        ) : (
          <>
            <div className={dashboardTableWrapperClass}>
              <table className={dashboardTableClass}>
                <thead className={dashboardTableHeadClass}>
                  <tr>
                    <th className={dashboardTableThClass}>S.No</th>
                    <th className={dashboardTableThClass}>Date</th>
                    <th className={dashboardTableThClass}>Category</th>
                    <th className={dashboardTableThClass}>Amount</th>
                    <th className={dashboardTableThClass}>Description</th>
                    <th className={dashboardTableThClass}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, index) => (
                    <tr key={row.id} className={dashboardTableBodyRowClass(index)}>
                      <td className="px-4 py-2">{startIndex + index + 1}</td>
                      <td className="px-4 py-2">{row.expense_date}</td>
                      <td className="px-4 py-2">{row.category}</td>
                      <td className="px-4 py-2">{formatCurrency(Number(row.amount))}</td>
                      <td className="px-4 py-2 text-muted-foreground">{row.description || "—"}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`/dashboard/budget?${buildBudgetQuery(year, month, { edit: row.id, page: String(currentPage) })}`}
                            className={dashboardEditActionClass}
                          >
                            <Pencil className="size-3.5 shrink-0" aria-hidden />
                            Edit
                          </Link>
                          <form action={deleteExpenseAction}>
                            <input type="hidden" name="year" value={year} />
                            <input type="hidden" name="month" value={month} />
                            <input type="hidden" name="expense_id" value={row.id} />
                            <SubmitButton
                              pendingText="Deleting…"
                              className={`${dashboardDeleteActionClass} text-sm disabled:opacity-50`}
                            >
                              <Trash2 className="size-3.5 shrink-0" aria-hidden />
                              Delete
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expenses.length > PAGE_SIZE ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, expenses.length)} of{" "}
                  {expenses.length}
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/budget?${buildBudgetQuery(year, month, { page: String(Math.max(1, currentPage - 1)) })}`}
                    className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
                    Previous
                  </Link>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={`/dashboard/budget?${buildBudgetQuery(year, month, { page: String(Math.min(totalPages, currentPage + 1)) })}`}
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
          </>
        )}
      </div>
    </section>
  )
}
