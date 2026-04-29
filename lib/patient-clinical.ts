/** Patient medical history keys stored in `patients.medical_history` (jsonb). */

export const MEDICAL_HISTORY_FIELD_KEYS = [
  "diabetes",
  "pregnancy_trimester",
  "bleeding_disorder",
  "tobacco",
  "epilepsy",
  "organ_lung_kidney_ulcer_thyroid",
  "blood_pressure",
  "cardiac",
  "hiv_hepatitis_herpes",
  "alcohol",
  "radiotherapy_cancer",
  "depression",
] as const

export type MedicalHistoryKey = (typeof MEDICAL_HISTORY_FIELD_KEYS)[number]

export type MedicalHistoryData = Partial<Record<MedicalHistoryKey, string>>

export function parseMedicalHistoryFromFormData(formData: FormData): MedicalHistoryData | null {
  const out: MedicalHistoryData = {}
  for (const key of MEDICAL_HISTORY_FIELD_KEYS) {
    const v = String(formData.get(`mh_${key}`) ?? "").trim()
    if (v) out[key] = v
  }
  return Object.keys(out).length > 0 ? out : null
}

export const PATIENT_NOTES_MAX = 768

export const DENTAL_VISIT_VALUES = ["lt_6m", "gt_6m", "gt_1y"] as const
export const YNA_VALUES = ["yes", "no", "na"] as const
