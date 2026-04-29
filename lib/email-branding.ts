import fs from "fs"
import path from "path"

/** Shared clinic details and cream / white / gold styling for all transactional HTML emails */

export const EMAIL_CLINIC = {
  displayName: "MySmile Lux Dental Lounge",
  address: "Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032",
  phone: "6304693676",
  email: "mysmileluxedentallounge@gmail.com",
  instagramUrl: "https://instagram.com/mysmileluxdentallounge",
  instagramHandle: "@mysmileluxdentallounge",
} as const

export type EmailLogoAttachment = { filename: string; path: string; cid: string }

/** Resolves `public/logo.png` for inline CID attachment (same as appointment confirmation). */
export function getEmailLogoAttachment(): {
  logoExists: boolean
  logoPath: string
  attachments: EmailLogoAttachment[]
} {
  const logoPath = path.join(process.cwd(), "public", "logo.png")
  let logoExists = false
  try {
    logoExists = fs.existsSync(logoPath)
  } catch {
    logoExists = false
  }
  return {
    logoPath,
    logoExists,
    attachments: logoExists ? [{ filename: "logo.png", path: logoPath, cid: "logo" }] : [],
  }
}

export function emailDocumentOpen(pageTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${pageTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#faf8f3;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.10);max-width:600px;width:100%;border:1px solid #e8d9b0;">`
}

export function emailDocumentClose(): string {
  return `
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** White header strip with logo (or gold wordmark) and gold bottom border */
export function emailLogoHeader(logoExists: boolean): string {
  const fallback = `<p style="margin:0;font-size:22px;font-weight:800;color:#c9a84c;letter-spacing:-0.3px;">${EMAIL_CLINIC.displayName}</p>`
  const img = `<img src="cid:logo" alt="${EMAIL_CLINIC.displayName}" width="200" style="display:block;margin:0 auto;max-width:200px;height:auto;" />`
  return `
          <tr>
            <td style="background:#ffffff;padding:32px 40px 20px;text-align:center;border-bottom:3px solid #c9a84c;">
              ${logoExists ? img : fallback}
            </td>
          </tr>`
}

/** Solid gold banner — single uppercase line (matches appointment emails) */
export function emailGoldBanner(bannerTextUppercase: string): string {
  return `
          <tr>
            <td style="background:#c9a84c;padding:14px 40px;text-align:center;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.2em;color:#ffffff;text-transform:uppercase;">${bannerTextUppercase}</p>
            </td>
          </tr>`
}

export function emailFooterBlock(kind: "patient" | "staff"): string {
  const year = new Date().getFullYear()
  const disclaimer =
    kind === "staff"
      ? `This notification was generated automatically from the ${EMAIL_CLINIC.displayName} website.`
      : "This is an automated confirmation. Please do not reply to this email if you need assistance—call us using the number above."

  return `
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e8d9b0;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:800;color:#1a1a1a;letter-spacing:0.01em;">${EMAIL_CLINIC.displayName}</p>
              <p style="margin:0 0 3px;font-size:12px;color:#888;">${EMAIL_CLINIC.address}</p>
              <p style="margin:0 0 3px;font-size:12px;color:#888;">
                <a href="tel:${EMAIL_CLINIC.phone}" style="color:#c9a84c;text-decoration:none;font-weight:600;">${EMAIL_CLINIC.phone}</a>
                &nbsp;&nbsp;|&nbsp;&nbsp;
                <a href="mailto:${EMAIL_CLINIC.email}" style="color:#c9a84c;text-decoration:none;font-weight:600;">${EMAIL_CLINIC.email}</a>
              </p>
              <p style="margin:0;font-size:12px;color:#888;">
                <a href="${EMAIL_CLINIC.instagramUrl}" style="color:#c9a84c;text-decoration:none;">${EMAIL_CLINIC.instagramHandle}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;background:#fdf9ed;">
              <p style="margin:0;font-size:11px;color:#888;line-height:1.7;">
                ${disclaimer}<br/>
                &copy; ${year} ${EMAIL_CLINIC.displayName}. All rights reserved.
              </p>
            </td>
          </tr>`
}
