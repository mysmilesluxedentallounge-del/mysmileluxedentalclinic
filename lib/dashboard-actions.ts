"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin, requireAuth } from "@/lib/auth"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createSupabaseServerClient } from "@/lib/supabase/server"

function stripLegacyUpiTxnLine(input: string | null) {
  if (!input) return null
  const cleaned = input
    .split("\n")
    .filter((line) => !/^UPI_TXN_ID\s*:/i.test(line.trim()))
    .join("\n")
    .trim()
  return cleaned || null
}

function attachLegacyUpiTxnLine(notes: string | null, paymentMethod: string | null, txnId: string | null) {
  if (paymentMethod !== "upi" || !txnId) return notes
  const base = stripLegacyUpiTxnLine(notes)
  return `${base ? `${base}\n` : ""}UPI_TXN_ID: ${txnId}`
}

type InvoiceFormItem = {
  treatment_name: string
  treatment_date: string | null
  cost: number
  sort_order: number
}

function parseInvoiceItemsFromFormData(formData: FormData) {
  const names = formData.getAll("item_treatment_name").map((value) => String(value ?? "").trim())
  const costs = formData.getAll("item_cost").map((value) => String(value ?? "").trim())
  const dates = formData.getAll("item_date").map((value) => String(value ?? "").trim() || null)

  const items: InvoiceFormItem[] = []

  for (let index = 0; index < Math.max(names.length, costs.length); index += 1) {
    const treatment_name = names[index] ?? ""
    const costRaw = costs[index] ?? ""

    if (!treatment_name && !costRaw) {
      continue
    }

    const cost = Number(costRaw)
    if (!treatment_name || Number.isNaN(cost) || cost <= 0) {
      return { items: [], hasInvalidItems: true }
    }

    items.push({
      treatment_name,
      treatment_date: dates[index] ?? null,
      cost,
      sort_order: items.length,
    })
  }

  return { items, hasInvalidItems: false }
}

export async function createPatientAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const full_name = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim() || null
  const email = String(formData.get("email") ?? "").trim() || null
  const gender = String(formData.get("gender") ?? "").trim() || null
  const dob = String(formData.get("dob") ?? "").trim() || null
  const address = String(formData.get("address") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!full_name) return

  await supabase.from("patients").insert({
    full_name,
    phone,
    email,
    gender,
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
  redirect(`/dashboard/patients/${patientId}?updated=notes`)
}

export async function updatePatientDetailsAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "")
  const full_name = String(formData.get("full_name") ?? "").trim()
  const phone = String(formData.get("phone") ?? "").trim() || null
  const email = String(formData.get("email") ?? "").trim() || null
  const gender = String(formData.get("gender") ?? "").trim() || null
  const dob = String(formData.get("dob") ?? "").trim() || null
  const address = String(formData.get("address") ?? "").trim() || null

  if (!patientId || !full_name) return

  await supabase
    .from("patients")
    .update({
      full_name,
      phone,
      email,
      gender,
      dob,
      address,
    })
    .eq("id", patientId)

  revalidatePath("/dashboard/patients")
  revalidatePath(`/dashboard/patients/${patientId}`)
  redirect(`/dashboard/patients/${patientId}?updated=details`)
}

export async function deletePatientAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "")
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()
  if (!patientId) return

  await supabase.from("patients").delete().eq("id", patientId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/patients")
  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard/billing")
  if (redirectTo) {
    redirect(redirectTo)
  }
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

export async function updateAppointmentDetailsAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const appointmentId = String(formData.get("appointment_id") ?? "")
  const patient_id = String(formData.get("patient_id") ?? "")
  const doctor_id = String(formData.get("doctor_id") ?? "")
  const appointment_date = String(formData.get("appointment_date") ?? "")
  const appointment_time = String(formData.get("appointment_time") ?? "")
  const status = String(formData.get("status") ?? "scheduled")
  const treatment = String(formData.get("treatment") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null

  if (!appointmentId || !patient_id || !doctor_id || !appointment_date || !appointment_time) return

  await supabase
    .from("appointments")
    .update({
      patient_id,
      doctor_id,
      appointment_date,
      appointment_time,
      status,
      treatment,
      notes,
    })
    .eq("id", appointmentId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/appointments")
  revalidatePath(`/dashboard/appointments/${appointmentId}`)
  redirect(`/dashboard/appointments/${appointmentId}?updated=1`)
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const appointmentId = String(formData.get("appointment_id") ?? "")
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()
  if (!appointmentId) return

  await supabase.from("appointments").delete().eq("id", appointmentId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/appointments")
  revalidatePath("/dashboard/patients")
  revalidatePath("/dashboard/billing")
  if (redirectTo) {
    redirect(redirectTo)
  }
}

export async function createInvoiceAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patient_id = String(formData.get("patient_id") ?? "")
  const appointment_id = String(formData.get("appointment_id") ?? "").trim() || null
  const status = String(formData.get("status") ?? "unpaid")
  const rawPaymentMethod = String(formData.get("payment_method") ?? "").trim().toLowerCase()
  const payment_method =
    rawPaymentMethod === "upi" || rawPaymentMethod === "cash" || rawPaymentMethod === "bank_transfer"
      ? rawPaymentMethod
      : null
  const upi_transaction_id = String(formData.get("upi_transaction_id") ?? "").trim() || null
  const invoice_date = String(formData.get("invoice_date") ?? "")
  const notes = stripLegacyUpiTxnLine(String(formData.get("notes") ?? "").trim() || null)
  const include_treatment_date = formData.get("include_treatment_date") === "on"
  const { items, hasInvalidItems } = parseInvoiceItemsFromFormData(formData)
  const amount = items.reduce((sum, item) => sum + item.cost, 0)

  if (!patient_id || !invoice_date || hasInvalidItems || items.length === 0 || Number.isNaN(amount) || amount <= 0) {
    redirect("/dashboard/billing/new?error=invalid_input")
  }
  if (payment_method === "upi" && !upi_transaction_id) {
    redirect("/dashboard/billing/new?error=upi_txn_required")
  }

  const invoicePayload = {
    patient_id,
    appointment_id,
    amount,
    status,
    payment_method,
    upi_transaction_id: payment_method === "upi" ? upi_transaction_id : null,
    include_treatment_date,
    invoice_date,
    notes,
  }

  let invoiceId: string | null = null
  const { data: insertedInvoice, error: insertError } = await supabase.from("invoices").insert(invoicePayload).select("id").single()
  let error = insertError
  invoiceId = insertedInvoice?.id ?? null

  if (error?.message?.includes("upi_transaction_id")) {
    const fallbackPayload = {
      patient_id,
      appointment_id,
      amount,
      status,
      payment_method,
      invoice_date,
      notes: attachLegacyUpiTxnLine(notes, payment_method, upi_transaction_id),
    }
    const fallbackResult = await supabase.from("invoices").insert(fallbackPayload).select("id").single()
    invoiceId = fallbackResult.data?.id ?? null
    error = fallbackResult.error
  }

  if (error) {
    redirect(`/dashboard/billing/new?error=${encodeURIComponent(error.message)}`)
  }
  if (!invoiceId) {
    redirect("/dashboard/billing/new?error=invoice_create_failed")
  }

  const itemPayload = items.map((item) => ({ ...item, invoice_id: invoiceId }))
  const { error: itemError } = await supabase.from("invoice_items").insert(itemPayload)
  if (itemError) {
    await supabase.from("invoices").delete().eq("id", invoiceId)
    redirect(`/dashboard/billing/new?error=${encodeURIComponent(itemError.message)}`)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/billing")
  revalidatePath("/dashboard/patients")
  redirect("/dashboard/billing")
}

export async function updateInvoiceAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const invoiceId = String(formData.get("invoice_id") ?? "")
  const patient_id = String(formData.get("patient_id") ?? "")
  const appointment_id = String(formData.get("appointment_id") ?? "").trim() || null
  const status = String(formData.get("status") ?? "unpaid")
  const rawPaymentMethod = String(formData.get("payment_method") ?? "").trim().toLowerCase()
  const payment_method =
    rawPaymentMethod === "upi" || rawPaymentMethod === "cash" || rawPaymentMethod === "bank_transfer"
      ? rawPaymentMethod
      : null
  const upi_transaction_id = String(formData.get("upi_transaction_id") ?? "").trim() || null
  const invoice_date = String(formData.get("invoice_date") ?? "")
  const notes = stripLegacyUpiTxnLine(String(formData.get("notes") ?? "").trim() || null)
  const include_treatment_date = formData.get("include_treatment_date") === "on"
  const { items, hasInvalidItems } = parseInvoiceItemsFromFormData(formData)
  const amount = items.reduce((sum, item) => sum + item.cost, 0)

  if (!invoiceId || !patient_id || !invoice_date || hasInvalidItems || items.length === 0 || Number.isNaN(amount)) {
    redirect(`/dashboard/billing/${invoiceId}?error=invalid_input`)
  }
  if (payment_method === "upi" && !upi_transaction_id) return

  const invoiceUpdatePayload = {
    patient_id,
    appointment_id,
    amount,
    status,
    payment_method,
    upi_transaction_id: payment_method === "upi" ? upi_transaction_id : null,
    include_treatment_date,
    invoice_date,
    notes,
  }

  let { error } = await supabase
    .from("invoices")
    .update(invoiceUpdatePayload)
    .eq("id", invoiceId)

  if (error?.message?.includes("upi_transaction_id")) {
    const fallbackUpdatePayload = {
      patient_id,
      appointment_id,
      amount,
      status,
      payment_method,
      invoice_date,
      notes: attachLegacyUpiTxnLine(notes, payment_method, upi_transaction_id),
    }
    const fallbackResult = await supabase.from("invoices").update(fallbackUpdatePayload).eq("id", invoiceId)
    error = fallbackResult.error
  }

  if (error) {
    redirect(`/dashboard/billing/${invoiceId}?error=${encodeURIComponent(error.message)}`)
  }

  const { error: deleteItemsError } = await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId)
  if (deleteItemsError) {
    redirect(`/dashboard/billing/${invoiceId}?error=${encodeURIComponent(deleteItemsError.message)}`)
  }
  const itemPayload = items.map((item) => ({ ...item, invoice_id: invoiceId }))
  const { error: itemError } = await supabase.from("invoice_items").insert(itemPayload)
  if (itemError) {
    redirect(`/dashboard/billing/${invoiceId}?error=${encodeURIComponent(itemError.message)}`)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/billing")
  revalidatePath(`/dashboard/billing/${invoiceId}`)
  redirect(`/dashboard/billing/${invoiceId}?updated=1`)
}

export async function deleteInvoiceAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const invoiceId = String(formData.get("invoice_id") ?? "")
  const redirectTo = String(formData.get("redirect_to") ?? "").trim()
  if (!invoiceId) return

  await supabase.from("invoices").delete().eq("id", invoiceId)

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/billing")
  revalidatePath("/dashboard/patients")
  if (redirectTo) {
    redirect(redirectTo)
  }
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

export async function updateStaffUserAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()
  const adminSupabase = createSupabaseAdminClient()

  const userId = String(formData.get("user_id") ?? "")
  const full_name = String(formData.get("full_name") ?? "").trim()
  const role = String(formData.get("role") ?? "doctor")
  const password = String(formData.get("password") ?? "").trim()

  if (!userId || !full_name || !["admin", "doctor"].includes(role)) return
  if (password && password.length < 8) return

  await supabase.from("profiles").update({ full_name, role }).eq("id", userId)

  if (password) {
    await adminSupabase.auth.admin.updateUserById(userId, { password })
  }

  revalidatePath("/dashboard/users")
  revalidatePath("/dashboard/doctors")
  revalidatePath(`/dashboard/users/${userId}`)
  redirect(`/dashboard/users/${userId}?updated=1${password ? "&pwd=1" : ""}`)
}

export async function updateDoctorAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const doctorId = String(formData.get("doctor_id") ?? "")
  const full_name = String(formData.get("full_name") ?? "").trim()
  const clearSignature = String(formData.get("clear_signature") ?? "") === "on"
  const signatureFile = formData.get("signature_file")

  if (!doctorId || !full_name) return

  let doctor_signature: string | null | undefined

  if (clearSignature) {
    doctor_signature = null
  } else if (signatureFile instanceof File && signatureFile.size > 0) {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (allowedTypes.includes(signatureFile.type) && signatureFile.size <= 2 * 1024 * 1024) {
      const bytes = await signatureFile.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      doctor_signature = `data:${signatureFile.type};base64,${base64}`
    }
  }

  await supabase
    .from("profiles")
    .update({ full_name, role: "doctor", ...(doctor_signature !== undefined ? { doctor_signature } : {}) })
    .eq("id", doctorId)

  revalidatePath("/dashboard/users")
  revalidatePath("/dashboard/doctors")
  revalidatePath(`/dashboard/doctors/${doctorId}`)
  redirect(`/dashboard/doctors/${doctorId}?updated=1`)
}
