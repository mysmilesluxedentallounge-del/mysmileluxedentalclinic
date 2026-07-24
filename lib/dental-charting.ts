/**
 * FDI (ISO 3950) tooth numbering helpers for the oral examination tooth chart.
 * Pure functions with no dependencies — safe to import from client and server.
 */

import type { Dentition } from "@/lib/database.types"

/** Permanent dentition, display order left→right as shown on the chart. */
export const ADULT_UPPER = [
  "18", "17", "16", "15", "14", "13", "12", "11",
  "21", "22", "23", "24", "25", "26", "27", "28",
] as const

export const ADULT_LOWER = [
  "48", "47", "46", "45", "44", "43", "42", "41",
  "31", "32", "33", "34", "35", "36", "37", "38",
] as const

/** Primary (deciduous) dentition. */
export const PEDO_UPPER = ["55", "54", "53", "52", "51", "61", "62", "63", "64", "65"] as const
export const PEDO_LOWER = ["85", "84", "83", "82", "81", "71", "72", "73", "74", "75"] as const

/** Non-tooth targets used for arch/quadrant/all-teeth level findings. */
export const ARCH_TOKENS = ["upper_arch", "lower_arch"] as const
export const ALL_TOKENS = ["all_adult", "all_pedo"] as const
export const QUADRANT_TOKENS_PERMANENT = ["q1", "q2", "q3", "q4"] as const
export const QUADRANT_TOKENS_PRIMARY = ["q5", "q6", "q7", "q8"] as const

export const TOOTH_TOKEN_LABELS: Record<string, string> = {
  upper_arch: "Upper Arch",
  lower_arch: "Lower Arch",
  all_adult: "All Adult",
  all_pedo: "All Primary",
  q1: "Q1 (Upper Right)",
  q2: "Q2 (Upper Left)",
  q3: "Q3 (Lower Left)",
  q4: "Q4 (Lower Right)",
  q5: "Q5 (Upper Right)",
  q6: "Q6 (Upper Left)",
  q7: "Q7 (Lower Left)",
  q8: "Q8 (Lower Right)",
}

const ADULT_SET = new Set<string>([...ADULT_UPPER, ...ADULT_LOWER])
const PEDO_SET = new Set<string>([...PEDO_UPPER, ...PEDO_LOWER])
const TOKEN_SET = new Set<string>([
  ...ARCH_TOKENS,
  ...ALL_TOKENS,
  ...QUADRANT_TOKENS_PERMANENT,
  ...QUADRANT_TOKENS_PRIMARY,
])

export type GroupTokens = { all: string; arches: string[]; quadrants: string[] }

/** Group-selection targets (all teeth / arches / quadrants) for a dentition. */
export function groupTokensForDentition(dentition: Dentition): GroupTokens {
  const isPrimary = dentition === "pedo"
  return {
    all: isPrimary ? "all_pedo" : "all_adult",
    arches: ["upper_arch", "lower_arch"],
    quadrants: isPrimary ? [...QUADRANT_TOKENS_PRIMARY] : [...QUADRANT_TOKENS_PERMANENT],
  }
}

export type ToothRows = {
  upper: readonly string[]
  lower: readonly string[]
}

/** Returns the two chart rows for the given dentition. Mixed shows permanent + primary. */
export function toothRowsForDentition(dentition: Dentition): ToothRows {
  if (dentition === "pedo") {
    return { upper: PEDO_UPPER, lower: PEDO_LOWER }
  }
  if (dentition === "mixed") {
    return {
      upper: [...ADULT_UPPER, ...PEDO_UPPER],
      lower: [...ADULT_LOWER, ...PEDO_LOWER],
    }
  }
  return { upper: ADULT_UPPER, lower: ADULT_LOWER }
}

export function allTeethForDentition(dentition: Dentition): string[] {
  const { upper, lower } = toothRowsForDentition(dentition)
  return [...upper, ...lower]
}

export function isValidToothNumber(value: string): boolean {
  return ADULT_SET.has(value) || PEDO_SET.has(value) || TOKEN_SET.has(value)
}

export function toothLabel(value: string): string {
  return TOOTH_TOKEN_LABELS[value] ?? value
}

/** Human-readable label for a dentition value. */
export const DENTITION_LABELS: Record<Dentition, string> = {
  adult: "Adult",
  pedo: "Pedo",
  mixed: "Mixed",
}

export type ToothType = "incisor" | "canine" | "premolar" | "molar"

/**
 * Classify a tooth by its FDI number so the chart can draw the right crown shape.
 * Unit digit: 1-2 incisor, 3 canine, 4-5 premolar (permanent) / molar (primary), 6-8 molar.
 */
export function toothType(toothNumber: string): ToothType {
  const n = Number(toothNumber)
  if (!Number.isFinite(n)) return "molar"
  const tens = Math.floor((n % 100) / 10)
  const unit = n % 10
  const isPrimary = tens >= 5 && tens <= 8
  if (unit === 1 || unit === 2) return "incisor"
  if (unit === 3) return "canine"
  if (unit === 4 || unit === 5) return isPrimary ? "molar" : "premolar"
  return "molar"
}
