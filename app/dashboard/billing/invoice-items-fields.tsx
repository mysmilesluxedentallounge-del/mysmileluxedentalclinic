"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { FormLabel } from "@/components/form-label"

/** Shape passed in by callers (net payable stored in `offer_amount`, as in the DB). */
type InvoiceItemInput = {
  treatment_name: string
  treatment_date: string
  cost: string
  offer_amount: string
}

/** Internal editing state: user enters a discount PERCENTAGE; net is derived. */
type ItemState = {
  treatment_name: string
  treatment_date: string
  cost: string
  /** Discount as a percentage (0-100). */
  discount: string
}

function toState(item: InvoiceItemInput): ItemState {
  const cost = Number(item.cost)
  const offer = item.offer_amount.trim() === "" ? null : Number(item.offer_amount)
  let discount = ""
  if (offer !== null && !Number.isNaN(offer) && !Number.isNaN(cost) && cost > 0 && offer <= cost) {
    const percent = ((cost - offer) / cost) * 100
    if (percent > 0) discount = String(Number(percent.toFixed(2)))
  }
  return { treatment_name: item.treatment_name, treatment_date: item.treatment_date, cost: item.cost, discount }
}

/** Discount percentage clamped to 0-100. */
function discountPercent(item: ItemState): number {
  const percent = item.discount.trim() === "" ? 0 : Number(item.discount)
  if (Number.isNaN(percent) || percent <= 0) return 0
  return Math.min(percent, 100)
}

function normalizeInitialItems(items: InvoiceItemInput[]): ItemState[] {
  const mapped = items.map(toState)
  if (mapped.length > 0) return mapped
  return [{ treatment_name: "", treatment_date: "", cost: "", discount: "" }]
}

function netAmount(item: ItemState): number {
  const cost = Number(item.cost)
  if (Number.isNaN(cost) || cost < 0) return 0
  const percent = discountPercent(item)
  if (percent <= 0) return cost
  return Math.max(0, cost - (cost * percent) / 100)
}

/** Hidden `item_offer_amount` = net payable when a discount applies, else empty (no offer). */
function offerValue(item: ItemState): string {
  const cost = Number(item.cost)
  if (Number.isNaN(cost) || cost < 0) return ""
  const percent = discountPercent(item)
  if (percent <= 0) return ""
  return String(Number(Math.max(0, cost - (cost * percent) / 100).toFixed(2)))
}

function formatCurrency(value: number) {
  return `INR ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`
}

export function InvoiceItemsFields({
  initialItems = [],
  compact = false,
}: {
  initialItems?: InvoiceItemInput[]
  /** Stack fields vertically for narrow containers (e.g. dashboard cards). */
  compact?: boolean
}) {
  const [items, setItems] = useState<ItemState[]>(normalizeInitialItems(initialItems))
  const rowClass = compact
    ? "grid gap-2 sm:grid-cols-2"
    : "grid gap-2 md:grid-cols-[1fr_140px_120px_120px_120px_auto]"

  const total = useMemo(() => items.reduce((sum, item) => sum + netAmount(item), 0), [items])

  function updateItem(index: number, field: keyof ItemState, value: string) {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { treatment_name: "", treatment_date: "", cost: "", discount: "" }])
  }

  function removeItem(index: number) {
    setItems((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Treatments</p>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700"
        >
          <Plus className="size-3.5 shrink-0" aria-hidden />
          Add treatment
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`item-row-${index}`} className={`${rowClass} ${compact ? "rounded-md border border-slate-200 bg-white p-2" : ""}`}>
            <label className="space-y-1">
              <FormLabel required className="block text-xs font-medium text-slate-600">
                Treatment name
              </FormLabel>
              <input
                name="item_treatment_name"
                value={item.treatment_name}
                onChange={(event) => updateItem(index, "treatment_name", event.target.value)}
                placeholder="Treatment name"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-600">Treatment date</span>
              <input
                name="item_date"
                type="date"
                value={item.treatment_date}
                onChange={(event) => updateItem(index, "treatment_date", event.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <FormLabel required className="block text-xs font-medium text-slate-600">
                Amount
              </FormLabel>
              <input
                name="item_cost"
                type="number"
                min="0"
                step="0.01"
                value={item.cost}
                onChange={(event) => updateItem(index, "cost", event.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-600">Discount (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={item.discount}
                onChange={(event) => updateItem(index, "discount", event.target.value)}
                placeholder="0"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-xs font-medium text-slate-600">Payable</span>
              <input
                value={new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(netAmount(item))}
                readOnly
                tabIndex={-1}
                className="w-full rounded-md border bg-slate-50 px-3 py-2 text-sm text-slate-600"
              />
            </label>
            {/* Net payable persisted as offer_amount so invoices/receipts reflect the discount. */}
            <input type="hidden" name="item_offer_amount" value={offerValue(item)} readOnly />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 self-end rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-3.5 shrink-0" aria-hidden />
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">
        <span className="font-medium">Total payable: </span>
        {formatCurrency(total)}
        <span className="mt-1 block text-xs text-slate-500">
          Payable = Amount − (Amount × Discount%). e.g. 120 with 50% → 60. Zero rupees is allowed.
        </span>
      </div>
    </div>
  )
}
