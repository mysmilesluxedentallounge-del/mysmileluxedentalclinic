import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, phone, gender, dob, date, message } = await req.json();

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_USER or SMTP_PASS env vars are not set.");
    return NextResponse.json(
      { error: "Email service is not configured. Please contact the clinic directly." },
      { status: 500 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "To be confirmed";

  const salutation = gender === "female" ? "Ms." : "Mr.";

  const logoPath = path.join(process.cwd(), "public", "logo.png");
  let logoExists = false;
  try {
    logoExists = fs.existsSync(logoPath);
  } catch {
    logoExists = false;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Appointment Confirmation – MySmile Lux Dental Lounge</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:36px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);max-width:600px;width:100%;border:1px solid #e8d9b0;">

          <!-- Header: white bg with logo -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 20px;text-align:center;border-bottom:3px solid #c9a84c;">
              ${logoExists ? `<img src="cid:logo" alt="MySmile Lux Dental Lounge" width="200" style="display:block;margin:0 auto 0;max-width:200px;" />` : `<p style="margin:0;font-size:22px;font-weight:800;color:#c9a84c;letter-spacing:-0.3px;">MySmile Lux Dental Lounge</p>`}
            </td>
          </tr>

          <!-- Gold banner -->
          <tr>
            <td style="background:#c9a84c;padding:14px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.2em;color:#ffffff;text-transform:uppercase;">Appointment Request Received</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;font-size:16px;color:#1a1a1a;line-height:1.6;">
                Dear <strong>${salutation} ${name}</strong>,
              </p>
              <p style="margin:12px 0 0;font-size:14px;color:#555555;line-height:1.8;">
                Thank you for choosing <strong style="color:#1a1a1a;">MySmile Lux Dental Lounge</strong>. We have received your appointment request and our team will reach out to you shortly to confirm your slot.
              </p>
            </td>
          </tr>

          <!-- Receipt Box -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e8d9b0;border-radius:12px;overflow:hidden;">
                <!-- Receipt header -->
                <tr>
                  <td style="background:#faf8f3;padding:13px 20px;border-bottom:1.5px solid #e8d9b0;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#c9a84c;text-transform:uppercase;">&#9670; Booking Summary</p>
                  </td>
                </tr>
                <!-- Receipt rows -->
                <tr>
                  <td style="padding:18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;width:38%;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Patient Name</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${salutation} ${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Gender</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;text-transform:capitalize;">${gender || "Not specified"}</td>
                      </tr>
                      ${dob ? `<tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Date of Birth</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${new Date(dob).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</td>
                      </tr>` : ""}
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Phone</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${phone}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Email</td>
                        <td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;font-weight:700;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:9px 0;${message ? "border-bottom:1px solid #f0e8d6;" : ""}font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">Preferred Date</td>
                        <td style="padding:9px 0;${message ? "border-bottom:1px solid #f0e8d6;" : ""}font-size:13px;color:#1a1a1a;font-weight:700;">${formattedDate}</td>
                      </tr>
                      ${
                        message
                          ? `<tr>
                        <td style="padding:9px 0;font-size:12px;color:#999;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top;">Concern</td>
                        <td style="padding:9px 0;font-size:13px;color:#1a1a1a;font-weight:700;">${message}</td>
                      </tr>`
                          : ""
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info Note -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf9ed;border:1px solid #e8d9b0;border-left:4px solid #c9a84c;border-radius:6px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#6b5200;line-height:1.7;">
                      Our team will call <strong>${phone}</strong> to confirm your appointment time. For urgent queries or to reschedule, please call <strong>6304693676</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e8d9b0;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Clinic Info -->
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#1a1a1a;letter-spacing:0.01em;">MySmile Lux Dental Lounge</p>
              <p style="margin:0 0 3px;font-size:12px;color:#888;">Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032</p>
              <p style="margin:0 0 3px;font-size:12px;color:#888;">
                <a href="tel:6304693676" style="color:#c9a84c;text-decoration:none;font-weight:600;">6304693676</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:mysmileluxedentallounge@gmail.com" style="color:#c9a84c;text-decoration:none;font-weight:600;">mysmileluxedentallounge@gmail.com</a>
              </p>
              <p style="margin:0;font-size:12px;color:#888;">
                <a href="https://instagram.com/mysmileluxdentallounge" style="color:#c9a84c;text-decoration:none;">@mysmileluxdentallounge</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#bbbbbb;line-height:1.7;">
                This is an automated confirmation. Please do not reply to this email.<br/>
                &copy; ${new Date().getFullYear()} MySmile Lux Dental Lounge. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Appointment Request Confirmed – MySmile Lux Dental Lounge",
      html,
      attachments: logoExists
        ? [
            {
              filename: "logo.png",
              path: logoPath,
              cid: "logo",
            },
          ]
        : [],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Mail send error:", message);
    return NextResponse.json(
      { error: `Mail error: ${message}` },
      { status: 500 }
    );
  }
}
