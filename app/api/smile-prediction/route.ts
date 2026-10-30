import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import {
  normalisePhone,
  validateSmilePrediction,
  type SmilePredictionInput,
} from "@/lib/smile-predictions"

/**
 * Stores a Smile Predictor lead.
 *
 * The public form is anonymous, so the insert runs with the service-role key
 * rather than opening an anonymous INSERT policy on the table. Only the form
 * fields are stored — the captured photo never leaves the visitor's device.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }

  const input: SmilePredictionInput = {
    fullName: String(body.fullName ?? ""),
    phone: String(body.phone ?? ""),
    email: String(body.email ?? ""),
    address: String(body.address ?? ""),
  }

  // The browser validates too, but that is only a convenience — re-check here.
  const errors = validateSmilePrediction(input)
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please check the form.", errors }, { status: 400 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("smile-prediction: Supabase admin env vars missing — lead was NOT saved.")
    return NextResponse.json(
      { error: "This service is not configured right now. Please call the clinic." },
      { status: 503 }
    )
  }

  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from("smile_predictions")
      .insert({
        full_name: input.fullName.trim(),
        phone: normalisePhone(input.phone),
        email: input.email.trim() || null,
        address: input.address.trim() || null,
        status: "new",
        source: "smile_predictor",
      })
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(error?.message || "Could not save your details.")
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("smile-prediction insert error:", message)
    return NextResponse.json(
      { error: "We could not save your details. Please try again." },
      { status: 500 }
    )
  }
}
