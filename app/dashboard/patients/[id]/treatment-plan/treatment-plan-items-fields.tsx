"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { TOOTH_SURFACES } from "@/lib/oral-examination"
import { PLAN_ITEM_STATUS_LABELS, PLAN_ITEM_STATUS_VALUES } from "@/lib/treatment-plan"
import { toothLabel } from "@/lib/dental-charting"
import TreatmentCatalogPicker, { type CatalogLite } from "@/components/dental/treatment-catalog-picker"

export type PlanItemInput = {
  treatment_catalog_id: string
  treatment_name: string
  price: string
  tooth_number: string
  surface: string
  finding_key: string
  priority: "primary" | "secondary"
  is_part_of_bridge: boolean
  status: "planned" | "in_progress" | "completed" | "cancelled"
}

export type SuggestionGroup = {
  tooth_number: string
  finding_label: string
  primary: string[]
  secondary: string[]
}

type TreatmentPlanItemsFieldsProps = {
  catalog: CatalogLite[]
  initialItems?: PlanItemInput[]
  suggestions?: SuggestionGroup[]
}

function emptyItemFrom(entry: CatalogLite): PlanItemInput {
  return {
    treatment_catalog_id: entry.id,
    treatment_name: entry.name,
    price: String(entry.price),
    tooth_number: "",
    surface: "",
    finding_key: "",
    priority: "primary",
    is_part_of_bridge: false,
    status: "planned",
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

export default function TreatmentPlanItemsFields({
  catalog,
  initialItems = [],
  suggestions = [],
}: TreatmentPlanItemsFieldsProps) {
  const [items, setItems] = useState<PlanItemInput[]>(initialItems)

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.price)
        return sum + (Number.isNaN(price) || price < 0 ? 0 : price)
      }, 0),
    [items]
  )

  function addFromCatalog(entry: CatalogLite) {
    setItems((prev) => [...prev, emptyItemFrom(entry)])
  }

  /** Add a suggested treatment need, prefilling price/catalog link from the best catalog match. */
  function addFromSuggestion(group: SuggestionGroup, need: string, priority: "primary" | "secondary") {
    const needLower = need.toLowerCase()
    const match =
      catalog.find((entry) => entry.name.toLowerCase() === needLower) ??
      catalog.find((entry) => entry.name.toLowerCase().includes(needLower)) ??
      catalog.find((entry) => needLower.includes(entry.name.toLowerCase()))
    setItems((prev) => [
      ...prev,
      {
        treatment_catalog_id: match?.id ?? "",
        treatment_name: match?.name ?? need,
        price: match ? String(match.price) : "",
        tooth_number: group.tooth_number,
        surface: "",
        finding_key: "",
        priority,
        is_part_of_bridge: false,
        status: "planned",
      },
    ])
  }

  function updateItem<K extends keyof PlanItemInput>(index: number, field: K, value: PlanItemInput[K]) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {suggestions.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-[var(--brand-dark)]">Findings &amp; suggested treatments</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a suggested treatment to add it to the plan (price is prefilled from the catalog when matched).
          </p>
          <div className="mt-3 overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-[var(--yellow-light)] text-left">
                <tr>
                  <th className="px-3 py-2 font-semibold">Tooth</th>
                  <th className="px-3 py-2 font-semibold">Oral Exam Finding(s)</th>
                  <th className="px-3 py-2 font-semibold">Treatment Need(s)</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((group, index) => (
                  <tr key={`${group.tooth_number}-${index}`} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium">{toothLabel(group.tooth_number)}</td>
                    <td className="px-3 py-2">{group.finding_label}</td>
                    <td className="px-3 py-2">
                      <div className="space-y-1.5">
                        {group.primary.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-500">Primary:</span>
                            {group.primary.map((need) => (
                              <button
                                key={`p-${need}`}
                                type="button"
                                onClick={() => addFromSuggestion(group, need, "primary")}
                                className="inline-flex items-center gap-1 rounded-full bg-[var(--yellow-lightest)] px-2 py-0.5 text-xs text-[var(--brand-dark)] hover:bg-[var(--yellow-light)]"
                              >
                                <Plus className="size-3 shrink-0" aria-hidden />
                                {need}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        {group.secondary.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-slate-500">Secondary:</span>
                            {group.secondary.map((need) => (
                              <button
                                key={`s-${need}`}
                                type="button"
                                onClick={() => addFromSuggestion(group, need, "secondary")}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200"
                              >
                                <Plus className="size-3 shrink-0" aria-hidden />
                                {need}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Add treatments</p>
        <TreatmentCatalogPicker catalog={catalog} onPick={addFromCatalog} />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Planned treatments</p>
        {items.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-muted-foreground">
            No treatments added yet. Use the picker above to add priced treatments.
          </p>
        ) : (
          items.map((item, index) => (
            <div key={`plan-item-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
              {/* Hidden fields keep parallel arrays aligned for the server action. */}
              <input type="hidden" name="item_treatment_catalog_id" value={item.treatment_catalog_id} readOnly />
              <input type="hidden" name="item_finding_key" value={item.finding_key} readOnly />
              <input type="hidden" name="item_is_part_of_bridge" value={item.is_part_of_bridge ? "1" : "0"} readOnly />

              <div className="grid gap-2 md:grid-cols-[1fr_90px_130px_120px_130px_auto]">
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-600">Treatment</span>
                  <input
                    name="item_treatment_name"
                    value={item.treatment_name}
                    onChange={(event) => updateItem(index, "treatment_name", event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-600">Tooth</span>
                  <input
                    name="item_tooth_number"
                    value={item.tooth_number}
                    onChange={(event) => updateItem(index, "tooth_number", event.target.value)}
                    placeholder="e.g. 36"
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-600">Surface</span>
                  <select
                    name="item_surface"
                    value={item.surface}
                    onChange={(event) => updateItem(index, "surface", event.target.value)}
                    className="w-full rounded-md border px-2 py-2 text-sm"
                  >
                    <option value="">—</option>
                    {TOOTH_SURFACES.map((surface) => (
                      <option key={surface.value} value={surface.value}>
                        {surface.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-600">Priority</span>
                  <select
                    name="item_priority"
                    value={item.priority}
                    onChange={(event) => updateItem(index, "priority", event.target.value as PlanItemInput["priority"])}
                    className="w-full rounded-md border px-2 py-2 text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="block text-xs font-medium text-slate-600">Price (INR)</span>
                  <input
                    name="item_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(event) => updateItem(index, "price", event.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    required
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center justify-center gap-1.5 self-end rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-3.5 shrink-0" aria-hidden />
                  Remove
                </button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <span className="text-xs font-medium text-slate-600">Status</span>
                  <select
                    name="item_status"
                    value={item.status}
                    onChange={(event) => updateItem(index, "status", event.target.value as PlanItemInput["status"])}
                    className="rounded-md border px-2 py-1.5 text-sm"
                  >
                    {PLAN_ITEM_STATUS_VALUES.map((status) => (
                      <option key={status} value={status}>
                        {PLAN_ITEM_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.is_part_of_bridge}
                    onChange={(event) => updateItem(index, "is_part_of_bridge", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Part of bridge
                </label>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">
        <span className="font-medium">Plan total: </span>
        {formatCurrency(total)}
      </div>
    </div>
  )
}
