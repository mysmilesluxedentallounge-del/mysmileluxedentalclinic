import nodemailer from "nodemailer"
import { NextRequest, NextResponse } from "next/server"
import {
  EMAIL_CLINIC,
  emailDocumentClose,
  emailDocumentOpen,
  emailFooterBlock,
  emailGoldBanner,
  emailLogoHeader,
  getEmailLogoAttachment,
} from "@/lib/email-branding"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

function isDefaultDoctorName(name: string | null | undefined) {
  if (!name) return false;
  const normalized = name.toLowerCase().replace(/\./g, "").trim();
  return normalized.includes("shridha") && normalized.includes("prabhu");
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, gender, dob, date, message } = body as {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    dob?: string;
    date?: string;
    message?: string;
  };

  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "To be confirmed";

  const salutation = gender === "female" ? "Ms." : "Mr.";

  let patientId: string | null = null;
  let bookingError: string | null = null;
  try {
    const supabase = createSupabaseAdminClient();
    const { data: doctors, error: doctorError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "doctor")
      .order("full_name");
    if (doctorError || !doctors?.length) {
      throw new Error("No doctor profile found for appointment booking.");
    }

    const defaultDoctor = doctors.find((doctor) => isDefaultDoctorName(doctor.full_name)) ?? doctors[0];
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();

    let existingPatient: { id: string } | null = null;
    if (normalizedPhone) {
      const { data } = await supabase
        .from("patients")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();
      existingPatient = data;
    }

    if (!existingPatient && normalizedEmail) {
      const { data } = await supabase
        .from("patients")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      existingPatient = data;
    }

    if (existingPatient) {
      patientId = existingPatient.id;
      await supabase
        .from("patients")
        .update({
          full_name: String(name).trim(),
          phone: normalizedPhone || null,
          email: normalizedEmail || null,
          gender: String(gender || "").trim() || null,
          dob: String(dob || "").trim() || null,
        })
        .eq("id", patientId);
    } else {
      const { data: createdPatient, error: createPatientError } = await supabase
        .from("patients")
        .insert({
          full_name: String(name).trim(),
          phone: normalizedPhone || null,
          email: normalizedEmail || null,
          gender: String(gender || "").trim() || null,
          dob: String(dob || "").trim() || null,
          patient_notes: String(message || "").trim() || null,
          created_by: defaultDoctor.id,
        })
        .select("id")
        .single();

      if (createPatientError || !createdPatient) {
        throw new Error(createPatientError?.message || "Could not create patient record.");
      }

      patientId = createdPatient.id;
    }

    const appointmentDate = String(date || "").trim() || new Date().toISOString().split("T")[0];
    const appointmentNotes = String(message || "").trim() || null;
    const { error: appointmentError } = await supabase.from("appointments").insert({
      patient_id: patientId,
      doctor_id: defaultDoctor.id,
      appointment_date: appointmentDate,
      appointment_time: "10:00",
      status: "scheduled",
      notes: appointmentNotes,
      treatment: null,
    });

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }
  } catch (error) {
    bookingError = error instanceof Error ? error.message : "Could not create patient and appointment.";
  }

  if (bookingError) {
    return NextResponse.json(
      { error: bookingError },
      { status: 500 }
    );
  }

  const hasSmtp = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!hasSmtp) {
    console.warn("SMTP_USER or SMTP_PASS not set; appointment saved but no confirmation email sent.");
    return NextResponse.json({
      success: true,
      patientId,
      emailSent: false,
      message: "Your appointment request was received. Email confirmation is not configured on the server; the clinic will contact you by phone.",
    });
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

  const { logoExists, attachments } = getEmailLogoAttachment();

  const bodyHtml = `
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
                  <td style="padding:18px 20px;background:#ffffff;">
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
                      Our team will call <strong>${phone}</strong> to confirm your appointment time. For urgent queries or to reschedule, please call <strong>${EMAIL_CLINIC.phone}</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;

  const html =
    emailDocumentOpen("Appointment Confirmation – MySmile Lux Dental Lounge") +
    emailLogoHeader(logoExists) +
    emailGoldBanner("Appointment Request Received") +
    bodyHtml +
    emailFooterBlock("patient") +
    emailDocumentClose();

  try {
    await transporter.sendMail({
      from: `"MySmile Lux Dental Lounge" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Appointment Request Confirmed – MySmile Lux Dental Lounge",
      html,
      attachments,
    });

    return NextResponse.json({ success: true, patientId, emailSent: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Mail send error:", message);
    return NextResponse.json(
      {
        success: true,
        patientId,
        emailSent: false,
        message: `Your appointment was saved, but the confirmation email could not be sent (${message}). The clinic will still contact you.`,
      },
      { status: 200 }
    );
  }
}
