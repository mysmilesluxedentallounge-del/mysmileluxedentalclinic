import nodemailer from "nodemailer"
import {
  EMAIL_CLINIC,
  emailDocumentClose,
  emailDocumentOpen,
  emailFooterBlock,
  emailGoldBanner,
  emailLogoHeader,
  getEmailLogoAttachment,
} from "@/lib/email-branding"

type AppointmentConfirmationParams = {
  patientName: string
  patientEmail: string | null
  patientPhone?: string | null
  doctorName?: string | null
  appointmentDate: string
  appointmentTime: string
  treatment?: string | null
  notes?: string | null
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatAppointmentDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatAppointmentTime(value: string) {
  const [hours, minutes] = value.split(":")
  const date = new Date()
  date.setHours(Number(hours), Number(minutes ?? "0"), 0, 0)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

export async function sendAppointmentConfirmationEmail({
  patientName,
  patientEmail,
  patientPhone,
  doctorName,
  appointmentDate,
  appointmentTime,
  treatment,
  notes,
}: AppointmentConfirmationParams) {
  const recipientEmail = patientEmail?.trim().toLowerCase() ?? ""
  if (!recipientEmail || !isValidEmail(recipientEmail)) {
    return { sent: false, reason: "missing_patient_email" as const }
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER or SMTP_PASS not set; appointment saved but no confirmation email sent.")
    return { sent: false, reason: "smtp_not_configured" as const }
  }

  const safePatientName = escapeHtml(patientName)
  const safeDoctorName = doctorName ? escapeHtml(doctorName) : "MySmile Lux Dental Lounge"
  const safeTreatment = treatment ? escapeHtml(treatment) : "Consultation / Treatment"
  const safeNotes = notes ? escapeHtml(notes) : null
  const safePhone = patientPhone ? escapeHtml(patientPhone) : null
  const formattedDate = escapeHtml(formatAppointmentDate(appointmentDate))
  const formattedTime = escapeHtml(formatAppointmentTime(appointmentTime))

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const { logoExists, attachments } = getEmailLogoAttachment()
  const bodyHtml = `
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;font-size:16px;color:#1a1a1a;line-height:1.6;">
                Dear <strong>${safePatientName}</strong>,
              </p>
              <p style="margin:12px 0 0;font-size:14px;color:#555555;line-height:1.8;">
                Your appointment has been scheduled at <strong style="color:#1a1a1a;">${EMAIL_CLINIC.displayName}</strong>. Please find the details below.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e8d9b0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#faf8f3;padding:13px 20px;border-bottom:1.5px solid #e8d9b0;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#c9a84c;text-transform:uppercase;">&#9670; Appointment Summary</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;background:#ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;width:38%;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Date</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Time</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${formattedTime}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Doctor</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${safeDoctorName}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;${safeNotes ? "border-bottom:1px solid #f0e8d6;" : ""}font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Treatment</td>
                        <td style="padding:9px 0;${safeNotes ? "border-bottom:1px solid #f0e8d6;" : ""}font-size:13px;color:#1a1a1a;font-weight:700;">${safeTreatment}</td>
                      </tr>
                      ${
                        safeNotes
                          ? `<tr>
                        <td style="padding:9px 0;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Notes</td>
                        <td style="padding:9px 0;font-size:13px;color:#1a1a1a;font-weight:700;">${safeNotes}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9ed;border:1px solid #e8d9b0;border-left:4px solid #c9a84c;border-radius:6px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#6b5200;line-height:1.7;">
                      ${safePhone ? `Our team may call <strong>${safePhone}</strong> if any confirmation is needed. ` : ""}
                      For urgent queries or to reschedule, please call <strong>${EMAIL_CLINIC.phone}</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

  const html =
    emailDocumentOpen("Appointment Scheduled - MySmile Lux Dental Lounge") +
    emailLogoHeader(logoExists) +
    emailGoldBanner("Appointment Scheduled") +
    bodyHtml +
    emailFooterBlock("patient") +
    emailDocumentClose()

  await transporter.sendMail({
    from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: "Appointment Scheduled - MySmile Lux Dental Lounge",
    html,
    replyTo: process.env.SMTP_USER,
    attachments,
  })

  return { sent: true, reason: "sent" as const }
}
