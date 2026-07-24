"use client"

import type { FindingOption } from "@/lib/oral-examination"

type FindingChipsProps = {
  options: FindingOption[]
  selected: string[]
  onToggle: (findingKey: string) => void
  disabled?: boolean
}

/** Finding picker rendered as a grid of selectable cards (matches the clinical chart). */
export default function FindingChips({ options, selected, onToggle, disabled = false }: FindingChipsProps) {
  const selectedSet = new Set(selected)

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => {
        const isOn = selectedSet.has(option.value)
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={disabled ? undefined : () => onToggle(option.value)}
            className={`flex items-center justify-between gap-1 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
              isOn
                ? "border-[var(--yellow-mid)] bg-[var(--yellow-mid)] font-medium text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            } ${disabled ? "cursor-default" : "cursor-pointer"}`}
            aria-pressed={isOn}
          >
            <span className="truncate">
              <span className={isOn ? "text-white/80" : "text-[var(--yellow-mid)]"}>»</span> {option.label}
            </span>
            {isOn ? <span aria-hidden className="text-white">×</span> : null}
          </button>
        )
      })}
    </div>
  )
}
