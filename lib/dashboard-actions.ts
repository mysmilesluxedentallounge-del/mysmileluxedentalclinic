"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin, requireAuth } from "@/lib/auth"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function createPatientAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const full_name = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim() || null
  const email = String(formData.get("email") ?? "").trim() || null
  const dob = String(formData.get("dob") ?? "").trim() || null
  const address = String(formData.get("address") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!full_name) return

  await supabase.from("patients").insert({
    full_name,
    phone,
    email,
    dob,
    address,
    notes,
    created_by: profile.id,
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/patients")
}

export async function updatePatientNotesAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "")
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!patientId) return

  await supabase.from("patients").update({ notes }).eq("id", patientId)

  revalidatePath("/dashboard/patients")
  revalidatePath(`/dashboard/patients/${patientId}`)
}

export async function createAppointmentAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patient_id = String(formData.get("patient_id") ?? "")
  const doctor_id = String(formData.get("doctor_id") ?? "")
  const appointment_date = String(formData.get("appointment_date") ?? "")
  const appointment_time = String(formData.get("appointment_time") ?? "")
  const status = String(formData.get("status") ?? "scheduled")
  const treatment = String(formData.get("treatment") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) return

  await supabase.from("appointments").insert({
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    status,
    treatment,
    notes,
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard/patients")
}

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const appointmentId = String(formData.get("appointment_id") ?? "")
  const status = String(formData.get("status") ?? "scheduled")

  if (!appointmentId) return

  await supabase.from("appointments").update({ status }).eq("id", appointmentId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/appointments")
}

export async function createInvoiceAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patient_id = String(formData.get("patient_id") ?? "")
  const appointment_id = String(formData.get("appointment_id") ?? "").trim() || null
  const amount = Number(formData.get("amount") ?? "0")
  const status = String(formData.get("status") ?? "unpaid")
  const payment_method = String(formData.get("payment_method") ?? "").trim() || null
  const invoice_date = String(formData.get("invoice_date") ?? "")
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!patient_id || !invoice_date || Number.isNaN(amount)) return

  await supabase.from("invoices").insert({
    patient_id,
    appointment_id,
    amount,
    status,
    payment_method,
    invoice_date,
    notes,
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/billing")
  revalidatePath("/dashboard/patients")
}

export async function createStaffUserAction(formData: FormData) {
  await requireAdmin()
  const adminSupabase = createSupabaseAdminClient()

  const email = String(formData.get("email") ?? "").trim()
  const full_name = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "doctor")
  const password = String(formData.get("password") ?? "").trim()

  if (!email || !full_name || !password) return

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
    },
  })

  if (error || !data.user) return

  await adminSupabase.from("profiles").upsert({
    id: data.user.id,
    full_name,
    role,
  })

  revalidatePath("/dashboard/users")
}
