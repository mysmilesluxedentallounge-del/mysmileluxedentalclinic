"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin, requireAuth } from "@/lib/auth"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { isValidTreatmentCategory } from "@/lib/treatment-catalog"
import { parseChiefComplaintFormJson } from "@/lib/chief-complaint"
import {
  dentitionOrDefault,
  parseExamFindingsFromJson,
  parseQuickFindingsFromFormData,
  EXAM_NOTES_MAX,
} from "@/lib/oral-examination"
import {
  parsePlanItemsFromFormData,
  planStatusOrDefault,
} from "@/lib/treatment-plan"
import { workDoneStatusOrDefault } from "@/lib/work-done"
import { isValidFileCategory, PATIENT_FILE_MAX_BYTES, PATIENT_FILES_BUCKET } from "@/lib/patient-files"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

const TREATMENTS_PATH = "/dashboard/treatments"

function patientOralExamsPath(patientId: string) {
  return `/dashboard/patients/${patientId}/oral-exams`
}

function patientTreatmentPlanPath(patientId: string) {
  return `/dashboard/patients/${patientId}/treatment-plan`
}

function patientWorkDonePath(patientId: string) {
  return `/dashboard/patients/${patientId}/work-done`
}

function patientFilesPath(patientId: string) {
  return `/dashboard/patients/${patientId}/files`
}

function patientHubPath(patientId: string) {
  return `/dashboard/patients/${patientId}`
}

function optionalId(formData: FormData, field: string) {
  const value = String(formData.get(field) ?? "").trim()
  return value || null
}

/**
 * Lets inline forms (e.g. on the patient page) stay put instead of jumping to the
 * module page. Only internal paths are honoured.
 */
function redirectTarget(formData: FormData, fallback: string) {
  const raw = String(formData.get("redirect_to") ?? "").trim()
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw
  return fallback
}

// ---------------------------------------------------------------------------
// Phase 1 — Treatment catalog (admin-managed priced treatments)
// ---------------------------------------------------------------------------

function parseCatalogFields(formData: FormData) {
  const category = String(formData.get("category") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const code = String(formData.get("code") ?? "").trim() || null
  const priceRaw = String(formData.get("price") ?? "").trim()
  const price = Number(priceRaw)
  const is_active = formData.get("is_active") === "on"
  const sortRaw = String(formData.get("sort_order") ?? "").trim()
  const sort_order = Number.isNaN(Number(sortRaw)) ? 0 : Number(sortRaw)

  if (!category || !isValidTreatmentCategory(category)) return null
  if (!name) return null
  if (priceRaw === "" || Number.isNaN(price) || price < 0) return null

  return { category, name, code, price, is_active, sort_order }
}

export async function createTreatmentCatalogAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const fields = parseCatalogFields(formData)
  if (!fields) {
    redirect(`${TREATMENTS_PATH}/new?error=invalid_input`)
  }

  const { error } = await supabase.from("treatment_catalog").insert(fields)
  if (error) {
    redirect(`${TREATMENTS_PATH}/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(TREATMENTS_PATH)
  redirect(`${TREATMENTS_PATH}?added=1`)
}

export async function updateTreatmentCatalogAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const id = String(formData.get("id") ?? "").trim()
  if (!id) return

  const fields = parseCatalogFields(formData)
  if (!fields) {
    redirect(`${TREATMENTS_PATH}/${id}?error=invalid_input`)
  }

  const { error } = await supabase.from("treatment_catalog").update(fields).eq("id", id)
  if (error) {
    redirect(`${TREATMENTS_PATH}/${id}?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath(TREATMENTS_PATH)
  revalidatePath(`${TREATMENTS_PATH}/${id}`)
  redirect(`${TREATMENTS_PATH}?updated=1`)
}

export async function deleteTreatmentCatalogAction(formData: FormData) {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const id = String(formData.get("id") ?? "").trim()
  if (!id) return

  await supabase.from("treatment_catalog").delete().eq("id", id)

  revalidatePath(TREATMENTS_PATH)
  redirect(`${TREATMENTS_PATH}?deleted=1`)
}

// ---------------------------------------------------------------------------
// Phase 2 — Oral examination
// ---------------------------------------------------------------------------

async function insertExamFindings(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  examinationId: string,
  formData: FormData
) {
  const findings = parseExamFindingsFromJson(String(formData.get("findings_json") ?? ""))
  if (findings.length === 0) return null
  const payload = findings.map((finding) => ({
    examination_id: examinationId,
    tooth_number: finding.tooth_number,
    tooth_site_perio: finding.tooth_site_perio,
    soft_tissue: finding.soft_tissue,
    hard_tissue: finding.hard_tissue,
    notes: finding.notes,
    sort_order: finding.sort_order,
  }))
  const { error } = await supabase.from("oral_examination_findings").insert(payload)
  return error
}

export async function createOralExaminationAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  if (!patientId) return

  const dentition = dentitionOrDefault(String(formData.get("dentition") ?? ""))
  const quick_findings = parseQuickFindingsFromFormData(formData)
  const chief_complaint = parseChiefComplaintFormJson(String(formData.get("chief_complaint") ?? "") || null)
  const exam_date = String(formData.get("exam_date") ?? "").trim() || undefined
  const appointment_id = optionalId(formData, "appointment_id")
  const notes = String(formData.get("notes") ?? "").trim().slice(0, EXAM_NOTES_MAX) || null

  const { data: inserted, error } = await supabase
    .from("oral_examinations")
    .insert({
      patient_id: patientId,
      appointment_id,
      dentition,
      quick_findings,
      chief_complaint,
      notes,
      examined_by: profile.id,
      ...(exam_date ? { exam_date } : {}),
    })
    .select("id")
    .single()

  if (error || !inserted?.id) {
    redirect(`${patientOralExamsPath(patientId)}/new?error=save_failed`)
  }

  const findingsError = await insertExamFindings(supabase, inserted.id, formData)
  if (findingsError) {
    await supabase.from("oral_examinations").delete().eq("id", inserted.id)
    redirect(`${patientOralExamsPath(patientId)}/new?error=${encodeURIComponent(findingsError.message)}`)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientOralExamsPath(patientId))
  redirect(redirectTarget(formData, `${patientOralExamsPath(patientId)}?added=1`))
}

export async function updateOralExaminationAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const examId = String(formData.get("examination_id") ?? "").trim()
  if (!patientId || !examId) return

  const dentition = dentitionOrDefault(String(formData.get("dentition") ?? ""))
  const quick_findings = parseQuickFindingsFromFormData(formData)
  const chief_complaint = parseChiefComplaintFormJson(String(formData.get("chief_complaint") ?? "") || null)
  const exam_date = String(formData.get("exam_date") ?? "").trim() || undefined
  const appointment_id = optionalId(formData, "appointment_id")
  const notes = String(formData.get("notes") ?? "").trim().slice(0, EXAM_NOTES_MAX) || null

  const { error } = await supabase
    .from("oral_examinations")
    .update({
      dentition,
      quick_findings,
      chief_complaint,
      notes,
      appointment_id,
      ...(exam_date ? { exam_date } : {}),
    })
    .eq("id", examId)

  if (error) {
    redirect(`${patientOralExamsPath(patientId)}/${examId}?error=${encodeURIComponent(error.message)}`)
  }

  // Replace findings wholesale (same strategy as invoice items).
  await supabase.from("oral_examination_findings").delete().eq("examination_id", examId)
  const findingsError = await insertExamFindings(supabase, examId, formData)
  if (findingsError) {
    redirect(`${patientOralExamsPath(patientId)}/${examId}?error=${encodeURIComponent(findingsError.message)}`)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientOralExamsPath(patientId))
  revalidatePath(`${patientOralExamsPath(patientId)}/${examId}`)
  redirect(`${patientOralExamsPath(patientId)}?updated=1`)
}

export async function deleteOralExaminationAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const examId = String(formData.get("examination_id") ?? "").trim()
  if (!patientId || !examId) return

  await supabase.from("oral_examinations").delete().eq("id", examId)

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientOralExamsPath(patientId))
  redirect(`${patientOralExamsPath(patientId)}?deleted=1`)
}

// ---------------------------------------------------------------------------
// Phase 4 — Treatment plan
// ---------------------------------------------------------------------------

async function insertPlanItems(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  planId: string,
  formData: FormData
) {
  const { items, hasInvalidItems } = parsePlanItemsFromFormData(formData)
  if (hasInvalidItems) return { error: { message: "invalid_input" }, count: 0 }
  if (items.length === 0) return { error: null, count: 0 }
  const payload = items.map((item) => ({ ...item, plan_id: planId }))
  const { error } = await supabase.from("treatment_plan_items").insert(payload)
  return { error, count: items.length }
}

export async function createTreatmentPlanAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  if (!patientId) return

  const status = planStatusOrDefault(String(formData.get("status") ?? ""))
  const notes = String(formData.get("notes") ?? "").trim() || null
  const appointment_id = optionalId(formData, "appointment_id")
  const oral_examination_id = optionalId(formData, "oral_examination_id")

  const parsed = parsePlanItemsFromFormData(formData)
  if (parsed.hasInvalidItems || parsed.items.length === 0) {
    redirect(`${patientTreatmentPlanPath(patientId)}/new?error=invalid_input`)
  }

  const { data: inserted, error } = await supabase
    .from("treatment_plans")
    .insert({
      patient_id: patientId,
      appointment_id,
      oral_examination_id,
      status,
      notes,
      created_by: profile.id,
    })
    .select("id")
    .single()

  if (error || !inserted?.id) {
    redirect(`${patientTreatmentPlanPath(patientId)}/new?error=save_failed`)
  }

  const itemsResult = await insertPlanItems(supabase, inserted.id, formData)
  if (itemsResult.error) {
    await supabase.from("treatment_plans").delete().eq("id", inserted.id)
    redirect(`${patientTreatmentPlanPath(patientId)}/new?error=${encodeURIComponent(itemsResult.error.message)}`)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientTreatmentPlanPath(patientId))
  redirect(redirectTarget(formData, `${patientTreatmentPlanPath(patientId)}?added=1`))
}

export async function updateTreatmentPlanAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const planId = String(formData.get("plan_id") ?? "").trim()
  if (!patientId || !planId) return

  const status = planStatusOrDefault(String(formData.get("status") ?? ""))
  const notes = String(formData.get("notes") ?? "").trim() || null
  const appointment_id = optionalId(formData, "appointment_id")

  const parsed = parsePlanItemsFromFormData(formData)
  if (parsed.hasInvalidItems || parsed.items.length === 0) {
    redirect(`${patientTreatmentPlanPath(patientId)}/${planId}?error=invalid_input`)
  }

  const { error } = await supabase
    .from("treatment_plans")
    .update({ status, notes, appointment_id })
    .eq("id", planId)

  if (error) {
    redirect(`${patientTreatmentPlanPath(patientId)}/${planId}?error=${encodeURIComponent(error.message)}`)
  }

  await supabase.from("treatment_plan_items").delete().eq("plan_id", planId)
  const itemsResult = await insertPlanItems(supabase, planId, formData)
  if (itemsResult.error) {
    redirect(`${patientTreatmentPlanPath(patientId)}/${planId}?error=${encodeURIComponent(itemsResult.error.message)}`)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientTreatmentPlanPath(patientId))
  revalidatePath(`${patientTreatmentPlanPath(patientId)}/${planId}`)
  redirect(`${patientTreatmentPlanPath(patientId)}?updated=1`)
}

export async function deleteTreatmentPlanAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const planId = String(formData.get("plan_id") ?? "").trim()
  if (!patientId || !planId) return

  await supabase.from("treatment_plans").delete().eq("id", planId)

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientTreatmentPlanPath(patientId))
  redirect(`${patientTreatmentPlanPath(patientId)}?deleted=1`)
}

// ---------------------------------------------------------------------------
// Phase 5 — Work done
// ---------------------------------------------------------------------------

function parseWorkDoneFields(formData: FormData) {
  const treatment_name = String(formData.get("treatment_name") ?? "").trim()
  const treating_dentist_id = String(formData.get("treating_dentist_id") ?? "").trim()
  const tooth_number = String(formData.get("tooth_number") ?? "").trim() || null
  const stage = String(formData.get("stage") ?? "").trim() || null
  const notes = String(formData.get("notes") ?? "").trim() || null
  const status = workDoneStatusOrDefault(String(formData.get("status") ?? ""))
  const work_date = String(formData.get("work_date") ?? "").trim() || undefined
  const priceRaw = String(formData.get("price") ?? "").trim()
  const price = priceRaw === "" ? 0 : Number(priceRaw)

  if (!treatment_name || !treating_dentist_id) return null
  if (Number.isNaN(price) || price < 0) return null

  return { treatment_name, treating_dentist_id, tooth_number, stage, notes, status, work_date, price }
}

export async function createWorkDoneAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  if (!patientId) return

  const fields = parseWorkDoneFields(formData)
  if (!fields) {
    redirect(`${patientWorkDonePath(patientId)}?error=invalid_input`)
  }

  const plan_item_id = optionalId(formData, "plan_item_id")
  const appointment_id = optionalId(formData, "appointment_id")

  const { work_date, ...rest } = fields
  await supabase.from("work_done").insert({
    patient_id: patientId,
    plan_item_id,
    appointment_id,
    ...rest,
    ...(work_date ? { work_date } : {}),
  })

  // Keep the source plan item's status in step with the work started/completed.
  if (plan_item_id) {
    await supabase
      .from("treatment_plan_items")
      .update({ status: fields.status === "completed" ? "completed" : "in_progress" })
      .eq("id", plan_item_id)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(redirectTarget(formData, `${patientWorkDonePath(patientId)}?added=1`))
}

export async function createWorkDoneFromPlanItemAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const planItemId = String(formData.get("plan_item_id") ?? "").trim()
  if (!patientId || !planItemId) return

  const { data: item } = await supabase
    .from("treatment_plan_items")
    .select("id, treatment_name, tooth_number, price")
    .eq("id", planItemId)
    .maybeSingle()

  if (!item) {
    redirect(`${patientWorkDonePath(patientId)}?error=invalid_input`)
  }

  await supabase.from("work_done").insert({
    patient_id: patientId,
    plan_item_id: planItemId,
    treatment_name: item.treatment_name,
    tooth_number: item.tooth_number,
    price: item.price,
    treating_dentist_id: profile.id,
    status: "in_progress",
  })

  await supabase.from("treatment_plan_items").update({ status: "in_progress" }).eq("id", planItemId)

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(`${patientWorkDonePath(patientId)}?added=1`)
}

export async function updateWorkDoneAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const workDoneId = String(formData.get("work_done_id") ?? "").trim()
  if (!patientId || !workDoneId) return

  const fields = parseWorkDoneFields(formData)
  if (!fields) {
    redirect(`${patientWorkDonePath(patientId)}?error=invalid_input`)
  }

  const { work_date, ...rest } = fields
  await supabase
    .from("work_done")
    .update({ ...rest, ...(work_date ? { work_date } : {}) })
    .eq("id", workDoneId)

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(`${patientWorkDonePath(patientId)}?updated=1`)
}

export async function updateWorkDoneStatusAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const workDoneId = String(formData.get("work_done_id") ?? "").trim()
  if (!patientId || !workDoneId) return

  const status = workDoneStatusOrDefault(String(formData.get("status") ?? ""))

  const { data: updated } = await supabase
    .from("work_done")
    .update({ status })
    .eq("id", workDoneId)
    .select("plan_item_id")
    .maybeSingle()

  // Reflect completion back onto the source plan item.
  if (updated?.plan_item_id) {
    await supabase
      .from("treatment_plan_items")
      .update({ status: status === "completed" ? "completed" : "in_progress" })
      .eq("id", updated.plan_item_id)
  }

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(`${patientWorkDonePath(patientId)}?updated=1`)
}

export async function retreatWorkDoneAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const workDoneId = String(formData.get("work_done_id") ?? "").trim()
  if (!patientId || !workDoneId) return

  const { data: source } = await supabase
    .from("work_done")
    .select("plan_item_id, appointment_id, treatment_name, tooth_number, price")
    .eq("id", workDoneId)
    .maybeSingle()

  if (!source) return

  await supabase.from("work_done").insert({
    patient_id: patientId,
    plan_item_id: source.plan_item_id,
    appointment_id: source.appointment_id,
    treatment_name: source.treatment_name,
    tooth_number: source.tooth_number,
    price: source.price,
    treating_dentist_id: profile.id,
    status: "in_progress",
    stage: "Re-treatment",
  })

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(`${patientWorkDonePath(patientId)}?added=1`)
}

export async function deleteWorkDoneAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const workDoneId = String(formData.get("work_done_id") ?? "").trim()
  if (!patientId || !workDoneId) return

  await supabase.from("work_done").delete().eq("id", workDoneId)

  revalidatePath(patientHubPath(patientId))
  revalidatePath(patientWorkDonePath(patientId))
  redirect(`${patientWorkDonePath(patientId)}?deleted=1`)
}

// ---------------------------------------------------------------------------
// Files module (patient documents/images in Supabase Storage)
// ---------------------------------------------------------------------------

export async function uploadPatientFileAction(formData: FormData) {
  const profile = await requireAuth()
  const supabase = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  const label = String(formData.get("label") ?? "").trim() || null
  const file = formData.get("file")

  if (!patientId || !isValidFileCategory(category)) return

  const filesUrl = (params: string) => `${patientFilesPath(patientId)}?tab=${category}&${params}`

  if (!(file instanceof File) || file.size === 0) {
    redirect(filesUrl("error=no_file"))
  }
  if (file.size > PATIENT_FILE_MAX_BYTES) {
    redirect(filesUrl("error=too_large"))
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "file"
  const path = `${patientId}/${category}/${crypto.randomUUID()}-${safeName}`

  const { error: uploadError } = await admin.storage
    .from(PATIENT_FILES_BUCKET)
    .upload(path, bytes, { contentType: file.type || "application/octet-stream", upsert: false })
  if (uploadError) {
    redirect(filesUrl(`error=${encodeURIComponent(uploadError.message)}`))
  }

  const { error: insertError } = await supabase.from("patient_files").insert({
    patient_id: patientId,
    category,
    file_path: path,
    file_name: file.name,
    mime_type: file.type || null,
    label,
    uploaded_by: profile.id,
  })
  if (insertError) {
    await admin.storage.from(PATIENT_FILES_BUCKET).remove([path])
    redirect(filesUrl(`error=${encodeURIComponent(insertError.message)}`))
  }

  revalidatePath(patientFilesPath(patientId))
  revalidatePath(patientHubPath(patientId))
  redirect(redirectTarget(formData, filesUrl("added=1")))
}

export async function deletePatientFileAction(formData: FormData) {
  await requireAuth()
  const supabase = await createSupabaseServerClient()
  const admin = createSupabaseAdminClient()

  const patientId = String(formData.get("patient_id") ?? "").trim()
  const fileId = String(formData.get("file_id") ?? "").trim()
  const category = String(formData.get("category") ?? "").trim()
  if (!patientId || !fileId) return

  const { data: row } = await supabase.from("patient_files").select("file_path").eq("id", fileId).maybeSingle()
  if (row?.file_path) {
    await admin.storage.from(PATIENT_FILES_BUCKET).remove([row.file_path])
  }
  await supabase.from("patient_files").delete().eq("id", fileId)

  revalidatePath(patientFilesPath(patientId))
  redirect(`${patientFilesPath(patientId)}?tab=${category}&deleted=1`)
}
