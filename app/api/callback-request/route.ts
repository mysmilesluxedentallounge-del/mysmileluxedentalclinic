import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import {
  emailDocumentClose,
  emailDocumentOpen,
  emailFooterBlock,
  emailGoldBanner,
  emailLogoHeader,
  getEmailLogoAttachment,
} from "@/lib/email-branding"

export async function POST(req: NextRequest) {
  const { name, phone } = await req.json()

  if (!name || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_USER or SMTP_PASS env vars are not set.")
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 })
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

  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  const { logoExists, attachments } = getEmailLogoAttachment()

  const main = `
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;font-size:14px;color:#555555;line-height:1.8;">
                A visitor on your website has requested a <strong style="color:#1a1a1a;">free consultation callback</strong>. Please reach out as soon as possible.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e8d9b0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#faf8f3;padding:13px 20px;border-bottom:1.5px solid #e8d9b0;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#c9a84c;text-transform:uppercase;">&#9670; Callback details</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;background:#ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;width:38%;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Name</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Phone</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Submitted</td>
                        <td style="padding:9px 0;font-size:13px;color:#1a1a1a;font-weight:700;">${submittedAt}</td>
                      </tr>
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
                      Submitted via the <strong>Free Consultation</strong> request on the website.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

  const html =
    emailDocumentOpen("Callback Request — MySmile Lux Dental Lounge") +
    emailLogoHeader(logoExists) +
    emailGoldBanner("New callback request") +
    main +
    emailFooterBlock("staff") +
    emailDocumentClose()

  try {
    await transporter.sendMail({
      from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `📞 Callback Request — ${name}`,
      html,
      attachments,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("Callback mail error:", message)
    return NextResponse.json({ error: `Mail error: ${message}` }, { status: 500 })
  }
}
