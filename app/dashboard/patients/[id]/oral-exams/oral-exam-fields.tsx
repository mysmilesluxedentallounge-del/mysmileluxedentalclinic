"use client"

import { useMemo, useState } from "react"
import { Check, X } from "lucide-react"
import type { Dentition, QuickFindings, SurfaceFindingMap } from "@/lib/database.types"
import {
  EXAM_NOTES_MAX,
  FINDING_CATEGORIES,
  QUICK_FINDING_OPTIONS,
  findingLabel,
  surfaceFindingSummary,
  surfaceLabel,
  type FindingCategory,
} from "@/lib/oral-examination"
import { DENTITION_LABELS, groupTokensForDentition, toothLabel } from "@/lib/dental-charting"
import ToothChart from "@/components/dental/tooth-chart"
import ToothSurfaceSelector from "@/components/dental/tooth-surface-selector"
import FindingChips from "@/components/dental/finding-chips"

type ToothFindings = {
  tooth_site_perio: SurfaceFindingMap
  soft_tissue: SurfaceFindingMap
  hard_tissue: SurfaceFindingMap
  notes: string
}

export type InitialFinding = {
  tooth_number: string
  tooth_site_perio: SurfaceFindingMap | null
  soft_tissue: SurfaceFindingMap | null
  hard_tissue: SurfaceFindingMap | null
  notes: string | null
}

type OralExamFieldsProps = {
  initialDentition?: Dentition
  initialQuickFindings?: QuickFindings | null
  initialFindings?: InitialFinding[]
}

const DENTITIONS: Dentition[] = ["adult", "pedo", "mixed"]

function emptyToothFindings(): ToothFindings {
  return { tooth_site_perio: {}, soft_tissue: {}, hard_tissue: {}, notes: "" }
}

function hydrate(initialFindings: InitialFinding[]): Record<string, ToothFindings> {
  const out: Record<string, ToothFindings> = {}
  for (const finding of initialFindings) {
    out[finding.tooth_number] = {
      tooth_site_perio: finding.tooth_site_perio ?? {},
      soft_tissue: finding.soft_tissue ?? {},
      hard_tissue: finding.hard_tissue ?? {},
      notes: finding.notes ?? "",
    }
  }
  return out
}

function toothHasContent(entry: ToothFindings): boolean {
  return (
    Object.keys(entry.tooth_site_perio).length > 0 ||
    Object.keys(entry.soft_tissue).length > 0 ||
    Object.keys(entry.hard_tissue).length > 0 ||
    entry.notes.trim().length > 0
  )
}

export default function OralExamFields({
  initialDentition = "adult",
  initialQuickFindings = null,
  initialFindings = [],
}: OralExamFieldsProps) {
  const [dentition, setDentition] = useState<Dentition>(initialDentition)
  const [malocclusion, setMalocclusion] = useState(initialQuickFindings?.malocclusion ?? "")
  const [missingTooth, setMissingTooth] = useState(initialQuickFindings?.missing_tooth ?? "")
  const [findings, setFindings] = useState<Record<string, ToothFindings>>(() => hydrate(initialFindings))
  const [chartTab, setChartTab] = useState<"teeth" | "tissue">("teeth")
  const [activeTooth, setActiveTooth] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<FindingCategory>("tooth_site_perio")
  const [activeSurface, setActiveSurface] = useState<string>("all")

  const groups = groupTokensForDentition(dentition)

  const markedTeeth = useMemo(
    () => Object.keys(findings).filter((tooth) => toothHasContent(findings[tooth])),
    [findings]
  )

  const findingsJson = useMemo(() => {
    const entries = markedTeeth
      .map((tooth) => {
        const entry = findings[tooth]
        return {
          tooth_number: tooth,
          tooth_site_perio: entry.tooth_site_perio,
          soft_tissue: entry.soft_tissue,
          hard_tissue: entry.hard_tissue,
          notes: entry.notes.trim(),
        }
      })
      .filter((entry) => toothHasContent(findings[entry.tooth_number]))
    return entries.length > 0 ? JSON.stringify(entries) : ""
  }, [findings, markedTeeth])

  const activeEntry = activeTooth ? findings[activeTooth] ?? emptyToothFindings() : null
  const activeMap = activeEntry ? activeEntry[activeCategory] : {}
  const editingSurface = activeCategory === "tooth_site_perio" ? activeSurface : "all"
  const editingFindings = activeMap[editingSurface] ?? []

  function openTarget(token: string, category: FindingCategory = "tooth_site_perio") {
    setFindings((prev) => (prev[token] ? prev : { ...prev, [token]: emptyToothFindings() }))
    setActiveTooth(token)
    setActiveCategory(category)
    setActiveSurface("all")
  }

  function toggleFinding(findingKey: string) {
    if (!activeTooth) return
    setFindings((prev) => {
      const current = prev[activeTooth] ?? emptyToothFindings()
      const categoryMap = { ...current[activeCategory] }
      const list = new Set(categoryMap[editingSurface] ?? [])
      if (list.has(findingKey)) list.delete(findingKey)
      else list.add(findingKey)
      if (list.size > 0) categoryMap[editingSurface] = [...list]
      else delete categoryMap[editingSurface]
      return { ...prev, [activeTooth]: { ...current, [activeCategory]: categoryMap } }
    })
  }

  function removeFinding(category: FindingCategory, surface: string, key: string) {
    if (!activeTooth) return
    setFindings((prev) => {
      const current = prev[activeTooth] ?? emptyToothFindings()
      const categoryMap = { ...current[category] }
      const list = (categoryMap[surface] ?? []).filter((item) => item !== key)
      if (list.length > 0) categoryMap[surface] = list
      else delete categoryMap[surface]
      return { ...prev, [activeTooth]: { ...current, [category]: categoryMap } }
    })
  }

  function updateNotes(value: string) {
    if (!activeTooth) return
    setFindings((prev) => {
      const current = prev[activeTooth] ?? emptyToothFindings()
      return { ...prev, [activeTooth]: { ...current, notes: value.slice(0, EXAM_NOTES_MAX) } }
    })
  }

  function closeAndPrune() {
    if (activeTooth) {
      setFindings((prev) => {
        if (prev[activeTooth] && toothHasContent(prev[activeTooth])) return prev
        const next = { ...prev }
        delete next[activeTooth]
        return next
      })
    }
    setActiveTooth(null)
  }

  function removeTooth(tooth: string) {
    setFindings((prev) => {
      const next = { ...prev }
      delete next[tooth]
      return next
    })
    if (activeTooth === tooth) setActiveTooth(null)
  }

  const activeCategoryLabel = FINDING_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? ""
  const activeOptions = FINDING_CATEGORIES.find((c) => c.key === activeCategory)!.options

  return (
    <div className="space-y-5">
      {/* Hidden inputs consumed by the server action */}
      <input type="hidden" name="dentition" value={dentition} readOnly />
      <input type="hidden" name="quick_malocclusion" value={malocclusion} readOnly />
      <input type="hidden" name="quick_missing_tooth" value={missingTooth} readOnly />
      <input type="hidden" name="findings_json" value={findingsJson} readOnly />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* Teeth / Tissue tabs */}
        <div className="flex gap-1 border-b border-slate-200 bg-slate-50 px-3 pt-2">
          {(["teeth", "tissue"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setChartTab(tab)}
              className={`rounded-t-md px-5 py-2 text-sm font-medium ${
                chartTab === tab
                  ? "bg-[var(--yellow-mid)] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {tab === "teeth" ? "Teeth" : "Tissue"}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Quick findings */}
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-[var(--brand-dark)]">Quick Finding(s)</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
              <QuickFinding
                label="Irregular Teeth / Malocclusion?"
                value={malocclusion}
                onChange={setMalocclusion}
              />
              <QuickFinding
                label="Missing Tooth Except 3rd Molar?"
                value={missingTooth}
                onChange={setMissingTooth}
              />
            </div>
          </div>

          {chartTab === "teeth" ? (
            <div className="mt-4 grid gap-4 md:grid-cols-[auto_1fr_auto]">
              {/* Dentition left rail */}
              <div className="flex gap-2 md:flex-col">
                {DENTITIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDentition(value)}
                    className={`rounded-md px-4 py-2 text-sm ${
                      dentition === value
                        ? "bg-[var(--yellow-mid)] font-medium text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    {DENTITION_LABELS[value]}
                  </button>
                ))}
              </div>

              {/* Tooth chart */}
              <div>
                <ToothChart
                  dentition={dentition}
                  markedTeeth={markedTeeth}
                  activeTooth={activeTooth}
                  onSelect={(tooth) => openTarget(tooth)}
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Select a tooth to record findings.
                </p>
              </div>

              {/* Group selector */}
              <div className="space-y-3 text-sm">
                <button
                  type="button"
                  onClick={() => openTarget(groups.all)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left font-medium hover:bg-slate-50"
                >
                  All Teeth
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed border-slate-300 p-4 text-sm">
              <p className="text-slate-700">
                Record oral <strong>Soft Tissue</strong> / <strong>Hard Tissue</strong> findings that are not tied to a
                specific tooth.
              </p>
              <button
                type="button"
                onClick={() => openTarget(groups.all, "soft_tissue")}
                className="mt-3 rounded-md bg-[var(--yellow-mid)] px-4 py-2 text-sm font-medium text-white"
              >
                Record tissue findings
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Findings summary table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[var(--yellow-mid)] text-left text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">Tooth No.</th>
              <th className="px-3 py-2 font-semibold">Tooth Site &amp; Perio</th>
              <th className="px-3 py-2 font-semibold">Soft Tissue</th>
              <th className="px-3 py-2 font-semibold">Hard Tissue</th>
              <th className="px-3 py-2 font-semibold">Notes</th>
              <th className="px-3 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {markedTeeth.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-muted-foreground">
                  No findings recorded yet. Select a tooth above to begin.
                </td>
              </tr>
            ) : (
              markedTeeth.map((tooth) => {
                const entry = findings[tooth]
                return (
                  <tr key={tooth} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium">{toothLabel(tooth)}</td>
                    <td className="px-3 py-2">{surfaceFindingSummary(entry.tooth_site_perio) || "NA"}</td>
                    <td className="px-3 py-2">{surfaceFindingSummary(entry.soft_tissue) || "NA"}</td>
                    <td className="px-3 py-2">{surfaceFindingSummary(entry.hard_tissue) || "NA"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{entry.notes.trim() || "NA"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => openTarget(tooth)} className="text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button type="button" onClick={() => removeTooth(tooth)} className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Per-tooth finding modal */}
      {activeTooth && activeEntry ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
            {/* Header + breadcrumb */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm text-slate-600">
                Oral Exam <span className="text-slate-400">›</span> {DENTITION_LABELS[dentition]}{" "}
                <span className="text-slate-400">›</span> {activeCategoryLabel}{" "}
                <span className="rounded-full bg-[var(--yellow-lightest)] px-2 py-0.5 text-xs font-semibold text-[var(--brand-dark)]">
                  {toothLabel(activeTooth)}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeAndPrune}
                  className="inline-flex items-center gap-1 rounded-md bg-[var(--yellow-mid)] px-3 py-1.5 text-sm font-medium text-white"
                >
                  <Check className="size-4 shrink-0" aria-hidden />
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeAndPrune}
                  className="rounded-full p-1.5 text-slate-500 hover:bg-slate-200"
                  aria-label="Close"
                >
                  <X className="size-4 shrink-0" aria-hidden />
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 border-b border-slate-200 px-4 pt-2">
              {FINDING_CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`rounded-t-md px-4 py-2 text-sm ${
                    activeCategory === category.key
                      ? "bg-[var(--yellow-mid)] font-semibold text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 overflow-y-auto p-4 md:grid-cols-[220px_1fr]">
              {/* Surface diamond (tooth site & perio only) */}
              {activeCategory === "tooth_site_perio" ? (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Surface</p>
                  <ToothSurfaceSelector
                    value={activeSurface}
                    onChange={setActiveSurface}
                    populatedSurfaces={Object.keys(activeMap)}
                  />
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Tissue findings apply to {toothLabel(activeTooth)}.
                </div>
              )}

              {/* Findings card grid + selected summary */}
              <div className="space-y-3">
                <FindingChips options={activeOptions} selected={editingFindings} onToggle={toggleFinding} />

                <div className="space-y-1">
                  {Object.entries(activeMap).map(([surface, keys]) => (
                    <div key={surface} className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium text-slate-700">
                        {activeCategory === "tooth_site_perio" ? `${surfaceLabel(surface)}:` : "Findings:"}
                      </span>
                      {keys.map((key) => (
                        <span
                          key={key}
                          className="inline-flex items-center gap-1 rounded-full bg-[var(--yellow-lightest)] px-2 py-0.5 text-xs text-[var(--brand-dark)]"
                        >
                          {findingLabel(key)}
                          <button
                            type="button"
                            onClick={() => removeFinding(activeCategory, surface, key)}
                            className="text-amber-600 hover:text-amber-800"
                            aria-label={`Remove ${findingLabel(key)}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-slate-200 p-4">
              <textarea
                value={activeEntry.notes}
                onChange={(event) => updateNotes(event.target.value)}
                maxLength={EXAM_NOTES_MAX}
                placeholder="» enter notes"
                className="min-h-16 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {EXAM_NOTES_MAX - activeEntry.notes.length} character(s) left
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function QuickFinding({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex gap-1.5">
        {QUICK_FINDING_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(value === opt.value ? "" : opt.value)}
            className={`rounded-md px-3 py-1.5 text-sm ${
              value === opt.value
                ? "bg-[var(--yellow-mid)] font-medium text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
