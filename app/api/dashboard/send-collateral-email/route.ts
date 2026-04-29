import nodemailer from "nodemailer"
import { NextRequest, NextResponse } from "next/server"
import {
  buildCollateralEmailHtml,
  buildCollateralEmailText,
} from "@/lib/collateral-email-template"
import { getEmailLogoAttachment } from "@/lib/email-branding"
import { INFORMATION_COLLATERALS } from "@/lib/information-collaterals"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const COLLATERAL_BY_ID = new Map(INFORMATION_COLLATERALS.map((c) => [c.id, c]))

const MAX_PATIENT_NAME = 200
const MAX_MESSAGE = 768
const MAX_IDS = 30

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const {
    patientName: rawName,
    recipientEmail: rawEmail,
    message: rawMessage,
    collateralIds: rawIds,
  } = body as {
    patientName?: unknown
    recipientEmail?: unknown
    message?: unknown
    collateralIds?: unknown
  }

  const patientName =
    typeof rawName === "string" ? rawName.trim().slice(0, MAX_PATIENT_NAME) : ""
  const recipientEmail =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase().slice(0, 320) : ""
  const message =
    typeof rawMessage === "string" ? rawMessage.slice(0, MAX_MESSAGE) : ""
  const collateralIds = Array.isArray(rawIds)
    ? [...new Set(rawIds.filter((id): id is string => typeof id === "string"))].slice(0, MAX_IDS)
    : []

  if (!patientName) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 })
  }
  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 })
  }
  if (collateralIds.length === 0) {
    return NextResponse.json({ error: "Select at least one document" }, { status: 400 })
  }

  const rows = collateralIds
    .map((id) => COLLATERAL_BY_ID.get(id))
    .filter((row): row is NonNullable<typeof row> => Boolean(row))

  if (rows.length !== collateralIds.length) {
    return NextResponse.json({ error: "One or more invalid document ids" }, { status: 400 })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_USER or SMTP_PASS not set for collateral email.")
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const subject =
    rows.length === 1
      ? `Information: ${rows[0].documentName} — MySmile Lux Dental Lounge`
      : `Information documents (${rows.length}) — MySmile Lux Dental Lounge`

  const { logoExists, attachments } = getEmailLogoAttachment()

  const html = buildCollateralEmailHtml(logoExists, patientName, message, rows)
  const text = buildCollateralEmailText(patientName, message, rows)

  try {
    await transporter.sendMail({
      from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject,
      text,
      html,
      replyTo: process.env.SMTP_USER,
      attachments,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("Collateral email error:", msg)
    return NextResponse.json({ error: `Could not send email: ${msg}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
