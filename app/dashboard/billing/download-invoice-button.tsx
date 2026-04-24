"use client"

import { useState } from "react"

type DownloadInvoiceButtonProps = {
  invoiceId: string
}

export default function DownloadInvoiceButton({ invoiceId }: DownloadInvoiceButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      const response = await fetch(`/dashboard/billing/${invoiceId}/pdf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message =
          payload && typeof payload === "object" && "error" in payload
            ? String(payload.error)
            : "Failed to download invoice PDF"
        throw new Error(message)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `invoice-${invoiceId.slice(0, 8)}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not download the invoice right now. Please try again."
      alert(message)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button type="button" onClick={handleDownload} className="text-blue-600 hover:underline disabled:opacity-60" disabled={isDownloading}>
      {isDownloading ? "Downloading..." : "Download"}
    </button>
  )
}
