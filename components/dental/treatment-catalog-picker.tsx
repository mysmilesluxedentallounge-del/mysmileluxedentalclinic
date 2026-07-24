"use client"

import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

export type CatalogLite = {
  id: string
  category: string
  name: string
  price: number
}

type TreatmentCatalogPickerProps = {
  catalog: CatalogLite[]
  onPick: (entry: CatalogLite) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value)
}

/** Searchable, category-filtered picker over the priced treatment catalog. */
export default function TreatmentCatalogPicker({ catalog, onPick }: TreatmentCatalogPickerProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("")

  const categories = useMemo(
    () => Array.from(new Set(catalog.map((entry) => entry.category))).sort(),
    [catalog]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter((entry) => {
      if (category && entry.category !== category) return false
      if (!q) return true
      return `${entry.name} ${entry.category}`.toLowerCase().includes(q)
    })
  }, [catalog, query, category])

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_200px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-slate-400" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search treatments…"
            className="w-full rounded-md border bg-white px-8 py-2 text-sm"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-md border bg-white px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 max-h-64 overflow-y-auto rounded-md border bg-white">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">No treatments match your search.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onPick(entry)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-[var(--yellow-lightest)]/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">{entry.name}</span>
                    <span className="block text-xs text-muted-foreground">{entry.category}</span>
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="text-slate-700">{formatCurrency(entry.price)}</span>
                    <Plus className="size-4 text-[var(--brand-dark)]" aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
