/**
 * Shared contract for the Smile Predictor lead form.
 *
 * Imported by the public page, the API route and the dashboard list, so the
 * validation rules and status labels cannot drift apart between them.
 */

export const SMILE_PREDICTION_STATUSES = [
  "new",
  "contacted",
  "converted",
  "not_interested",
] as const

export type SmilePredictionStatus = (typeof SMILE_PREDICTION_STATUSES)[number]

export const SMILE_PREDICTION_STATUS_LABELS: Record<SmilePredictionStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  not_interested: "Not interested",
}

/** Tailwind classes for the status pill in the dashboard table. */
export const SMILE_PREDICTION_STATUS_STYLES: Record<SmilePredictionStatus, string> = {
  new: "bg-sky-100 text-sky-800 border-sky-200",
  contacted: "bg-amber-100 text-amber-900 border-amber-200",
  converted: "bg-emerald-100 text-emerald-800 border-emerald-200",
  not_interested: "bg-slate-100 text-slate-600 border-slate-200",
}

export function isSmilePredictionStatus(value: unknown): value is SmilePredictionStatus {
  return (
    typeof value === "string" &&
    (SMILE_PREDICTION_STATUSES as readonly string[]).includes(value)
  )
}

export type SmilePredictionRecord = {
  id: string
  full_name: string
  phone: string
  email: string | null
  address: string | null
  status: SmilePredictionStatus
  notes: string | null
  created_at: string
}

export type SmilePredictionInput = {
  fullName: string
  phone: string
  email: string
  address: string
}

export type SmilePredictionErrors = Partial<Record<keyof SmilePredictionInput, string>>

/** Accepts 10-digit Indian mobile numbers, optionally with +91 / 0 and spacing. */
const PHONE_PATTERN = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Validates the lead form. Run on both sides: the browser for instant feedback,
 * the server because client-side checks can always be bypassed.
 */
export function validateSmilePrediction(input: SmilePredictionInput): SmilePredictionErrors {
  const errors: SmilePredictionErrors = {}

  const fullName = input.fullName.trim()
  if (!fullName) {
    errors.fullName = "Please enter your full name."
  } else if (fullName.length < 2) {
    errors.fullName = "Name looks too short."
  } else if (fullName.length > 100) {
    errors.fullName = "Name must be under 100 characters."
  } else if (!/[A-Za-z]/.test(fullName)) {
    errors.fullName = "Name must contain letters."
  }

  const phone = input.phone.trim()
  if (!phone) {
    errors.phone = "Please enter your contact number."
  } else if (!PHONE_PATTERN.test(phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Enter a valid 10-digit Indian mobile number."
  }

  // Email and address are optional, but must be sane when supplied.
  const email = input.email.trim()
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address."
  } else if (email.length > 150) {
    errors.email = "Email must be under 150 characters."
  }

  if (input.address.trim().length > 300) {
    errors.address = "Address must be under 300 characters."
  }

  return errors
}

/** Normalises a phone number to `+91XXXXXXXXXX` for consistent storage. */
export function normalisePhone(phone: string) {
  const digits = phone.replace(/\D/g, "")
  const last10 = digits.slice(-10)
  return last10.length === 10 ? `+91${last10}` : phone.trim()
}
