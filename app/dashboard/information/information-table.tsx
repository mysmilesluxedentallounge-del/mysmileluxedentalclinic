"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Eye, Mail, Printer, Search } from "lucide-react"
import {
  type InformationCollateral,
  googleDriveFileIdFromUrl,
  INFORMATION_COLLATERALS,
  uniqueCollateralTypes,
} from "@/lib/information-collaterals"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableEmptyRowClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperScrollClass,
} from "@/lib/dashboard-table"
import SendCollateralEmailModal from "./send-collateral-email-modal"

function viewDocument(row: InformationCollateral) {
  window.open(row.driveUrl, "_blank", "noopener,noreferrer")
}

function printDocument(row: InformationCollateral) {
  const id = googleDriveFileIdFromUrl(row.driveUrl)
  if (!id) {
    window.open(row.driveUrl, "_blank", "noopener,noreferrer")
    return
  }

  // Keep opener access here so we can write content and trigger print reliably.
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    window.open(`https://drive.google.com/file/d/${id}/preview`, "_blank", "noopener,noreferrer")
    return
  }

  const previewUrl = `https://drive.google.com/file/d/${id}/preview`
  const safeTitle = row.documentName.replace(/</g, "&lt;").replace(/>/g, "&gt;")

  printWindow.document.open()
  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Print - ${safeTitle}</title>
    <style>
      html, body { margin: 0; height: 100%; background: #f8fafc; }
      .frame-wrap { height: 100%; display: grid; grid-template-rows: 1fr auto; }
      iframe { border: 0; width: 100%; height: 100%; background: #fff; }
      .bar { display: flex; gap: 8px; justify-content: center; padding: 10px; font-family: Arial, sans-serif; }
      .btn { border: 1px solid #d4a017; background: #ffc566; color: #2c2c2c; border-radius: 8px; padding: 8px 12px; cursor: pointer; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="frame-wrap">
      <iframe src="${previewUrl}" title="Print preview"></iframe>
      <div class="bar">
        <button class="btn" onclick="window.print()">Print</button>
      </div>
    </div>
    <script>
      setTimeout(() => {
        try { window.focus(); window.print(); } catch {}
      }, 1200);
    </script>
  </body>
</html>`)
  printWindow.document.close()
}

function printMany(rows: InformationCollateral[]) {
  if (rows.length === 0) return
  rows.forEach((row, index) => {
    window.setTimeout(() => printDocument(row), index * 500)
  })
}

export default function InformationTable() {
  const [query, setQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("")
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailModalCollaterals, setEmailModalCollaterals] = useState<InformationCollateral[]>([])
  const [emailModalSession, setEmailModalSession] = useState(0)

  const openEmailComposer = useCallback((rows: InformationCollateral[]) => {
    if (rows.length === 0) return
    setEmailModalCollaterals(rows)
    setEmailModalSession((s) => s + 1)
    setEmailModalOpen(true)
  }, [])

  const types = useMemo(() => uniqueCollateralTypes(INFORMATION_COLLATERALS), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return INFORMATION_COLLATERALS.filter((row) => {
      if (typeFilter && row.collateralType !== typeFilter) return false
      if (!q) return true
      return (
        row.documentName.toLowerCase().includes(q) || row.collateralType.toLowerCase().includes(q)
      )
    })
  }, [query, typeFilter])

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((row) => selected.has(row.id))
  const someFilteredSelected = filtered.some((row) => selected.has(row.id))

  const toggleRow = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAllFiltered = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allFilteredSelected) {
        for (const row of filtered) next.delete(row.id)
      } else {
        for (const row of filtered) next.add(row.id)
      }
      return next
    })
  }, [allFilteredSelected, filtered])

  const selectAllRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = selectAllRef.current
    if (!el) return
    el.indeterminate = someFilteredSelected && !allFilteredSelected
  }, [someFilteredSelected, allFilteredSelected])

  const selectedRows = useMemo(
    () => INFORMATION_COLLATERALS.filter((row) => selected.has(row.id)),
    [selected]
  )

  const iconBtn =
    "inline-flex cursor-pointer flex-col items-center gap-0.5 rounded-md p-1.5 text-[var(--yellow-mid)] hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-3">
          <label className="text-sm font-medium text-slate-700">
            <span className="mb-1 block">Type</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="min-w-[11rem] rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-[16rem] flex-1 text-sm font-medium text-slate-700 sm:max-w-md">
            <span className="mb-1 block">Search</span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by document name"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm"
              />
            </span>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={selectedRows.length === 0}
            onClick={() => printMany(selectedRows)}
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-amber-600 bg-[var(--yellow-mid)] text-[var(--brand-dark)] shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Print selected"
            title="Print selected"
          >
            <Printer className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            disabled={selectedRows.length === 0}
            onClick={() => openEmailComposer(selectedRows)}
            className="flex h-11 w-11 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-amber-600 bg-[var(--yellow-mid)] text-[var(--brand-dark)] shadow-sm hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Email selected"
            title="Email selected"
          >
            <Mail className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      <div className={dashboardTableWrapperScrollClass}>
        <table className={`${dashboardTableClass} min-w-[640px] border-collapse`}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th scope="col" className={`${dashboardTableThClass} w-12`}>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-amber-800/50"
                  checked={allFilteredSelected}
                  ref={selectAllRef}
                  onChange={toggleAllFiltered}
                  aria-label="Select all visible rows"
                />
              </th>
              <th scope="col" className={dashboardTableThClass}>
                Document name
              </th>
              <th scope="col" className={dashboardTableThClass}>
                Collateral type
              </th>
              <th scope="col" className={`${dashboardTableThClass} w-48 text-center`}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No collaterals match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((row, index) => (
                <tr key={row.id} className={dashboardTableBodyRowClass(index)}>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-400"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.documentName}`}
                    />
                  </td>
                  <td className="px-4 py-2 font-medium">{row.documentName}</td>
                  <td className="px-4 py-2 text-slate-700">{row.collateralType}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => viewDocument(row)}
                        aria-label={`View ${row.documentName}`}
                      >
                        <Eye className="h-5 w-5" aria-hidden />
                        <span className="text-[0.65rem] font-medium text-[var(--brand-dark)]">View</span>
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => printDocument(row)}
                        aria-label={`Print ${row.documentName}`}
                      >
                        <Printer className="h-5 w-5" aria-hidden />
                        <span className="text-[0.65rem] font-medium text-[var(--brand-dark)]">Print</span>
                      </button>
                      <button
                        type="button"
                        className={iconBtn}
                        onClick={() => openEmailComposer([row])}
                        aria-label={`Email ${row.documentName}`}
                      >
                        <Mail className="h-5 w-5" aria-hidden />
                        <span className="text-[0.65rem] font-medium text-[var(--brand-dark)]">E-Mail</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SendCollateralEmailModal
        key={emailModalSession}
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        collaterals={emailModalCollaterals}
      />
    </div>
  )
}
