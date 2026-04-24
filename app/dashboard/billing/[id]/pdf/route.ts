import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type InvoicePayload = {
  id: string
  amount: number | string
  status: "paid" | "unpaid" | "partial"
  invoice_date: string
  payment_method: string | null
  upi_transaction_id: string | null
  include_treatment_date: boolean | null
  notes: string | null
}

type InvoiceItemPayload = {
  treatment_name: string
  treatment_date: string | null
  cost: number | string
  sort_order: number
}

const DEFAULT_DOCTOR_QUALIFICATION = process.env.DEFAULT_DOCTOR_QUALIFICATION || "BDS, MDS"
const DEFAULT_DOCTOR_REGISTRATION = process.env.DEFAULT_DOCTOR_REGISTRATION || "A-13562"

function calculateAgeFromDob(dob: string | null) {
  if (!dob) return "N/A"
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return "N/A"
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1
  }
  return String(age)
}

function formatCurrency(value: number) {
  return `INR ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

function formatIndianPhone(value: string | null | undefined) {
  const raw = (value ?? "").trim()
  if (!raw) return "N/A"
  if (raw.startsWith("+91")) return raw
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 10) return `+91 ${digits}`
  return `+91 ${raw}`
}

function extractUpiTxnIdFromNotes(notes: string | null | undefined) {
  if (!notes) return null
  const match = notes.match(/UPI_TXN_ID\s*:\s*([^\r\n]+)/i)
  return match?.[1]?.trim() ?? null
}

async function drawDoctorSignature(
  pdfDoc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  signature: string | null | undefined,
  x: number,
  y: number
) {
  if (!signature) return false

  try {
    if (signature.startsWith("data:image/")) {
      const commaIndex = signature.indexOf(",")
      if (commaIndex === -1) return false
      const meta = signature.slice(0, commaIndex).toLowerCase()
      const base64 = signature.slice(commaIndex + 1)
      const bytes = Buffer.from(base64, "base64")
      const image = meta.includes("png") ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
      page.drawImage(image, { x, y, width: 110, height: 42 })
      return true
    }
  } catch {
    return false
  }

  return false
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    const { data: invoiceDataWithUpi, error: invoiceWithUpiError } = await supabase
      .from("invoices")
      .select("id, patient_id, appointment_id, amount, status, invoice_date, payment_method, upi_transaction_id, include_treatment_date, notes")
      .eq("id", id)
      .maybeSingle()

    let invoiceData = invoiceDataWithUpi
    if (invoiceWithUpiError?.message?.includes("upi_transaction_id")) {
      const { data: fallbackInvoiceData, error: fallbackInvoiceError } = await supabase
        .from("invoices")
        .select("id, patient_id, appointment_id, amount, status, invoice_date, payment_method, notes")
        .eq("id", id)
        .maybeSingle()
      if (fallbackInvoiceError || !fallbackInvoiceData) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
      }
      invoiceData = { ...fallbackInvoiceData, upi_transaction_id: null, include_treatment_date: true }
    }

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const invoice = invoiceData as InvoicePayload & { patient_id: string; appointment_id: string | null }

    const [{ data: patientData }, { data: appointmentData }, { data: invoiceItemsData }] = await Promise.all([
      supabase.from("patients").select("id, full_name, phone, dob, gender").eq("id", invoice.patient_id).maybeSingle(),
      invoice.appointment_id
        ? supabase
            .from("appointments")
            .select("treatment, doctor_id")
            .eq("id", invoice.appointment_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("invoice_items")
        .select("treatment_name, treatment_date, cost, sort_order")
        .eq("invoice_id", invoice.id)
        .order("sort_order"),
    ])
    const { data: doctorData } = appointmentData?.doctor_id
      ? await supabase
          .from("profiles")
          .select("full_name, doctor_signature")
          .eq("id", appointmentData.doctor_id)
          .maybeSingle()
      : { data: null }

    const parsedInvoiceItems = (invoiceItemsData ?? []) as InvoiceItemPayload[]
    const treatmentRows =
      parsedInvoiceItems.length > 0
        ? parsedInvoiceItems.map((item) => ({
            treatment_name: item.treatment_name,
            treatment_date: item.treatment_date ?? null,
            cost: Number.isNaN(Number(item.cost)) ? 0 : Number(item.cost),
          }))
        : [
            {
              treatment_name: appointmentData?.treatment || "Consultation / Treatment",
              treatment_date: null as string | null,
              cost: Number(invoice.amount),
            },
          ]
    const subtotal = treatmentRows.reduce((sum, item) => sum + (Number.isNaN(item.cost) ? 0 : item.cost), 0)
    const total = subtotal

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842])
    const { width, height } = page.getSize()
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    page.drawRectangle({
      x: 0,
      y: height - 120,
      width,
      height: 120,
      color: rgb(1, 0.98, 0.9),
    })
    // Bottom strip for header spacing/padding.
    page.drawRectangle({
      x: 0,
      y: height - 132,
      width,
      height: 12,
      color: rgb(0.98, 0.95, 0.84),
    })
    let logoDrawn = false
    try {
      const logoResponse = await fetch("https://mysmileluxedentallounge.com/mainlogo.png", { cache: "no-store" })
      if (logoResponse.ok) {
        const logoBytes = await logoResponse.arrayBuffer()
        const logoImage = await pdfDoc.embedPng(logoBytes)
        page.drawImage(logoImage, { x: 30, y: height - 98, width: 48, height: 48 })
        logoDrawn = true
      }
    } catch {
      logoDrawn = false
    }

    if (!logoDrawn) {
      page.drawCircle({ x: 46, y: height - 84, size: 14, color: rgb(0.12, 0.2, 0.35) })
      page.drawText("ML", { x: 39, y: height - 88, size: 8, font: fontBold, color: rgb(1, 1, 1) })
    }

    page.drawText("MySmile Luxe Dental Lounge", {
      x: 86,
      y: height - 56,
      size: 16,
      font: fontBold,
      color: rgb(0.08, 0.14, 0.24),
    })
    page.drawText("Phone Number: +91 6304693676", {
      x: 86,
      y: height - 74,
      size: 8,
      font: fontRegular,
      color: rgb(0.28, 0.33, 0.4),
    })
    page.drawText("Email: mysmileluxedentallounge@gmail.com", {
      x: 86,
      y: height - 84,
      size: 8,
      font: fontRegular,
      color: rgb(0.28, 0.33, 0.4),
    })
    page.drawText("Address: Level 2, SLN Terminus Mall, Gachibowli, Hyderabad, Telangana 500032", {
      x: 86,
      y: height - 94,
      size: 8,
      font: fontRegular,
      color: rgb(0.28, 0.33, 0.4),
    })

    const invoiceDate = new Date(invoice.invoice_date)
    const formattedDate = Number.isNaN(invoiceDate.getTime())
      ? invoice.invoice_date
      : invoiceDate.toLocaleDateString("en-IN")

    page.drawText("INVOICE", {
      x: 430,
      y: height - 56,
      size: 16,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(`Invoice #: ${invoice.id.slice(0, 8).toUpperCase()}`, {
      x: 430,
      y: height - 74,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(`Date: ${formattedDate}`, {
      x: 430,
      y: height - 84,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })

    // Symmetric blocks for patient and doctor details.
    page.drawRectangle({
      x: 28,
      y: height - 300,
      width: 262,
      height: 96,
      borderColor: rgb(0.86, 0.88, 0.9),
      borderWidth: 1,
    })
    page.drawRectangle({
      x: 304,
      y: height - 300,
      width: 262,
      height: 96,
      borderColor: rgb(0.86, 0.88, 0.9),
      borderWidth: 1,
    })

    page.drawText("Patient Details", { x: 40, y: height - 220, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
    page.drawText(`Name: ${patientData?.full_name || "Patient"}`, {
      x: 40,
      y: height - 232,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(`Patient ID: ${patientData?.id?.slice(0, 8).toUpperCase() || "N/A"}`, {
      x: 40,
      y: height - 247,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(
      `Age / Gender: ${calculateAgeFromDob(patientData?.dob || null)} / ${patientData?.gender || "Not provided"}`,
      {
      x: 40,
      y: height - 262,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
      }
    )
    page.drawText(`Phone: ${formatIndianPhone(patientData?.phone)}`, {
      x: 40,
      y: height - 277,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })

    page.drawText("Doctor Details", { x: 316, y: height - 220, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) })
    page.drawText(`Name: ${doctorData?.full_name || "Dr Shridha Prabhu"}`, {
      x: 316,
      y: height - 232,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(`Qualification: ${DEFAULT_DOCTOR_QUALIFICATION}`, {
      x: 316,
      y: height - 247,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(`Reg. No: ${DEFAULT_DOCTOR_REGISTRATION}`, {
      x: 316,
      y: height - 262,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    const tableX = 32
    // Add extra spacing below details blocks.
    const tableY = height - 370
    const tableWidth = width - 64
    const rowHeight = 28

    // include_treatment_date defaults to true for legacy invoices where the column may be null
    const showDateCol = invoice.include_treatment_date !== false

    const colSNo = tableX + 10
    const colTreatment = tableX + 55
    const colDate = showDateCol ? tableX + tableWidth - 210 : null
    const colCost = tableX + tableWidth - 90

    page.drawRectangle({ x: tableX, y: tableY, width: tableWidth, height: rowHeight, color: rgb(0.93, 0.95, 0.98) })
    page.drawText("S.No", { x: colSNo, y: tableY + 10, size: 10, font: fontBold })
    page.drawText("Treatment", { x: colTreatment, y: tableY + 10, size: 10, font: fontBold })
    if (showDateCol && colDate !== null) {
      page.drawText("Date", { x: colDate, y: tableY + 10, size: 10, font: fontBold })
    }
    page.drawText("Cost", { x: colCost, y: tableY + 10, size: 10, font: fontBold })

    treatmentRows.forEach((item, index) => {
      const rowY = tableY - rowHeight * (index + 1)
      page.drawRectangle({
        x: tableX,
        y: rowY,
        width: tableWidth,
        height: rowHeight,
        borderColor: rgb(0.86, 0.88, 0.9),
        borderWidth: 1,
      })
      page.drawText(String(index + 1), {
        x: colSNo + 4,
        y: rowY + 10,
        size: 10,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      })
      page.drawText(item.treatment_name.slice(0, showDateCol ? 40 : 62), {
        x: colTreatment,
        y: rowY + 10,
        size: 10,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      })
      if (showDateCol && colDate !== null) {
        const formattedTreatmentDate = item.treatment_date
          ? (() => {
              const d = new Date(item.treatment_date)
              return Number.isNaN(d.getTime()) ? item.treatment_date : d.toLocaleDateString("en-IN")
            })()
          : "-"
        page.drawText(formattedTreatmentDate, {
          x: colDate,
          y: rowY + 10,
          size: 10,
          font: fontRegular,
          color: rgb(0.15, 0.15, 0.15),
        })
      }
      page.drawText(formatCurrency(item.cost), {
        x: colCost,
        y: rowY + 10,
        size: 10,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      })
    })

    // Subtotal and total aligned at table end under cost column.
    const summaryLabelX = tableX + tableWidth - 170
    const summaryValueX = tableX + tableWidth - 90
    const summaryStartY = tableY - rowHeight * (treatmentRows.length + 1) - 22
    page.drawText("Subtotal", {
      x: summaryLabelX,
      y: summaryStartY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText(formatCurrency(subtotal), {
      x: summaryValueX,
      y: summaryStartY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    page.drawText("Total", {
      x: summaryLabelX,
      y: summaryStartY - 16,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })
    page.drawText(formatCurrency(total), {
      x: summaryValueX,
      y: summaryStartY - 16,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    const normalizedPaymentMethod = (invoice.payment_method ?? "").toLowerCase()
    let footerY = 110
    if (invoice.payment_method) {
      page.drawText(`Payment Method: ${normalizedPaymentMethod.toUpperCase().replace("_", " ")}`, {
        x: 32,
        y: footerY,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      })
      footerY -= 14
    }

    page.drawText(`Status: ${invoice.status.toUpperCase()}`, {
      x: 32,
      y: footerY,
      size: 10,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    })
    footerY -= 14

    const resolvedUpiTxnId = invoice.upi_transaction_id || extractUpiTxnIdFromNotes(invoice.notes)
    if (normalizedPaymentMethod === "upi" && resolvedUpiTxnId) {
      page.drawText(`UPI Txn ID: ${resolvedUpiTxnId}`, {
        x: 32,
        y: footerY,
        size: 10,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      })
      footerY -= 14
    }

    // Intentionally do not render Notes in invoice footer.

    page.drawText("Thank you for choosing MySmile Luxe Dental Lounge.", {
      x: 32,
      y: 60,
      size: 10,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    })
    page.drawText("For any enquiries, contact: mysmileluxedentallounge@gmail.com | +91 6304693676", {
      x: 32,
      y: 46,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    })

    // Signature and seal drawn last so they always render on top of the treatment table.
    // Seal sits above, signature below it.
    try {
      const fs = await import("fs/promises")
      const path = await import("path")
      const sealPath = path.join(process.cwd(), "public", "mysmileSeal.png")
      const sealFileBytes = await fs.readFile(sealPath)
      const sealImage = await pdfDoc.embedPng(sealFileBytes)
      page.drawImage(sealImage, { x: 415, y: 55, width: 160, height: 160, rotate: degrees(10) })
    } catch {
      try {
        const sealResponse = await fetch("https://mysmileluxedentallounge.com/mysmileSeal.png", { cache: "no-store" })
        if (sealResponse.ok) {
          const sealBytes = await sealResponse.arrayBuffer()
          const sealImage = await pdfDoc.embedPng(sealBytes)
          page.drawImage(sealImage, { x: 415, y: 55, width: 160, height: 160, rotate: degrees(10) })
        }
      } catch {
        // seal unavailable — skip silently
      }
    }

    const signatureDrawn = await drawDoctorSignature(pdfDoc, page, doctorData?.doctor_signature, 430, 55)
    if (signatureDrawn) {
      page.drawText("Doctor Signature", {
        x: 430,
        y: 43,
        size: 8,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      })
    }

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.id.slice(0, 8)}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "PDF generation failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
