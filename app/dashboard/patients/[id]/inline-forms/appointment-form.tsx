import { Save } from "lucide-react"
import { createAppointmentAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { BOOKING_TIME_SLOTS } from "@/lib/appointment-schedule"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import ChiefComplaintFields from "@/app/dashboard/appointments/chief-complaint-fields"
import SubmitButton from "@/app/dashboard/submit-button"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

function isDefaultDoctorName(name: string | null | undefined) {
  if (!name) return false
  const normalized = name.toLowerCase().replace(/\./g, "").trim()
  return normalized.includes("shridha") && normalized.includes("prabhu")
}

/** Inline "book appointment" form — the patient is fixed, so no patient picker. */
export default async function InlineAppointmentForm({
  patientId,
  redirectTo,
}: {
  patientId: string
  redirectTo: string
}) {
  const supabase = await createSupabaseServerClient()
  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "doctor")
    .order("full_name")

  const doctorList = (doctors as { id: string; full_name: string | null }[] | null) ?? []
  const defaultDoctor = doctorList.find((doctor) => isDefaultDoctorName(doctor.full_name)) ?? doctorList[0] ?? null
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={createAppointmentAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Doctor</FormLabel>
        <select name="doctor_id" required defaultValue={defaultDoctor?.id ?? ""} className={fieldClass}>
          <option value="">Select doctor</option>
          {doctorList.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.full_name || "Doctor"}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Date</FormLabel>
        <input name="appointment_date" type="date" required defaultValue={today} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Time slot</FormLabel>
        <select name="appointment_time" required defaultValue="" className={fieldClass}>
          <option value="">Select time slot</option>
          {BOOKING_TIME_SLOTS.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Status</span>
        <select name="status" defaultValue="scheduled" className={fieldClass}>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      <ChiefComplaintFields />

      <label className="block space-y-1">
        <span className={labelClass}>Notes (optional)</span>
        <textarea name="notes" className={fieldClass} />
      </label>

      <SubmitButton pendingText="Booking…" className={dashboardPrimaryButtonClass}>
        <Save className="size-4 shrink-0" aria-hidden />
        Save appointment
      </SubmitButton>
    </form>
  )
}
