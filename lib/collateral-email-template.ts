import {
  emailDocumentClose,
  emailDocumentOpen,
  emailFooterBlock,
  emailGoldBanner,
  emailLogoHeader,
} from "@/lib/email-branding"
import type { InformationCollateral } from "@/lib/information-collaterals"

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function buildCollateralEmailHtml(
  logoExists: boolean,
  patientName: string,
  personalMessage: string,
  rows: InformationCollateral[]
) {
  const safeName = escapeHtml(patientName)
  const messageBlock = personalMessage.trim()
    ? `<p style="margin:0 0 18px;font-size:14px;color:#555;line-height:1.7;white-space:pre-wrap;">${escapeHtml(personalMessage)}</p>`
    : ""

  const listItems = rows
    .map((row, index) => {
      const name = escapeHtml(row.documentName)
      const type = escapeHtml(row.collateralType)
      const url = escapeHtml(row.driveUrl)
      const borderBottom = index < rows.length - 1 ? "border-bottom:1px solid #f0e8d6;" : ""
      return `<tr>
        <td style="padding:14px 18px;${borderBottom}">
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">${name}</p>
          <p style="margin:0 0 8px;font-size:12px;color:#888;">${type}</p>
          <a href="${url}" style="font-size:13px;color:#c9a84c;font-weight:600;text-decoration:none;">Open document on Google Drive →</a>
        </td>
      </tr>`
    })
    .join("")

  const body = `
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;font-size:16px;color:#1a1a1a;line-height:1.6;">
                Dear <strong>${safeName}</strong>,
              </p>
              <p style="margin:12px 0 0;font-size:14px;color:#555555;line-height:1.8;">
                Please find below the information documents we selected for you. Use the links to open each file in Google Drive.
              </p>
            </td>
          </tr>
          ${
            messageBlock
              ? `<tr><td style="padding:16px 40px 0;">${messageBlock}</td></tr>`
              : ""
          }
          <tr>
            <td style="padding:28px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #e8d9b0;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="background:#faf8f3;padding:13px 20px;border-bottom:1.5px solid #e8d9b0;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.2em;color:#c9a84c;text-transform:uppercase;">&#9670; Your documents</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;background:#ffffff;">
                    <table width="100%" cellpadding="0" cellspacing="0">${listItems}</table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`

  return (
    emailDocumentOpen("Information documents — MySmile Lux Dental Lounge") +
    emailLogoHeader(logoExists) +
    emailGoldBanner("Your information documents") +
    body +
    emailFooterBlock("patient") +
    emailDocumentClose()
  )
}

export function buildCollateralEmailText(
  patientName: string,
  personalMessage: string,
  rows: InformationCollateral[]
) {
  const lines = [
    `Dear ${patientName},`,
    "",
    "Please find below the collateral(s) we selected for you. Each line includes a Google Drive link to view the document.",
    "",
  ]
  if (personalMessage.trim()) {
    lines.push(personalMessage.trim(), "")
  }
  for (const row of rows) {
    lines.push(`• ${row.documentName} (${row.collateralType})`)
    lines.push(`  ${row.driveUrl}`)
    lines.push("")
  }
  lines.push("— MySmile Lux Dental Lounge")
  lines.push("Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032")
  lines.push("Phone: 6304693676 · mysmileluxedentallounge@gmail.com")
  return lines.join("\n")
}
