export type UserRole = "admin" | "doctor"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled"
export type InvoiceStatus = "paid" | "unpaid" | "partial"

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  created_at: string
}

export type Patient = {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  dob: string | null
  address: string | null
  notes: string | null
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
  notes: string | null
  created_at: string
}

export type Invoice = {
  id: string
  patient_id: string
  appointment_id: string | null
  amount: number
  status: InvoiceStatus
  payment_method: string | null
  invoice_date: string
  notes: string | null
  created_at: string
}
