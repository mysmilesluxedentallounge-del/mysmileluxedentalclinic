/**
 * Treatment catalog domain: category vocabulary + the clinical finding→treatment
 * suggestion map. The suggestion map is intentionally code (not data) — it encodes
 * clinical knowledge, mirroring how lib/chief-complaint.ts holds a fixed vocabulary.
 * The priced catalog itself lives in the `treatment_catalog` table (admin-managed).
 */

/** Categories used to group priced treatments (matches the admin catalog + planner picker). */
export const TREATMENT_CATEGORIES = [
  "Consultations / X-Rays",
  "Endodontics",
  "Extractions",
  "Minor Oral Surgery",
  "Prosthodontics",
  "Crowns & Bridges",
  "Implants",
  "Periodontics",
  "Orthodontics",
  "Aligners",
  "Pedodontics",
  "Restorations",
  "Preventive",
  "Lasers",
  "Membership",
  "Others",
] as const

export type TreatmentCategory = (typeof TREATMENT_CATEGORIES)[number]

export function isValidTreatmentCategory(value: string): value is TreatmentCategory {
  return (TREATMENT_CATEGORIES as readonly string[]).includes(value)
}

export type TreatmentSuggestion = {
  primary: string[]
  secondary: string[]
}

const EMPTY_SUGGESTION: TreatmentSuggestion = { primary: [], secondary: [] }

/**
 * Finding key (from lib/oral-examination.ts) → suggested treatment needs.
 * "Primary" needs are the first-line options; "Secondary" are adjuncts/alternatives.
 * These labels guide the doctor toward priced entries in the catalog picker.
 */
export const FINDING_TREATMENT_MAP: Record<string, TreatmentSuggestion> = {
  // Tooth Site & Perio
  abrasion: { primary: ["Restoration", "Desensitisation"], secondary: ["Crown"] },
  attrition: { primary: ["Restoration", "Crown", "RCT"], secondary: ["Appliance & Retainers"] },
  bruxism: { primary: ["Appliance & Retainers"], secondary: ["Restoration", "Crown"] },
  caries: {
    primary: ["Restoration", "RCT", "Crown", "Fluoride Application", "Extraction"],
    secondary: ["Pulp Capping"],
  },
  discolouration: { primary: ["Bleaching", "Veneers"], secondary: ["Crown", "Restoration"] },
  enamel_hypoplasia: { primary: ["Restoration", "Veneers"], secondary: ["Crown"] },
  erosion: { primary: ["Restoration", "Desensitisation"], secondary: ["Crown"] },
  fracture: { primary: ["Restoration", "Crown", "RCT"], secondary: ["Extraction"] },
  fractured_cusp: { primary: ["Crown", "Restoration"], secondary: ["RCT"] },
  laceration_trauma: { primary: ["Suturing", "RCT"], secondary: ["Extraction"] },
  pit_and_fissures: { primary: ["Pit & Fissure Sealant", "Restoration"], secondary: ["Fluoride Application"] },
  plaque: { primary: ["Prophylaxis", "Scaling"], secondary: ["Curettage"] },
  sensitivity: { primary: ["Desensitisation", "Fluoride Application"], secondary: ["Restoration"] },
  sharp_cusp: { primary: ["Coronoplasty"], secondary: ["Restoration"] },
  tfo: { primary: ["Occlusal Adjustment"], secondary: ["Appliance & Retainers"] },
  calculus: { primary: ["Scaling", "Prophylaxis"], secondary: ["Curettage"] },
  gingival_recession: { primary: ["Gingival Graft"], secondary: ["Desensitisation"] },
  mobility: { primary: ["Splinting", "Extraction"], secondary: ["Periodontal Flap"] },
  periodontal_pocket: { primary: ["Curettage", "Periodontal Flap"], secondary: ["Scaling"] },
  bleeding_on_probing: { primary: ["Scaling", "Prophylaxis"], secondary: ["Curettage"] },
  furcation_involvement: { primary: ["Periodontal Flap", "Curettage"], secondary: ["Extraction"] },
  // Soft Tissue
  ulcer: { primary: ["Medication"], secondary: ["Biopsy"] },
  swelling: { primary: ["Incision & Drainage", "Medication"], secondary: ["Extraction"] },
  abscess: { primary: ["Incision & Drainage", "RCT", "Medication"], secondary: ["Extraction"] },
  gingival_enlargement: { primary: ["Gingivectomy"], secondary: ["Scaling"] },
  gingivitis: { primary: ["Scaling", "Prophylaxis"], secondary: ["Curettage"] },
  leukoplakia: { primary: ["Biopsy"], secondary: ["Excision"] },
  erythroplakia: { primary: ["Biopsy"], secondary: ["Excision"] },
  mucocele: { primary: ["Excision"], secondary: ["Biopsy"] },
  inflammation: { primary: ["Medication", "Scaling"], secondary: ["Curettage"] },
  lymphadenopathy: { primary: ["Medication"], secondary: ["Referral"] },
  // Hard Tissue
  bone_resorption: { primary: ["Bone Graft", "Periodontal Flap"], secondary: ["Membrane"] },
  periodontal_bone_loss: { primary: ["Periodontal Flap", "Bone Graft"], secondary: ["Membrane"] },
  periapical_radiolucency: { primary: ["RCT", "Apicoectomy"], secondary: ["Extraction"] },
  impacted_tooth: {
    primary: ["Surgical Extraction", "Periodontal Flap", "Extraction"],
    secondary: ["Bone Graft", "Membrane"],
  },
  root_stump: { primary: ["Extraction"], secondary: ["Surgical Extraction"] },
  cyst: { primary: ["Enucleation", "Surgical Extraction"], secondary: ["Biopsy"] },
  condensing_osteitis: { primary: ["RCT"], secondary: ["Observation"] },
}

export function suggestionForFinding(findingKey: string): TreatmentSuggestion {
  return FINDING_TREATMENT_MAP[findingKey] ?? EMPTY_SUGGESTION
}

/** Merge suggestions across multiple findings, de-duplicating while preserving order. */
export function suggestTreatmentsForFindings(findingKeys: string[]): TreatmentSuggestion {
  const primary: string[] = []
  const secondary: string[] = []
  for (const key of findingKeys) {
    const suggestion = suggestionForFinding(key)
    for (const need of suggestion.primary) {
      if (!primary.includes(need)) primary.push(need)
    }
    for (const need of suggestion.secondary) {
      if (!secondary.includes(need)) secondary.push(need)
    }
  }
  // A need that is primary for one finding should not also appear as secondary.
  return { primary, secondary: secondary.filter((need) => !primary.includes(need)) }
}
