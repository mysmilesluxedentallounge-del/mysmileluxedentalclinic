# Clinic form notifier (Google Apps Script)

Emails the clinic inbox whenever someone submits a form on the website.

The website already emails the **patient** a confirmation. Before this, the
**clinic** was never notified of an appointment request — this closes that gap.

It sends mail as the Google account that owns the script, so it needs no SMTP
username or app password. Clinic notifications keep working even when
`SMTP_USER` / `SMTP_PASS` are unset.

## Files

| File | Purpose |
| --- | --- |
| `Code.gs` | `doPost` / `doGet` handlers, email rendering, optional Sheet logging |
| `appsscript.json` | Manifest — V8 runtime, web app access, OAuth scopes |

## 1. Create the script

1. Sign in to Google as **the clinic's Gmail account** (the inbox that should
   receive notifications), then open <https://script.google.com> → **New project**.
2. Rename it something like `MySmile Form Notifier`.
3. Replace the contents of `Code.gs` with this folder's `Code.gs`.
4. Optional: enable **Project Settings → Show "appsscript.json" manifest file**
   and paste in this folder's `appsscript.json`.

## 2. Configure

Edit the `CONFIG` block at the top of `Code.gs`:

```js
var CONFIG = {
  notifyEmail: '',              // blank = send to the script owner's own inbox
  sharedSecret: 'CHANGE_ME',    // set a long random string
  spreadsheetId: '',            // optional: also log every submission to a Sheet
  ...
};
```

**Change `sharedSecret`.** The web app URL is publicly reachable, so without a
secret anyone who finds it could trigger clinic emails. Use a long random value
and keep it identical to `APPS_SCRIPT_SECRET` in the site's environment.

## 3. Deploy as a Web App

**Deploy → New deployment → ⚙ → Web app**, then:

| Setting | Value |
| --- | --- |
| Execute as | **Me** (the clinic account — this is who sends the mail) |
| Who has access | **Anyone** |

"Anyone" is required. "Anyone with a Google Account" makes the endpoint return a
sign-in page instead of JSON, and the server call will fail.

Click **Deploy**, approve the permission prompt (it will warn the app is
unverified — this is your own script; choose **Advanced → Go to …**), and copy
the **Web app URL**. It ends in `/exec`.

> **Re-deploying:** editing `Code.gs` does *not* update the live web app. Use
> **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**, keeping
> the same URL. Forgetting this is the most common reason a change appears to do
> nothing.

## 4. Point the site at it

Add to `.env.local`, and to the Vercel project's environment variables:

```bash
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfy.../exec
APPS_SCRIPT_SECRET=the-same-secret-as-in-Code.gs
```

Redeploy the site so the new variables take effect.

## 5. Verify

Health check — open in a browser, no secret needed:

```
https://script.google.com/macros/s/AKfy.../exec?ping=1
```

Expected:

```json
{"ok":true,"service":"MySmile Luxe Dental Lounge form notifier","time":"..."}
```

Send a real test notification:

```bash
curl -L -X POST "https://script.google.com/macros/s/AKfy.../exec" \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SECRET","formType":"appointment","name":"Test Patient","email":"test@example.com","phone":"+91 9000000000","message":"Testing"}'
```

Expected `{"ok":true,"notified":"...","submittedAt":"..."}`, and an email in the
clinic inbox. `-L` matters: web apps answer via a redirect.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Response is HTML, not JSON | Deployment access is not **Anyone**, or you used the `/dev` URL instead of `/exec` |
| `{"ok":false,"error":"Unauthorized"}` | `APPS_SCRIPT_SECRET` doesn't match `CONFIG.sharedSecret` |
| Nothing arrives, no error | Check the **Executions** tab in the Apps Script editor |
| Changes have no effect | You didn't deploy a **new version** — see the note in step 3 |
| `Service invoked too many times` | Gmail quota: 100 recipients/day on consumer accounts, 1,500 on Workspace |

## How the site calls it

`lib/apps-script-notify.ts` posts the submission and never throws — if the
notification fails, the booking is still saved and the visitor still gets their
confirmation. Failures are logged server-side as
`Clinic notification not sent: <reason>`.

Wired into:

- `app/api/send-appointment/route.ts` — the main contact/appointment form
- `app/api/callback-request/route.ts` — the free-consultation callback popup
