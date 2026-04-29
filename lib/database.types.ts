import type { ChiefComplaintData } from "./chief-complaint"
import type { MedicalHistoryData } from "./patient-clinical"

export type UserRole = "admin" | "doctor"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled"
export type InvoiceStatus = "paid" | "unpaid" | "partial"

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  doctor_signature: string | null
  created_at: string
}

export type Patient = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  gender: "male" | "female" | "other" | null
  dob: string | null
  address: string | null
  patient_notes: string | null
  medical_history: MedicalHistoryData | null
  dental_visit: string | null
  medication: string | null
  allergies: string | null
  created_by: string
  created_at: string
}

export type Appointment = {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  status: AppointmentStatus
  treatment: string | null
  chief_complaint: ChiefComplaintData | null
  notes: string | null
  created_at: string
}

export type Invoice = {
  id: string
  patient_id: string
  appointment_id: string | null
  amount: number
  status: InvoiceStatus
  payment_method: "upi" | "cash" | "bank_transfer" | null
  upi_transaction_id: string | null
  include_treatment_date: boolean
  invoice_date: string
  notes: string | null
  created_at: string
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  treatment_name: string
  treatment_date: string | null
  cost: number
  sort_order: number
  created_at: string
}

export type InvoiceWithItems = Invoice & {
  items: InvoiceItem[]
}

export type ClinicMonthlyBudget = {
  id: string
  year: number
  month: number
  allocated_amount: number
  notes: string | null
  created_at: string
}

export type ClinicExpense = {
  id: string
  expense_date: string
  amount: number
  category: string
  description: string | null
  created_by: string
  created_at: string
}
