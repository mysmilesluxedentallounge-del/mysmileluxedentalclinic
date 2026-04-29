"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const BUDGET_PATH = "/dashboard/budget"

function buildBudgetUrl(year: number, month: number, extra?: Record<string, string>) {
  const params = new URLSearchParams({ year: String(year), month: String(month) })
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v)
    }
  }
  return `${BUDGET_PATH}?${params.toString()}`
}

function parseYearMonthFromForm(formData: FormData) {
  const year = Number(String(formData.get("year") ?? ""))
  const month = Number(String(formData.get("month") ?? ""))
  if (!Number.isInteger(year) || year < 2000 || year > 3000) return null
  if (!Number.isInteger(month) || month < 1 || month > 12) return null
  return { year, month }
}

function isDateInYearMonth(iso: string, year: number, month: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [y, m] = iso.split("-").map(Number)
  return y === year && m === month
}

export async function upsertMonthlyBudgetAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const yearMonth = parseYearMonthFromForm(formData)
  if (!yearMonth) return

  const amountRaw = String(formData.get("allocated_amount") ?? "").trim()
  const allocated = Number(amountRaw)
  if (Number.isNaN(allocated) || allocated < 0) return

  const notes = String(formData.get("notes") ?? "").trim() || null

  const { data: existing } = await supabase
    .from("clinic_monthly_budgets")
    .select("id")
    .eq("year", yearMonth.year)
    .eq("month", yearMonth.month)
    .maybeSingle()

  if (existing?.id) {
    await supabase
      .from("clinic_monthly_budgets")
      .update({ allocated_amount: allocated, notes })
      .eq("id", existing.id)
  } else {
    await supabase.from("clinic_monthly_budgets").insert({
      year: yearMonth.year,
      month: yearMonth.month,
      allocated_amount: allocated,
      notes,
    })
  }

  revalidatePath(BUDGET_PATH)
  redirect(buildBudgetUrl(yearMonth.year, yearMonth.month, { updated: "1" }))
}

export async function createExpenseAction(formData: FormData) {
  const profile = await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const yearMonth = parseYearMonthFromForm(formData)
  if (!yearMonth) return

  const expense_date = String(formData.get("expense_date") ?? "").trim()
  if (!isDateInYearMonth(expense_date, yearMonth.year, yearMonth.month)) return

  const category = String(formData.get("category") ?? "").trim()
  if (!category) return

  const amount = Number(String(formData.get("amount") ?? ""))
  if (Number.isNaN(amount) || amount <= 0) return

  const description = String(formData.get("description") ?? "").trim() || null

  await supabase.from("clinic_expenses").insert({
    expense_date,
    amount,
    category,
    description,
    created_by: profile.id,
  })

  revalidatePath(BUDGET_PATH)
  redirect(buildBudgetUrl(yearMonth.year, yearMonth.month, { updated: "1" }))
}

export async function updateExpenseAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const yearMonth = parseYearMonthFromForm(formData)
  if (!yearMonth) return

  const expenseId = String(formData.get("expense_id") ?? "").trim()
  if (!expenseId) return

  const expense_date = String(formData.get("expense_date") ?? "").trim()
  if (!isDateInYearMonth(expense_date, yearMonth.year, yearMonth.month)) return

  const category = String(formData.get("category") ?? "").trim()
  if (!category) return

  const amount = Number(String(formData.get("amount") ?? ""))
  if (Number.isNaN(amount) || amount <= 0) return

  const description = String(formData.get("description") ?? "").trim() || null

  await supabase
    .from("clinic_expenses")
    .update({ expense_date, amount, category, description })
    .eq("id", expenseId)

  revalidatePath(BUDGET_PATH)
  redirect(buildBudgetUrl(yearMonth.year, yearMonth.month, { updated: "1" }))
}

export async function deleteExpenseAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const yearMonth = parseYearMonthFromForm(formData)
  if (!yearMonth) return

  const expenseId = String(formData.get("expense_id") ?? "").trim()
  if (!expenseId) return

  await supabase.from("clinic_expenses").delete().eq("id", expenseId)

  revalidatePath(BUDGET_PATH)
  redirect(buildBudgetUrl(yearMonth.year, yearMonth.month, { updated: "1" }))
}
