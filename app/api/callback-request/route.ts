import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();

  if (!name || !phone) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_USER or SMTP_PASS env vars are not set.");
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
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

  const submittedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><title>Callback Request</title></head>
<body style="margin:0;padding:0;background:#faf8f3;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg,#c9a84c 0%,#e8c96a 100%);padding:28px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.75);">New Lead</p>
      <h1 style="margin:0;font-size:22px;color:#fff;font-weight:700;">Callback Request</h1>
    </div>

    <div style="padding:32px;">
      <p style="margin:0 0 20px;font-size:14px;color:#555;">
        A visitor on your website has requested a free consultation callback. Please reach out as soon as possible.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f0e8d6;">
          <td style="padding:12px 8px;color:#888;width:120px;">Name</td>
          <td style="padding:12px 8px;font-weight:600;color:#222;">${name}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0e8d6;">
          <td style="padding:12px 8px;color:#888;">Phone</td>
          <td style="padding:12px 8px;font-weight:600;color:#222;">${phone}</td>
        </tr>
        <tr>
          <td style="padding:12px 8px;color:#888;">Submitted</td>
          <td style="padding:12px 8px;font-weight:600;color:#222;">${submittedAt}</td>
        </tr>
      </table>

      <div style="margin-top:28px;padding:16px;background:#fdf9ed;border-radius:10px;border:1px solid #f0e8d6;text-align:center;">
        <p style="margin:0;font-size:12px;color:#aaa;">Submitted via the Free Consultation popup on the website.</p>
      </div>
    </div>

  </div>
</body>
</html>
`;

  try {
    await transporter.sendMail({
      from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `📞 Callback Request — ${name}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Callback mail error:", message);
    return NextResponse.json({ error: `Mail error: ${message}` }, { status: 500 });
  }
}
