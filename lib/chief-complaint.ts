export const CHIEF_COMPLAINT_TAG_OPTIONS = [
  "Pain",
  "Sensitivity",
  "Bad Breath",
  "Discolored Tooth",
  "Teeth Grinding",
  "Loose Teeth",
  "Missing Tooth",
  "Swelling",
  "Pain in Jaw joint",
  "Smile Issues",
  "Irregular teeth",
] as const

export type ChiefComplaintTag = (typeof CHIEF_COMPLAINT_TAG_OPTIONS)[number]

export const CHIEF_COMPLAINT_OTHER_MAX = 30

export type ChiefComplaintData = {
  tags: string[]
  other: string
}

const TAG_SET = new Set<string>(CHIEF_COMPLAINT_TAG_OPTIONS)

export function normalizeChiefComplaintTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const picked = new Set<string>()
  for (const t of tags) {
    if (typeof t === "string" && TAG_SET.has(t)) picked.add(t)
  }
  return CHIEF_COMPLAINT_TAG_OPTIONS.filter((label) => picked.has(label))
}

export function normalizeChiefComplaintOther(raw: unknown): string {
  if (typeof raw !== "string") return ""
  return raw.trim().slice(0, CHIEF_COMPLAINT_OTHER_MAX)
}

export function chiefComplaintSummary(data: ChiefComplaintData): string | null {
  const parts: string[] = []
  if (data.tags.length) parts.push(data.tags.join(", "))
  const o = data.other.trim()
  if (o) parts.push(o)
  if (!parts.length) return null
  return parts.join("; ")
}

export function parseChiefComplaintFormJson(raw: string | null | undefined): ChiefComplaintData | null {
  if (!raw?.trim()) return null
  try {
    const v = JSON.parse(raw) as { tags?: unknown; other?: unknown }
    const tags = normalizeChiefComplaintTags(v.tags)
    const other = normalizeChiefComplaintOther(v.other)
    if (tags.length === 0 && !other) return null
    return { tags, other }
  } catch {
    return null
  }
}

export function chiefComplaintFromRow(
  chief_complaint: unknown,
  legacyTreatment: string | null
): ChiefComplaintData {
  if (chief_complaint && typeof chief_complaint === "object" && !Array.isArray(chief_complaint)) {
    const o = chief_complaint as { tags?: unknown; other?: unknown }
    const tags = normalizeChiefComplaintTags(o.tags)
    const other = normalizeChiefComplaintOther(o.other)
    if (tags.length || other) return { tags, other }
  }
  if (legacyTreatment?.trim()) {
    return { tags: [], other: normalizeChiefComplaintOther(legacyTreatment) }
  }
  return { tags: [], other: "" }
}
