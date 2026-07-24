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
  offer_amount: number | null
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

export type Dentition = "adult" | "pedo" | "mixed"
export type TreatmentPlanStatus = "draft" | "proposed" | "accepted" | "completed" | "cancelled"
export type TreatmentPlanItemStatus = "planned" | "in_progress" | "completed" | "cancelled"
export type TreatmentPriority = "primary" | "secondary"
export type WorkDoneStatus = "in_progress" | "completed"

export type TreatmentCatalogEntry = {
  id: string
  category: string
  name: string
  price: number
  code: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

/** Map of tooth surface -> selected finding keys, stored in the finding jsonb columns. */
export type SurfaceFindingMap = Record<string, string[]>

export type QuickFindings = {
  malocclusion?: "clinical" | "aesthetic" | "no"
  missing_tooth?: "clinical" | "aesthetic" | "no"
}

export type OralExamination = {
  id: string
  patient_id: string
  appointment_id: string | null
  dentition: Dentition
  quick_findings: QuickFindings | null
  chief_complaint: ChiefComplaintData | null
  notes: string | null
  examined_by: string
  exam_date: string
  created_at: string
}

export type OralExaminationFinding = {
  id: string
  examination_id: string
  tooth_number: string
  tooth_site_perio: SurfaceFindingMap | null
  soft_tissue: SurfaceFindingMap | null
  hard_tissue: SurfaceFindingMap | null
  notes: string | null
  sort_order: number
  created_at: string
}

export type OralExaminationWithFindings = OralExamination & {
  findings: OralExaminationFinding[]
}

export type TreatmentPlan = {
  id: string
  patient_id: string
  appointment_id: string | null
  oral_examination_id: string | null
  status: TreatmentPlanStatus
  notes: string | null
  created_by: string
  created_at: string
}

export type TreatmentPlanItem = {
  id: string
  plan_id: string
  treatment_catalog_id: string | null
  tooth_number: string | null
  surface: string | null
  finding_key: string | null
  treatment_name: string
  price: number
  priority: TreatmentPriority
  is_part_of_bridge: boolean
  status: TreatmentPlanItemStatus
  sort_order: number
  created_at: string
}

export type TreatmentPlanWithItems = TreatmentPlan & {
  items: TreatmentPlanItem[]
}

export type PatientFileCategory = "oral_image" | "xray" | "profile" | "document"

export type PatientFile = {
  id: string
  patient_id: string
  category: PatientFileCategory
  file_path: string
  file_name: string
  mime_type: string | null
  label: string | null
  uploaded_by: string
  created_at: string
}

export type WorkDone = {
  id: string
  patient_id: string
  plan_item_id: string | null
  appointment_id: string | null
  invoice_id: string | null
  treatment_name: string
  tooth_number: string | null
  treating_dentist_id: string
  price: number
  stage: string | null
  status: WorkDoneStatus
  work_date: string
  notes: string | null
  sort_order: number
  created_at: string
}
