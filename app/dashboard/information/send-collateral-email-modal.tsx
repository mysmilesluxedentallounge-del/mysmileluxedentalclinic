"use client"

import { useEffect, useId, useState } from "react"
import { Mail, Plus, X } from "lucide-react"
import Link from "next/link"
import type { InformationCollateral } from "@/lib/information-collaterals"

const MAX_MESSAGE = 768
const MAX_PATIENT = 200

type SendCollateralEmailModalProps = {
  open: boolean
  onClose: () => void
  collaterals: InformationCollateral[]
}

export default function SendCollateralEmailModal({
  open,
  onClose,
  collaterals,
}: SendCollateralEmailModalProps) {
  const titleId = useId()
  const [patientName, setPatientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [errorText, setErrorText] = useState("")

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (collaterals.length === 0 || status === "sending") return

    setStatus("sending")
    setErrorText("")

    try {
      const res = await fetch("/api/dashboard/send-collateral-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          patientName: patientName.trim(),
          recipientEmail: recipientEmail.trim(),
          message,
          collateralIds: collaterals.map((c) => c.id),
        }),
      })

      const data = (await res.json().catch(() => null)) as { error?: string } | null

      if (!res.ok) {
        setStatus("error")
        setErrorText(data?.error ?? "Could not send email.")
        return
      }

      setStatus("success")
      window.setTimeout(() => {
        onClose()
      }, 1600)
    } catch {
      setStatus("error")
      setErrorText("Network error. Please try again.")
    }
  }

  if (!open) return null

  const messageLeft = MAX_MESSAGE - message.length

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-amber-200 bg-white shadow-xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id={titleId} className="font-heading text-lg font-semibold text-slate-900">
            Send collaterals by email
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-amber-600 bg-[var(--yellow-mid)] p-1.5 text-[var(--brand-dark)] hover:opacity-90"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="border-b border-slate-50 bg-amber-50/40 px-5 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80">Including</p>
          <ul className="mt-1 max-h-28 list-inside list-disc space-y-0.5 overflow-y-auto text-sm text-slate-700">
            {collaterals.map((c) => (
              <li key={c.id}>{c.documentName}</li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <label className="block text-sm">
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium text-slate-700">Patient name</span>
              <Link
                href="/dashboard/patients"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-amber-600 bg-[var(--yellow-mid)] px-2 py-0.5 text-xs font-medium text-[var(--brand-dark)] hover:opacity-90"
              >
                <Plus className="size-3.5 shrink-0" aria-hidden />
                Patients list
              </Link>
            </span>
            <input
              required
              name="patient_name"
              value={patientName}
              maxLength={MAX_PATIENT}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Patient full name"
              autoComplete="name"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Recipient email</span>
            <input
              required
              type="email"
              name="recipient_email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="patient@email.com"
              autoComplete="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="mt-1 block text-xs text-muted-foreground">We send the template to this address.</span>
          </label>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Message</span>
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (personal note, max. {MAX_MESSAGE} characters)
            </span>
            <textarea
              name="message"
              value={message}
              maxLength={MAX_MESSAGE}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional short note to include above the document links…"
              rows={4}
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span
              className={`mt-1 block text-xs ${messageLeft < 80 ? "text-amber-800" : "text-muted-foreground"}`}
            >
              {message.length} / {MAX_MESSAGE} character(s)
            </span>
          </label>

          {status === "error" && errorText ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{errorText}</p>
          ) : null}
          {status === "success" ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Email sent successfully.
            </p>
          ) : null}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={status === "sending" || status === "success" || collaterals.length === 0}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border-2 border-amber-700 bg-[var(--yellow-mid)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-dark)] shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail className="size-4 shrink-0" aria-hidden />
              {status === "sending" ? "Sending…" : "Send mail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
