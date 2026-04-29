"use client"

import { useMemo, useState } from "react"
import {
  CHIEF_COMPLAINT_OTHER_MAX,
  CHIEF_COMPLAINT_TAG_OPTIONS,
  type ChiefComplaintData,
} from "@/lib/chief-complaint"

type ChiefComplaintFieldsProps = {
  initial?: ChiefComplaintData
  className?: string
}

export default function ChiefComplaintFields({ initial, className = "" }: ChiefComplaintFieldsProps) {
  const hydrated = initial ?? { tags: [], other: "" }
  const [selected, setSelected] = useState(() => new Set<string>(hydrated.tags))
  const [other, setOther] = useState(hydrated.other)

  const orderedTags = useMemo(
    () => CHIEF_COMPLAINT_TAG_OPTIONS.filter((t) => selected.has(t)),
    [selected]
  )

  const hiddenValue = useMemo(() => {
    const o = other.trim()
    if (orderedTags.length === 0 && !o) return ""
    return JSON.stringify({
      tags: orderedTags,
      other: other.trim().slice(0, CHIEF_COMPLAINT_OTHER_MAX),
    })
  }, [orderedTags, other])

  const remaining = CHIEF_COMPLAINT_OTHER_MAX - other.length

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-4 [background-image:linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] [background-size:14px_14px] ${className}`}
    >
      <p className="text-sm font-medium text-slate-700">Chief Complaint(s)</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIEF_COMPLAINT_TAG_OPTIONS.map((tag) => {
          const isOn = selected.has(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setSelected((prev) => {
                  const next = new Set(prev)
                  if (next.has(tag)) next.delete(tag)
                  else next.add(tag)
                  return next
                })
              }}
              className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                isOn
                  ? "bg-[var(--yellow-lightest)] font-medium text-[var(--brand-dark)] ring-2 ring-inset ring-[var(--yellow-mid)]/70"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>

      <div className="mt-4 min-w-[12rem] max-w-md">
        <input
          type="text"
          value={other}
          onChange={(e) => setOther(e.target.value.slice(0, CHIEF_COMPLAINT_OTHER_MAX))}
          maxLength={CHIEF_COMPLAINT_OTHER_MAX}
          placeholder="» other chief complaint"
          className="w-full border-0 border-b-2 border-[#e67e22] bg-transparent px-0 py-1.5 text-sm text-slate-900 placeholder:italic placeholder:text-slate-400 focus:border-[#d35400] focus:outline-none focus:ring-0"
          autoComplete="off"
        />
        <p className={`mt-1 text-right text-xs ${remaining < 8 ? "text-amber-700" : "text-slate-500"}`}>
          {remaining} character(s) left
        </p>
      </div>

      <input type="hidden" name="chief_complaint" value={hiddenValue} readOnly />
    </div>
  )
}
