"use client"

import { surfaceLabel } from "@/lib/oral-examination"

type ToothSurfaceSelectorProps = {
  value: string
  onChange: (surface: string) => void
  /** Surfaces that currently carry at least one finding (shown with a dot). */
  populatedSurfaces?: Iterable<string>
  disabled?: boolean
}

/**
 * Anatomical surface picker laid out as a cross/diamond (matches the clinical
 * chart): Buccal top · Mesial-Occlusal-Distal middle · Palatal bottom, with
 * All Surface and Perio as full-width options below.
 */
export default function ToothSurfaceSelector({
  value,
  onChange,
  populatedSurfaces,
  disabled = false,
}: ToothSurfaceSelectorProps) {
  const populated = new Set<string>(populatedSurfaces ?? [])

  function renderCell(surface: string, extra = "") {
    const isActive = value === surface
    const state = isActive
      ? "bg-[var(--yellow-mid)] font-semibold text-white border-[var(--yellow-mid)]"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
    const cursor = disabled ? "cursor-default" : "cursor-pointer"
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : () => onChange(surface)}
        className={`relative flex items-center justify-center rounded-md border px-2 py-2 text-sm transition-colors ${state} ${cursor} ${extra}`}
        aria-pressed={isActive}
      >
        {surfaceLabel(surface)}
        {populated.has(surface) ? (
          <span aria-hidden className="absolute right-1 top-1 text-[10px] text-amber-500">
            ●
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <div className="mx-auto w-full max-w-xs space-y-2">
      <div className="grid grid-cols-3 gap-1.5">
        <span aria-hidden />
        {renderCell("buccal")}
        <span aria-hidden />
        {renderCell("mesial")}
        {renderCell("occlusal")}
        {renderCell("distal")}
        <span aria-hidden />
        {renderCell("palatal")}
        <span aria-hidden />
      </div>
      {renderCell("all", "w-full")}
      {renderCell("perio", "w-full")}
    </div>
  )
}
