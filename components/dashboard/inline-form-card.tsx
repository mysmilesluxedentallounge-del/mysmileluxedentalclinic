"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { Plus, X } from "lucide-react"

type InlineFormCardProps = {
  title: string
  /** Pass a rendered icon element, e.g. <UserRound className="size-4" /> */
  icon: ReactNode
  viewAllHref?: string
  /** Label shown on the open panel and the + button tooltip. */
  addLabel?: string
  /** The add/edit form. Omit to render a card with no + button. */
  form?: ReactNode
  /** List / summary content. */
  children: ReactNode
}

/**
 * Dashboard card whose add-form opens inline from a "+" in the header (next to
 * "View all") and can be dismissed with the × or the Cancel button.
 */
export default function InlineFormCard({
  title,
  icon,
  viewAllHref,
  addLabel = "Add new",
  form,
  children,
}: InlineFormCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <article className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 bg-[var(--yellow-mid)] px-4 py-2.5 text-white">
        <div className="flex min-w-0 items-center gap-2">
          {icon}
          <span className="truncate font-semibold">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              className="rounded-md bg-white/20 px-2 py-1 text-xs font-medium text-white hover:bg-white/30"
            >
              View all
            </Link>
          ) : null}
          {form ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              title={open ? "Close" : addLabel}
              className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md bg-white/20 text-white hover:bg-white/30"
            >
              {open ? <X className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
              <span className="sr-only">{open ? "Close form" : addLabel}</span>
            </button>
          ) : null}
        </div>
      </div>

      {form && open ? (
        <div className="border-b border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">{addLabel}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <X className="size-3.5 shrink-0" aria-hidden />
              Cancel
            </button>
          </div>
          {form}
        </div>
      ) : null}

      <div className="p-4 text-sm">{children}</div>
    </article>
  )
}
