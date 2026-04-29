/**
 * Shared list/table styling for dashboard data tables (cream + light yellow theme).
 */
export const dashboardTableWrapperClass =
  "overflow-hidden rounded-lg border border-amber-200/50 bg-[var(--brand-cream)] shadow-sm"

/** Use when the table needs horizontal scroll (e.g. wide columns). */
export const dashboardTableWrapperScrollClass =
  "overflow-x-auto rounded-lg border border-amber-200/50 bg-[var(--brand-cream)] shadow-sm"

export const dashboardTableClass = "w-full text-sm text-[var(--brand-dark)]"

export const dashboardTableHeadClass =
  "bg-[var(--yellow-light)] text-left text-[var(--brand-dark)]"

export const dashboardTableThClass = "px-4 py-2 font-semibold"

/** Zebra rows: light yellow tint alternating with cream. */
export function dashboardTableBodyRowClass(index: number) {
  return index % 2 === 0
    ? "border-t border-amber-200/50 bg-[var(--yellow-lightest)]/55"
    : "border-t border-amber-200/50 bg-[var(--brand-cream)]"
}

export const dashboardTableEmptyRowClass =
  "border-t border-amber-200/50 bg-[var(--yellow-lightest)]/40"
