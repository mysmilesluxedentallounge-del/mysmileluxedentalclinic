"use client"

import Link from "next/link"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { Eye, Pencil } from "lucide-react"
import {
  BOOKING_TIME_SLOTS,
  TWO_HOUR_BLOCKS,
  normalizeAppointmentTime,
  type TwoHourBlock,
} from "@/lib/appointment-schedule"

export type SchedulerAppointment = {
  id: string
  patient_id: string
  appointment_date: string
  appointment_time: string
  status: "scheduled" | "completed" | "cancelled"
  treatment: string | null
  patients: { id: string; full_name: string; phone: string | null; email: string | null } | null
  profiles: { full_name: string | null } | null
}

export type SchedulerWeekDay = {
  date: string
  headerLabel: string
}

type CellTarget = {
  date: string
  block: TwoHourBlock
}

function slotKey(date: string, timeHHMM: string) {
  return `${date}T${timeHHMM}`
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}

export default function SchedulerView({
  weekDays,
  appointments,
}: {
  weekDays: SchedulerWeekDay[]
  appointments: SchedulerAppointment[]
}) {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const appointmentMap = useMemo(() => {
    const map = new Map<string, SchedulerAppointment[]>()
    for (const appt of appointments) {
      const time = normalizeAppointmentTime(appt.appointment_time)
      if (!time) continue
      const key = slotKey(appt.appointment_date, time)
      const list = map.get(key) ?? []
      list.push(appt)
      map.set(key, list)
    }
    return map
  }, [appointments])

  const [openCell, setOpenCell] = useState<CellTarget | null>(null)
  useBodyScrollLock(openCell !== null)

  const closeModal = useCallback(() => setOpenCell(null), [])

  useEffect(() => {
    if (!openCell) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openCell, closeModal])

  function blockVisualState(date: string, block: TwoHourBlock) {
    let scheduled = 0
    let completed = 0
    let cancelled = 0
    for (const value of block.slotValues) {
      const list = appointmentMap.get(slotKey(date, value)) ?? []
      for (const appt of list) {
        if (appt.status === "scheduled") scheduled += 1
        else if (appt.status === "completed") completed += 1
        else if (appt.status === "cancelled") cancelled += 1
      }
    }
    if (scheduled > 0) return "scheduled" as const
    if (completed > 0) return "completed" as const
    if (cancelled > 0) return "cancelled" as const
    return "empty" as const
  }

  function cellToneClasses(tone: ReturnType<typeof blockVisualState>) {
    switch (tone) {
      case "scheduled":
        return "bg-amber-100 border-amber-200 hover:bg-amber-200/60"
      case "completed":
        return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
      case "cancelled":
        return "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200/50"
      default:
        return "bg-white border-slate-200 hover:bg-slate-50"
    }
  }

  const slotLabelByValue = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of BOOKING_TIME_SLOTS) map.set(s.value, s.label)
    return map
  }, [])

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-white">
        <div
          className="grid min-w-[720px]"
          style={{
            gridTemplateColumns: `minmax(8.5rem, 0.9fr) repeat(${weekDays.length}, minmax(4.5rem, 1fr))`,
          }}
        >
          <div className="border-b border-r bg-slate-50 p-2" />
          {weekDays.map((day, colIndex) => {
            const isPast = day.date < todayISO
            const colBorder = colIndex < weekDays.length - 1 ? "border-r" : ""
            return (
              <div
                key={day.date}
                className={`border-b p-2 text-center text-xs font-semibold sm:text-sm ${colBorder} ${
                  isPast ? "bg-slate-100 text-slate-600" : "bg-amber-500 text-white"
                }`}
              >
                {day.headerLabel}
              </div>
            )
          })}

          {TWO_HOUR_BLOCKS.map((block) => (
            <Fragment key={block.index}>
              <div
                className="border-b border-r bg-slate-50 px-2 py-3 text-xs font-medium text-slate-700 sm:text-sm"
              >
                {block.rowLabel}
              </div>
              {weekDays.map((day, colIndex) => {
                const tone = blockVisualState(day.date, block)
                const isPast = day.date < todayISO
                const colBorder = colIndex < weekDays.length - 1 ? "border-r" : ""
                return (
                  <button
                    key={`${day.date}-${block.index}`}
                    type="button"
                    className={`cursor-pointer border-b ${colBorder} p-1 text-left text-xs transition-colors sm:p-2 sm:text-sm ${cellToneClasses(tone)} ${
                      isPast ? "opacity-75" : ""
                    } min-h-[3rem]`}
                    aria-label={`${day.headerLabel} ${block.rowLabel} — open time slots`}
                    onClick={() => setOpenCell({ date: day.date, block })}
                  >
                    {tone === "empty" ? (
                      <span className="text-slate-400">—</span>
                    ) : tone === "scheduled" ? (
                      <span className="font-medium text-amber-900">Booked</span>
                    ) : tone === "completed" ? (
                      <span className="font-medium text-emerald-800">Done</span>
                    ) : (
                      <span className="font-medium text-slate-600">Cancelled</span>
                    )}
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {openCell ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheduler-slot-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-white shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b px-4 py-3">
              <div>
                <h2 id="scheduler-slot-dialog-title" className="font-heading text-lg font-semibold">
                  {openCell.block.rowLabel}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {weekDays.find((d) => d.date === openCell.date)?.headerLabel ?? openCell.date}
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-md border px-2 py-1 text-sm text-slate-600 hover:bg-slate-50"
                onClick={closeModal}
                aria-label="Close"
              >
                Close
              </button>
            </div>
            <ul className="divide-y">
              {openCell.block.slotValues.map((value) => {
                const label = slotLabelByValue.get(value) ?? value
                const list = appointmentMap.get(slotKey(openCell.date, value)) ?? []
                return (
                  <li key={value} className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    {list.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">Available</p>
                    ) : (
                      <ul className="mt-2 space-y-3">
                        {list.map((appt) => (
                          <li key={appt.id} className="rounded-md border border-slate-100 bg-slate-50/80 p-3 text-sm">
                            <p className="font-medium text-slate-900">
                              {appt.patients?.full_name ?? "Unknown patient"}
                            </p>
                            {appt.patients?.phone ? (
                              <p className="mt-0.5 text-slate-600">{appt.patients.phone}</p>
                            ) : null}
                            {appt.patients?.email ? (
                              <p className="text-slate-600">{appt.patients.email}</p>
                            ) : null}
                            <p className="mt-1 capitalize text-slate-600">Status: {appt.status}</p>
                            {appt.profiles?.full_name ? (
                              <p className="text-slate-600">Doctor: {appt.profiles.full_name}</p>
                            ) : null}
                            {appt.treatment ? (
                              <p className="mt-1 text-slate-600">Treatment: {appt.treatment}</p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {appt.patients?.id ? (
                                <Link
                                  href={`/dashboard/patients/${appt.patients.id}`}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                                >
                                  <Eye className="size-3.5 shrink-0" aria-hidden />
                                  View patient details
                                </Link>
                              ) : null}
                              <Link
                                href={`/dashboard/appointments/${appt.id}`}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                              >
                                <Pencil className="size-3.5 shrink-0" aria-hidden />
                                Edit appointment
                              </Link>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
