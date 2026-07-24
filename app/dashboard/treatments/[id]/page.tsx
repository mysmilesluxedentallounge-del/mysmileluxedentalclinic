import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { deleteTreatmentCatalogAction, updateTreatmentCatalogAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { TREATMENT_CATEGORIES } from "@/lib/treatment-catalog"
import type { TreatmentCatalogEntry } from "@/lib/database.types"
import { dashboardDangerOutlineButtonClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import SubmitButton from "@/app/dashboard/submit-button"

export default async function EditTreatmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("treatment_catalog")
    .select("id, category, name, price, code, is_active, sort_order, created_at")
    .eq("id", id)
    .maybeSingle()

  if (!data) notFound()
  const entry = data as TreatmentCatalogEntry

  return (
    <section className="space-y-6">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error === "invalid_input"
            ? "Please provide a valid category, name, and non-negative price."
            : `Could not update treatment: ${error}`}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href="/dashboard/treatments" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to treatment catalog
        </Link>
        <h1 className="font-heading text-3xl">Edit treatment</h1>
      </header>

      <form action={updateTreatmentCatalogAction} className="rounded-lg border bg-white p-4">
        <input type="hidden" name="id" value={entry.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Category
            </FormLabel>
            <select name="category" required defaultValue={entry.category} className="w-full rounded-md border px-3 py-2 text-sm">
              {TREATMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Treatment name
            </FormLabel>
            <input name="name" required defaultValue={entry.name} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              Price (INR)
            </FormLabel>
            <input name="price" type="number" min="0" step="0.01" required defaultValue={Number(entry.price)} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Code (optional)</span>
            <input name="code" defaultValue={entry.code ?? ""} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Sort order</span>
            <input name="sort_order" type="number" step="1" defaultValue={entry.sort_order} className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <div className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" name="is_active" id="is_active_edit" defaultChecked={entry.is_active} className="h-4 w-4 rounded border-slate-300" />
            <label htmlFor="is_active_edit" className="text-sm text-slate-700">
              Active (available when building plans)
            </label>
          </div>
        </div>
        <SubmitButton pendingText="Updating…" className={`${dashboardPrimaryButtonClass} mt-3`}>
          <Save className="size-4 shrink-0" aria-hidden />
          Update treatment
        </SubmitButton>
      </form>

      <form action={deleteTreatmentCatalogAction} className="rounded-lg border bg-white p-4">
        <input type="hidden" name="id" value={entry.id} />
        <SubmitButton pendingText="Deleting…" className={dashboardDangerOutlineButtonClass}>
          <Trash2 className="size-4 shrink-0" aria-hidden />
          Delete treatment
        </SubmitButton>
      </form>
    </section>
  )
}
