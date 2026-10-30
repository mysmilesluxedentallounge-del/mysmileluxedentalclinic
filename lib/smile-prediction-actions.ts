"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth"
import { isSmilePredictionStatus } from "@/lib/smile-predictions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const LIST_PATH = "/dashboard/smile-predictions"

/** Updates a Smile Predictor lead's follow-up status from the dashboard table. */
export async function updateSmilePredictionStatusAction(formData: FormData) {
  await requireAuth()

  const id = String(formData.get("id") ?? "").trim()
  const status = String(formData.get("status") ?? "").trim()

  if (!id || !isSmilePredictionStatus(status)) {
    return
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from("smile_predictions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("updateSmilePredictionStatusAction:", error.message)
    return
  }

  revalidatePath(LIST_PATH)
}
