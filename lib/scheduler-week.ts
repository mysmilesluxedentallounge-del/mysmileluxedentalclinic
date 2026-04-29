const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Add calendar days to a YYYY-MM-DD string (UTC-safe). */
export function addDaysToISODate(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Monday (UTC calendar) of the week containing the given YYYY-MM-DD. */
export function mondayOfWeekContainingISODate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00.000Z`)
  const dow = d.getUTCDay()
  const offset = (dow + 6) % 7
  d.setUTCDate(d.getUTCDate() - offset)
  return d.toISOString().slice(0, 10)
}

/** Inclusive week dates Monday–Sunday as YYYY-MM-DD. */
export function getWeekDayDates(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => addDaysToISODate(weekStart, index))
}

/** Resolve `week` query to week-start Monday YYYY-MM-DD (UTC-based week boundaries). */
export function resolveSchedulerWeekStart(weekParam: string | undefined) {
  const today = new Date().toISOString().slice(0, 10)
  if (!weekParam || !ISO_DATE_RE.test(weekParam)) {
    return mondayOfWeekContainingISODate(today)
  }
  return mondayOfWeekContainingISODate(weekParam)
}
