/** Patient file categories + storage bucket for the Files module. */

export const PATIENT_FILES_BUCKET = "patient-files"

export const FILE_CATEGORIES = [
  { value: "oral_image", label: "Oral Images" },
  { value: "xray", label: "X-Rays" },
  { value: "profile", label: "Profile Image" },
  { value: "document", label: "Documents" },
] as const

export type FileCategory = (typeof FILE_CATEGORIES)[number]["value"]

export const FILE_CATEGORY_VALUES = FILE_CATEGORIES.map((category) => category.value)

export function isValidFileCategory(value: string): value is FileCategory {
  return (FILE_CATEGORY_VALUES as string[]).includes(value)
}

export function fileCategoryLabel(value: string): string {
  return FILE_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

/** Image categories get a thumbnail preview; documents get a download link. */
export function isImageCategory(value: string): boolean {
  return value === "oral_image" || value === "xray" || value === "profile"
}

export const PATIENT_FILE_MAX_BYTES = 10 * 1024 * 1024
