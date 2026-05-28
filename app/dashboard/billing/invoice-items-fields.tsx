"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { FormLabel } from "@/components/form-label"

type InvoiceItemInput = {
  treatment_name: string
  treatment_date: string
  cost: string
  offer_amount: string
}

function normalizeInitialItems(items: InvoiceItemInput[]) {
  if (items.length > 0) return items
  return [{ treatment_name: "", treatment_date: "", cost: "", offer_amount: "" }]
}

function lineAmount(item: InvoiceItemInput) {
  const offer = item.offer_amount.trim()
  if (offer !== "") {
    const offerValue = Number(offer)
    if (!Number.isNaN(offerValue) && offerValue >= 0) return offerValue
  }
  const costValue = Number(item.cost)
  if (!Number.isNaN(costValue) && costValue >= 0) return costValue
  return 0
}

export function InvoiceItemsFields({ initialItems = [] }: { initialItems?: InvoiceItemInput[] }) {
  const [items, setItems] = useState<InvoiceItemInput[]>(normalizeInitialItems(initialItems))

  const total = useMemo(() => items.reduce((sum, item) => sum + lineAmount(item), 0), [items])

  function updateItem(index: number, field: keyof InvoiceItemInput, value: string) {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { treatment_name: "", treatment_date: "", cost: "", offer_amount: "" }])
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
          <div key={`item-row-${index}`} className="grid gap-2 md:grid-cols-[1fr_140px_120px_120px_auto]">
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
              <span className="block text-xs font-medium text-slate-600">Offer amount</span>
              <input
                name="item_offer_amount"
                type="number"
                min="0"
                step="0.01"
                value={item.offer_amount}
                onChange={(event) => updateItem(index, "offer_amount", event.target.value)}
                placeholder="Optional"
                className="w-full rounded-md border px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-3.5 shrink-0" aria-hidden />
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-md border bg-slate-50 px-3 py-2 text-sm">
        <span className="font-medium">Total: </span>
        INR {new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}
        <span className="mt-1 block text-xs text-slate-500">
          Uses offer amount when set; otherwise uses the normal amount. Zero rupees is allowed.
        </span>
      </div>
    </div>
  )
}
