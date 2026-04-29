/** 30-minute booking slots starting 09:00 (same count/algorithm as legacy forms). */
export const BOOKING_SLOT_COUNT = 19

export type BookingTimeSlot = {
  value: string
  label: string
}

/** Build HH:MM slots from day start hour and 30-minute steps. */
function buildBookingTimeSlots(startHour24: number, count: number): BookingTimeSlot[] {
  return Array.from({ length: count }, (_, index) => {
    const totalMinutes = startHour24 * 60 + index * 30
    const hours24 = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const value = `${String(hours24).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
    const hours12 = hours24 % 12 || 12
    const period = hours24 >= 12 ? "PM" : "AM"
    const label = `${hours12}:${String(minutes).padStart(2, "0")} ${period}`
    return { value, label }
  })
}

/** Clinic booking window: 09:00 through last start 18:00 (19 half-hour steps). */
export const BOOKING_TIME_SLOTS: BookingTimeSlot[] = buildBookingTimeSlots(9, BOOKING_SLOT_COUNT)

const DAY_START_MINUTES = 9 * 60

function timeValueToMinutes(value: string) {
  const [h, m] = value.split(":").map((part) => Number(part))
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

function minutesToValue(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export type TwoHourBlock = {
  /** Index from first block of the clinic day (0 = 09:00–11:00). */
  index: number
  /** Range start in HH:MM (inclusive for display). */
  rangeStartValue: string
  /** Range end in HH:MM (exclusive upper bound for slot classification). */
  rangeEndValue: string
  /** Display label, e.g. "9:00 AM – 11:00 AM". */
  rowLabel: string
  slotValues: string[]
  slots: BookingTimeSlot[]
}

function formatHHMM12(value: string) {
  const minutes = timeValueToMinutes(value)
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const hours12 = h24 % 12 || 12
  const period = h24 >= 12 ? "PM" : "AM"
  return `${hours12}:${String(m).padStart(2, "0")} ${period}`
}

function formatRangeLabel(startValue: string, endValue: string) {
  return `${formatHHMM12(startValue)} – ${formatHHMM12(endValue)}`
}

/** Group booking slots into contiguous 2-hour windows from 09:00. */
export const TWO_HOUR_BLOCKS: TwoHourBlock[] = (() => {
  const byBlock = new Map<
    number,
    { slotValues: string[]; rangeStartMin: number; rangeEndMin: number }
  >()

  for (const slot of BOOKING_TIME_SLOTS) {
    const minutes = timeValueToMinutes(slot.value)
    const blockIndex = Math.floor((minutes - DAY_START_MINUTES) / 120)
    const rangeStartMin = DAY_START_MINUTES + blockIndex * 120
    const rangeEndMin = rangeStartMin + 120

    let entry = byBlock.get(blockIndex)
    if (!entry) {
      entry = { slotValues: [], rangeStartMin, rangeEndMin }
      byBlock.set(blockIndex, entry)
    }
    entry.slotValues.push(slot.value)
  }

  const indices = [...byBlock.keys()].sort((a, b) => a - b)
  return indices.map((index) => {
    const entry = byBlock.get(index)!
    const rangeStartValue = minutesToValue(entry.rangeStartMin)
    const rangeEndValue = minutesToValue(entry.rangeEndMin)
    const slots = entry.slotValues.map((value) => BOOKING_TIME_SLOTS.find((s) => s.value === value)!)
    return {
      index,
      rangeStartValue,
      rangeEndValue,
      rowLabel: formatRangeLabel(rangeStartValue, rangeEndValue),
      slotValues: entry.slotValues,
      slots,
    }
  })
})()

/** Normalize DB or form time to HH:MM for map keys. */
export function normalizeAppointmentTime(time: string | null | undefined) {
  if (!time) return ""
  const trimmed = time.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ""
  const h = Number(match[1])
  const m = Number(match[2])
  if (Number.isNaN(h) || Number.isNaN(m)) return ""
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
