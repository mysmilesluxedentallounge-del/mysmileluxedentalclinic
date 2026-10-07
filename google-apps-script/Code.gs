/**
 * MySmile Luxe Dental Lounge — website form notifier.
 *
 * Deployed as a Web App, this receives form submissions from the Next.js site
 * and emails the clinic inbox. It sends mail as the Google account that owns
 * the script, so it needs no SMTP user/password of its own.
 *
 * Endpoints:
 *   doPost(e) — the real submission hook. Expects a JSON body.
 *   doGet(e)  — health check (`?ping=1`) and a browser-testable submission.
 *
 * Deployment steps: see README.md next to this file.
 */

var CONFIG = {
  // Inbox that receives notifications. Leave blank to send to the account that
  // owns this script (usually what you want).
  notifyEmail: '',

  // Must match APPS_SCRIPT_SECRET in the Next.js app. The web app URL is
  // public, so leaving this blank lets anyone trigger clinic emails.
  sharedSecret: 'CHANGE_ME',

  // Optional: append every submission to a Google Sheet. Leave blank to skip.
  spreadsheetId: '',
  sheetName: 'Submissions',

  clinicName: 'MySmile Luxe Dental Lounge',
  timeZone: 'Asia/Kolkata',
};

/** Human labels for known form fields, in the order they should be shown. */
var FIELD_LABELS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['gender', 'Gender'],
  ['dob', 'Date of Birth'],
  ['date', 'Preferred Date'],
  ['message', 'Message'],
];

var FORM_TITLES = {
  appointment: 'New Appointment Request',
  callback: 'New Callback Request',
  contact: 'New Contact Form Submission',
};

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

function doPost(e) {
  try {
    var payload = parseBody_(e);

    if (!isAuthorised_(payload)) {
      return jsonOutput_({ ok: false, error: 'Unauthorized' });
    }

    return jsonOutput_(handleSubmission_(payload));
  } catch (err) {
    // Never throw: an uncaught error returns an HTML error page, which the
    // caller cannot parse as JSON.
    console.error('doPost failed: ' + err);
    return jsonOutput_({ ok: false, error: errorMessage_(err) });
  }
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};

    // Health check — lets you confirm the deployment works from a browser.
    if (params.ping) {
      return jsonOutput_({
        ok: true,
        service: CONFIG.clinicName + ' form notifier',
        time: nowInClinicTime_(),
      });
    }

    if (!isAuthorised_(params)) {
      return jsonOutput_({ ok: false, error: 'Unauthorized' });
    }

    return jsonOutput_(handleSubmission_(params));
  } catch (err) {
    console.error('doGet failed: ' + err);
    return jsonOutput_({ ok: false, error: errorMessage_(err) });
  }
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

function handleSubmission_(payload) {
  var formType = String(payload.formType || 'contact').toLowerCase();
  var submittedAt = nowInClinicTime_();
  var recipient = CONFIG.notifyEmail || Session.getEffectiveUser().getEmail();

  if (!recipient) {
    throw new Error('No notification recipient: set CONFIG.notifyEmail.');
  }

  var fields = collectFields_(payload);
  if (!fields.length) {
    return { ok: false, error: 'Submission contained no recognisable fields.' };
  }

  var title = FORM_TITLES[formType] || FORM_TITLES.contact;
  var who = isPresent_(payload.name) ? String(payload.name).trim() : 'Website visitor';

  var options = {
    to: recipient,
    subject: title + ' — ' + who,
    body: buildPlainBody_(title, fields, submittedAt),
    htmlBody: buildHtmlBody_(title, fields, submittedAt),
    name: CONFIG.clinicName,
  };

  // Let the clinic hit Reply and answer the patient directly.
  if (isEmail_(payload.email)) {
    options.replyTo = String(payload.email).trim();
  }

  MailApp.sendEmail(options);

  logToSheet_(formType, fields, submittedAt);

  return { ok: true, notified: recipient, submittedAt: submittedAt };
}

/** Pulls known fields first, then any extra keys the site sent. */
function collectFields_(payload) {
  var skip = { formtype: true, secret: true, source: true, submittedat: true, ping: true };
  var out = [];
  var seen = {};

  FIELD_LABELS.forEach(function (pair) {
    var value = payload[pair[0]];
    if (isPresent_(value)) {
      out.push({ label: pair[1], value: String(value).trim() });
      seen[pair[0]] = true;
    }
  });

  Object.keys(payload).forEach(function (key) {
    if (seen[key] || skip[key.toLowerCase()]) return;
    if (!isPresent_(payload[key])) return;
    out.push({ label: toLabel_(key), value: String(payload[key]).trim() });
  });

  return out;
}

function logToSheet_(formType, fields, submittedAt) {
  if (!CONFIG.spreadsheetId) return;

  // Concurrent submissions would otherwise race on the same last row.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);

    var ss = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    var sheet = ss.getSheetByName(CONFIG.sheetName) || ss.insertSheet(CONFIG.sheetName);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Submitted At', 'Form', 'Details']);
    }

    var details = fields
      .map(function (f) {
        return f.label + ': ' + f.value;
      })
      .join(' | ');

    sheet.appendRow([submittedAt, formType, details]);
  } catch (err) {
    // A logging failure must not lose the email that already went out.
    console.error('Sheet logging failed: ' + err);
  } finally {
    lock.releaseLock();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    // Form-encoded posts land in e.parameter instead of e.postData.
    return (e && e.parameter) || {};
  }

  var raw = e.postData.contents;
  var type = String(e.postData.type || '');

  if (type.indexOf('application/json') !== -1 || raw.charAt(0) === '{') {
    return JSON.parse(raw);
  }

  return (e && e.parameter) || {};
}

function isAuthorised_(payload) {
  if (!CONFIG.sharedSecret) return true;
  var provided = payload && payload.secret ? String(payload.secret) : '';
  return provided === CONFIG.sharedSecret;
}

function jsonOutput_(obj) {
  // Apps Script web apps always reply 200; errors are signalled in the body.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function nowInClinicTime_() {
  return Utilities.formatDate(new Date(), CONFIG.timeZone, "d MMMM yyyy 'at' h:mm a");
}

function errorMessage_(err) {
  return String(err && err.message ? err.message : err);
}

function isPresent_(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

function isEmail_(value) {
  return isPresent_(value) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value).trim());
}

function toLabel_(key) {
  return String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPlainBody_(title, fields, submittedAt) {
  var lines = [title, '', 'Received: ' + submittedAt, ''];
  fields.forEach(function (f) {
    lines.push(f.label + ': ' + f.value);
  });
  return lines.join('\n');
}

function buildHtmlBody_(title, fields, submittedAt) {
  var rows = fields
    .map(function (f) {
      return (
        '<tr>' +
        '<td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:12px;color:#999;' +
        'width:38%;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">' +
        escapeHtml_(f.label) +
        '</td>' +
        '<td style="padding:9px 0;border-bottom:1px solid #f0e8d6;font-size:13px;color:#1a1a1a;' +
        'font-weight:700;">' +
        escapeHtml_(f.value) +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  return [
    '<div style="background:#f5f5f5;padding:24px;font-family:Arial,Helvetica,sans-serif;">',
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;',
    'background:#ffffff;border-radius:12px;overflow:hidden;">',
    '<tr><td style="background:#c9a84c;padding:18px 24px;">',
    '<p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.18em;color:#ffffff;',
    'text-transform:uppercase;">' + escapeHtml_(title) + '</p>',
    '</td></tr>',
    '<tr><td style="padding:24px;">',
    '<p style="margin:0 0 16px;font-size:13px;color:#777;">Received ' + escapeHtml_(submittedAt) + '</p>',
    '<table width="100%" cellpadding="0" cellspacing="0">' + rows + '</table>',
    '</td></tr>',
    '<tr><td style="background:#faf8f3;padding:14px 24px;border-top:1px solid #e8d9b0;">',
    '<p style="margin:0;font-size:11px;color:#999;">Sent automatically from the ',
    escapeHtml_(CONFIG.clinicName) + ' website.</p>',
    '</td></tr>',
    '</table></div>',
  ].join('');
}
