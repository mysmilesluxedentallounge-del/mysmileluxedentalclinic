"use client"

import type { Dentition } from "@/lib/database.types"
import { toothRowsForDentition, toothType } from "@/lib/dental-charting"
import ToothIcon, { type ToothOrientation, type ToothState } from "@/components/dental/tooth-icon"

type ToothChartProps = {
  dentition: Dentition
  /** Teeth that already have recorded findings (rendered highlighted). */
  markedTeeth?: Iterable<string>
  activeTooth?: string | null
  onSelect?: (tooth: string) => void
  disabled?: boolean
}

function toothButtonClass(isMarked: boolean, isActive: boolean, disabled: boolean) {
  const base = "flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-md border p-1 transition-colors"
  if (isActive) {
    return `${base} border-[var(--yellow-mid)] bg-[var(--yellow-lightest)] ring-2 ring-inset ring-[var(--yellow-mid)]`
  }
  if (isMarked) {
    return `${base} border-amber-300 bg-amber-50`
  }
  const interactive = disabled ? "cursor-default" : "cursor-pointer hover:border-slate-300 hover:bg-slate-50"
  return `${base} border-transparent ${interactive}`
}

export default function ToothChart({
  dentition,
  markedTeeth,
  activeTooth = null,
  onSelect,
  disabled = false,
}: ToothChartProps) {
  const { upper, lower } = toothRowsForDentition(dentition)
  const marked = new Set<string>(markedTeeth ?? [])

  /** Split a row into right/left halves so we can render a central midline gap. */
  function renderRow(teeth: readonly string[], rowKey: string, orientation: ToothOrientation) {
    const mid = Math.ceil(teeth.length / 2)
    const right = teeth.slice(0, mid)
    const left = teeth.slice(mid)

    function renderTooth(tooth: string) {
      const isMarked = marked.has(tooth)
      const isActive = activeTooth === tooth
      const state: ToothState = isActive ? "active" : isMarked ? "marked" : "default"
      return (
        <button
          key={tooth}
          type="button"
          disabled={disabled}
          onClick={disabled ? undefined : () => onSelect?.(tooth)}
          className={toothButtonClass(isMarked, isActive, disabled)}
          title={`Tooth ${tooth}`}
          aria-pressed={isActive}
        >
          <ToothIcon tooth={tooth} type={toothType(tooth)} state={state} orientation={orientation} className="h-14 w-7" />
          <span className={`text-[11px] font-medium ${isMarked || isActive ? "text-amber-800" : "text-slate-600"}`}>
            {tooth}
          </span>
        </button>
      )
    }

    // Upper teeth render crown-down (roots up); labels stay below. Order labels above teeth for the upper arch.
    return (
      <div key={rowKey} className="flex items-end justify-center gap-1">
        <div className="flex flex-nowrap gap-1">{right.map(renderTooth)}</div>
        <div className="mx-1 h-16 w-px self-center bg-slate-200" aria-hidden />
        <div className="flex flex-nowrap gap-1">{left.map(renderTooth)}</div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex min-w-full flex-col gap-2 rounded-md border border-slate-200 bg-white p-3">
        {renderRow(upper, "upper", "upper")}
        <div className="h-px bg-slate-100" />
        {renderRow(lower, "lower", "lower")}
      </div>
    </div>
  )
}
