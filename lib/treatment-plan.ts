/**
 * Treatment plan domain: statuses + FormData parsing for plan line items.
 * Item parsing mirrors parseInvoiceItemsFromFormData (parallel getAll arrays).
 */

import type {
  OralExaminationFinding,
  TreatmentPlanStatus,
  TreatmentPlanItemStatus,
  TreatmentPriority,
} from "@/lib/database.types"
import { findingKeysFromRow, findingLabel } from "@/lib/oral-examination"
import { suggestTreatmentsForFindings } from "@/lib/treatment-catalog"

export const PLAN_STATUS_VALUES: TreatmentPlanStatus[] = [
  "draft",
  "proposed",
  "accepted",
  "completed",
  "cancelled",
]

export const PLAN_STATUS_LABELS: Record<TreatmentPlanStatus, string> = {
  draft: "Draft",
  proposed: "Proposed",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const PLAN_ITEM_STATUS_VALUES: TreatmentPlanItemStatus[] = [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]

export const PLAN_ITEM_STATUS_LABELS: Record<TreatmentPlanItemStatus, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export function planStatusOrDefault(raw: unknown): TreatmentPlanStatus {
  return PLAN_STATUS_VALUES.includes(raw as TreatmentPlanStatus)
    ? (raw as TreatmentPlanStatus)
    : "draft"
}

export function planItemStatusOrDefault(raw: unknown): TreatmentPlanItemStatus {
  return PLAN_ITEM_STATUS_VALUES.includes(raw as TreatmentPlanItemStatus)
    ? (raw as TreatmentPlanItemStatus)
    : "planned"
}

export function priorityOrDefault(raw: unknown): TreatmentPriority {
  return raw === "secondary" ? "secondary" : "primary"
}

export type PlanFormItem = {
  treatment_catalog_id: string | null
  treatment_name: string
  price: number
  tooth_number: string | null
  surface: string | null
  finding_key: string | null
  priority: TreatmentPriority
  is_part_of_bridge: boolean
  status: TreatmentPlanItemStatus
  sort_order: number
}

export type ParsedPlanItems = {
  items: PlanFormItem[]
  hasInvalidItems: boolean
}

export function parsePlanItemsFromFormData(formData: FormData): ParsedPlanItems {
  const catalogIds = formData.getAll("item_treatment_catalog_id").map((v) => String(v ?? "").trim())
  const names = formData.getAll("item_treatment_name").map((v) => String(v ?? "").trim())
  const prices = formData.getAll("item_price").map((v) => String(v ?? "").trim())
  const teeth = formData.getAll("item_tooth_number").map((v) => String(v ?? "").trim())
  const surfaces = formData.getAll("item_surface").map((v) => String(v ?? "").trim())
  const findingKeys = formData.getAll("item_finding_key").map((v) => String(v ?? "").trim())
  const priorities = formData.getAll("item_priority").map((v) => String(v ?? "").trim())
  const bridges = formData.getAll("item_is_part_of_bridge").map((v) => String(v ?? "").trim())
  const statuses = formData.getAll("item_status").map((v) => String(v ?? "").trim())

  const count = Math.max(names.length, prices.length)
  const items: PlanFormItem[] = []

  for (let index = 0; index < count; index += 1) {
    const treatment_name = names[index] ?? ""
    const priceRaw = prices[index] ?? ""
    if (!treatment_name && priceRaw === "") continue

    const price = Number(priceRaw)
    if (!treatment_name || priceRaw === "" || Number.isNaN(price) || price < 0) {
      return { items: [], hasInvalidItems: true }
    }

    items.push({
      treatment_catalog_id: catalogIds[index] || null,
      treatment_name,
      price,
      tooth_number: teeth[index] || null,
      surface: surfaces[index] || null,
      finding_key: findingKeys[index] || null,
      priority: priorityOrDefault(priorities[index]),
      is_part_of_bridge: bridges[index] === "1",
      status: planItemStatusOrDefault(statuses[index]),
      sort_order: items.length,
    })
  }

  return { items, hasInvalidItems: false }
}

export function planTotal(items: { price: number }[]): number {
  return items.reduce((sum, item) => sum + (Number.isNaN(item.price) ? 0 : item.price), 0)
}

export type FindingSuggestion = {
  tooth_number: string
  finding_label: string
  primary: string[]
  secondary: string[]
}

/** Turn saved exam findings into per-tooth suggested treatment needs (reference for planning). */
export function buildFindingSuggestions(findings: OralExaminationFinding[]): FindingSuggestion[] {
  const out: FindingSuggestion[] = []
  for (const finding of findings) {
    const keys = findingKeysFromRow(finding)
    if (keys.length === 0) continue
    const { primary, secondary } = suggestTreatmentsForFindings(keys)
    if (primary.length === 0 && secondary.length === 0) continue
    out.push({
      tooth_number: finding.tooth_number,
      finding_label: keys.map(findingLabel).join(", "),
      primary,
      secondary,
    })
  }
  return out
}
