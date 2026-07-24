/**
 * Oral examination domain vocabulary + JSONB parse/normalize helpers.
 * Follows the same shape as lib/chief-complaint.ts (fixed vocabulary + normalizers).
 */

import type {
  Dentition,
  OralExaminationFinding,
  QuickFindings,
  SurfaceFindingMap,
} from "@/lib/database.types"

export const DENTITION_VALUES = ["adult", "pedo", "mixed"] as const

/** Tooth surfaces a finding can be recorded against (matches Clove's surface selector). */
export const TOOTH_SURFACES = [
  { value: "buccal", label: "Buccal" },
  { value: "mesial", label: "Mesial" },
  { value: "occlusal", label: "Occlusal" },
  { value: "distal", label: "Distal" },
  { value: "palatal", label: "Palatal" },
  { value: "all", label: "All Surface" },
  { value: "perio", label: "Perio" },
] as const

export type ToothSurface = (typeof TOOTH_SURFACES)[number]["value"]
const SURFACE_SET = new Set<string>(TOOTH_SURFACES.map((s) => s.value))

export function surfaceLabel(value: string): string {
  return TOOTH_SURFACES.find((s) => s.value === value)?.label ?? value
}

/** Quick findings recorded at the exam header. */
export const QUICK_FINDING_VALUES = ["clinical", "aesthetic", "no"] as const
export const QUICK_FINDING_OPTIONS = [
  { value: "clinical", label: "Yes (Clinical)" },
  { value: "aesthetic", label: "Yes (Aesthetic)" },
  { value: "no", label: "No" },
] as const

export type FindingOption = { value: string; label: string }

/** Findings for the "Tooth Site & Perio" tab (per-surface hard findings + perio). */
export const TOOTH_SITE_PERIO_FINDINGS: FindingOption[] = [
  { value: "abrasion", label: "Abrasion" },
  { value: "attrition", label: "Attrition" },
  { value: "bruxism", label: "Bruxism" },
  { value: "caries", label: "Caries" },
  { value: "discolouration", label: "Discolouration of teeth" },
  { value: "enamel_hypoplasia", label: "Enamel Hypoplasia" },
  { value: "erosion", label: "Erosion" },
  { value: "fracture", label: "Fracture" },
  { value: "fractured_cusp", label: "Fractured Cusp" },
  { value: "laceration_trauma", label: "Laceration / Trauma" },
  { value: "pit_and_fissures", label: "Pit and Fissures" },
  { value: "plaque", label: "Plaque" },
  { value: "sensitivity", label: "Sensitivity" },
  { value: "sharp_cusp", label: "Sharp Cusp" },
  { value: "tfo", label: "TFO" },
  { value: "calculus", label: "Calculus" },
  { value: "gingival_recession", label: "Gingival Recession" },
  { value: "mobility", label: "Mobility" },
  { value: "periodontal_pocket", label: "Periodontal Pocket" },
  { value: "bleeding_on_probing", label: "Bleeding on Probing" },
  { value: "furcation_involvement", label: "Furcation Involvement" },
]

/** Findings for the "Soft Tissue" tab. */
export const SOFT_TISSUE_FINDINGS: FindingOption[] = [
  { value: "ulcer", label: "Ulcer" },
  { value: "swelling", label: "Swelling" },
  { value: "abscess", label: "Abscess" },
  { value: "gingival_enlargement", label: "Gingival Enlargement" },
  { value: "gingivitis", label: "Gingivitis" },
  { value: "leukoplakia", label: "Leukoplakia" },
  { value: "erythroplakia", label: "Erythroplakia" },
  { value: "mucocele", label: "Mucocele" },
  { value: "inflammation", label: "Inflammation" },
  { value: "lymphadenopathy", label: "Lymphadenopathy" },
]

/** Findings for the "Hard Tissue" tab (bone / radiographic). */
export const HARD_TISSUE_FINDINGS: FindingOption[] = [
  { value: "bone_resorption", label: "Bone Resorption" },
  { value: "periodontal_bone_loss", label: "Periodontal Bone Loss" },
  { value: "periapical_radiolucency", label: "Periapical Radiolucency" },
  { value: "impacted_tooth", label: "Impacted Tooth" },
  { value: "root_stump", label: "Root Stump" },
  { value: "cyst", label: "Cyst" },
  { value: "condensing_osteitis", label: "Condensing Osteitis" },
]

export type FindingCategory = "tooth_site_perio" | "soft_tissue" | "hard_tissue"

export const FINDING_CATEGORIES: { key: FindingCategory; label: string; options: FindingOption[] }[] = [
  { key: "tooth_site_perio", label: "Tooth Site & Perio", options: TOOTH_SITE_PERIO_FINDINGS },
  { key: "soft_tissue", label: "Soft Tissue", options: SOFT_TISSUE_FINDINGS },
  { key: "hard_tissue", label: "Hard Tissue", options: HARD_TISSUE_FINDINGS },
]

const FINDING_LABEL_LOOKUP = new Map<string, string>(
  [...TOOTH_SITE_PERIO_FINDINGS, ...SOFT_TISSUE_FINDINGS, ...HARD_TISSUE_FINDINGS].map((f) => [
    f.value,
    f.label,
  ])
)

const CATEGORY_FINDING_SETS: Record<FindingCategory, Set<string>> = {
  tooth_site_perio: new Set(TOOTH_SITE_PERIO_FINDINGS.map((f) => f.value)),
  soft_tissue: new Set(SOFT_TISSUE_FINDINGS.map((f) => f.value)),
  hard_tissue: new Set(HARD_TISSUE_FINDINGS.map((f) => f.value)),
}

export function findingLabel(value: string): string {
  return FINDING_LABEL_LOOKUP.get(value) ?? value
}

export const EXAM_NOTES_MAX = 768

export function dentitionOrDefault(raw: unknown): Dentition {
  return raw === "pedo" || raw === "mixed" ? raw : "adult"
}

export function normalizeQuickFinding(raw: unknown): "clinical" | "aesthetic" | "no" | undefined {
  return raw === "clinical" || raw === "aesthetic" || raw === "no" ? raw : undefined
}

export function parseQuickFindingsFromFormData(formData: FormData): QuickFindings | null {
  const malocclusion = normalizeQuickFinding(String(formData.get("quick_malocclusion") ?? ""))
  const missing_tooth = normalizeQuickFinding(String(formData.get("quick_missing_tooth") ?? ""))
  const out: QuickFindings = {}
  if (malocclusion) out.malocclusion = malocclusion
  if (missing_tooth) out.missing_tooth = missing_tooth
  return Object.keys(out).length > 0 ? out : null
}

/** Keep only known surfaces mapped to known finding keys for the given category. */
export function normalizeSurfaceFindingMap(
  raw: unknown,
  category: FindingCategory
): SurfaceFindingMap | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null
  const validFindings = CATEGORY_FINDING_SETS[category]
  const out: SurfaceFindingMap = {}
  for (const [surface, findings] of Object.entries(raw as Record<string, unknown>)) {
    if (!SURFACE_SET.has(surface) || !Array.isArray(findings)) continue
    const picked: string[] = []
    for (const f of findings) {
      if (typeof f === "string" && validFindings.has(f) && !picked.includes(f)) {
        picked.push(f)
      }
    }
    if (picked.length > 0) out[surface] = picked
  }
  return Object.keys(out).length > 0 ? out : null
}

export type ParsedFinding = {
  tooth_number: string
  tooth_site_perio: SurfaceFindingMap | null
  soft_tissue: SurfaceFindingMap | null
  hard_tissue: SurfaceFindingMap | null
  notes: string | null
  sort_order: number
}

/**
 * Findings arrive as a single hidden `findings_json` input holding an array of
 * per-tooth records (produced by the OralExamFields client component).
 */
export function parseExamFindingsFromJson(raw: string | null | undefined): ParsedFinding[] {
  if (!raw?.trim()) return []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const results: ParsedFinding[] = []
  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") continue
    const record = entry as Record<string, unknown>
    const toothNumber = typeof record.tooth_number === "string" ? record.tooth_number : ""
    if (!toothNumber) continue

    const tooth_site_perio = normalizeSurfaceFindingMap(record.tooth_site_perio, "tooth_site_perio")
    const soft_tissue = normalizeSurfaceFindingMap(record.soft_tissue, "soft_tissue")
    const hard_tissue = normalizeSurfaceFindingMap(record.hard_tissue, "hard_tissue")
    const notes =
      typeof record.notes === "string" && record.notes.trim()
        ? record.notes.trim().slice(0, EXAM_NOTES_MAX)
        : null

    if (!tooth_site_perio && !soft_tissue && !hard_tissue && !notes) continue

    results.push({
      tooth_number: toothNumber,
      tooth_site_perio,
      soft_tissue,
      hard_tissue,
      notes,
      sort_order: results.length,
    })
  }
  return results
}

/** Flatten every distinct finding key present in a saved finding row. */
export function findingKeysFromRow(finding: OralExaminationFinding): string[] {
  const keys = new Set<string>()
  for (const map of [finding.tooth_site_perio, finding.soft_tissue, finding.hard_tissue]) {
    if (!map) continue
    for (const list of Object.values(map)) {
      for (const key of list) keys.add(key)
    }
  }
  return [...keys]
}

/** Compact one-line summary of a surface→findings map, e.g. "Buccal: Attrition, Bruxism". */
export function surfaceFindingSummary(map: SurfaceFindingMap | null): string {
  if (!map) return ""
  return Object.entries(map)
    .map(([surface, findings]) => `${surfaceLabel(surface)}: ${findings.map(findingLabel).join(", ")}`)
    .join(" | ")
}
