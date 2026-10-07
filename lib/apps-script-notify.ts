/**
 * Sends website form submissions to the Google Apps Script web app, which
 * emails the clinic inbox. This is independent of SMTP: Apps Script sends as
 * the Google account that owns the script, so clinic notifications still work
 * when SMTP_USER / SMTP_PASS are unset.
 *
 * The script itself lives in `google-apps-script/Code.gs`.
 */

export type ClinicFormType = "appointment" | "callback" | "contact"

export type ClinicFormSubmission = {
  formType: ClinicFormType
  name?: string | null
  email?: string | null
  phone?: string | null
  gender?: string | null
  dob?: string | null
  date?: string | null
  message?: string | null
}

export type AppsScriptNotifyResult = { sent: true } | { sent: false; reason: string }

/** A slow web app must not hold up the visitor's form submission. */
const APPS_SCRIPT_TIMEOUT_MS = 8000

/**
 * Notifies the clinic of a form submission. Never throws — a notification
 * failure must not break a booking that already saved successfully.
 */
export async function notifyClinicViaAppsScript(
  submission: ClinicFormSubmission
): Promise<AppsScriptNotifyResult> {
  const url = process.env.APPS_SCRIPT_URL
  if (!url) {
    return { sent: false, reason: "APPS_SCRIPT_URL is not set" }
  }

  const payload = {
    ...submission,
    secret: process.env.APPS_SCRIPT_SECRET ?? "",
    submittedAt: new Date().toISOString(),
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // A web app answers from script.googleusercontent.com after a redirect.
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(APPS_SCRIPT_TIMEOUT_MS),
    })

    if (!response.ok) {
      return failure(`Apps Script responded with ${response.status}`)
    }

    // Web apps always reply 200; success or failure is reported in the body.
    const text = await response.text()
    let parsed: { ok?: boolean; error?: string }
    try {
      parsed = JSON.parse(text) as { ok?: boolean; error?: string }
    } catch {
      // Usually an HTML sign-in page: the deployment is not public.
      return failure(
        `Apps Script returned non-JSON (check the deployment is accessible to "Anyone"): ${text.slice(0, 160)}`
      )
    }

    if (!parsed.ok) {
      return failure(parsed.error || "Apps Script reported a failure")
    }

    return { sent: true }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return failure(reason)
  }
}

function failure(reason: string): AppsScriptNotifyResult {
  console.warn(`Clinic notification not sent: ${reason}`)
  return { sent: false, reason }
}
