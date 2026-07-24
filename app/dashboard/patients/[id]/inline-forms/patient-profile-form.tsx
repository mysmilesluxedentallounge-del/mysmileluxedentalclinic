import { Save } from "lucide-react"
import { updatePatientDetailsAction } from "@/lib/dashboard-actions"
import type { Patient } from "@/lib/database.types"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import SubmitButton from "@/app/dashboard/submit-button"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline patient profile editor — saves without leaving the page. */
export default function InlinePatientProfileForm({
  patient,
  redirectTo,
}: {
  patient: Pick<Patient, "id" | "full_name" | "phone" | "email" | "gender" | "dob" | "address">
  redirectTo: string
}) {
  return (
    <form action={updatePatientDetailsAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patient.id} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Full name</FormLabel>
        <input name="full_name" required defaultValue={patient.full_name ?? ""} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Phone</span>
        <input name="phone" defaultValue={patient.phone ?? ""} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Email</span>
        <input name="email" type="email" defaultValue={patient.email ?? ""} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Gender</span>
        <select name="gender" defaultValue={patient.gender ?? ""} className={fieldClass}>
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Date of birth</span>
        <input name="dob" type="date" defaultValue={patient.dob ?? ""} className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Address</span>
        <input name="address" defaultValue={patient.address ?? ""} className={fieldClass} />
      </label>

      <SubmitButton pendingText="Saving…" className={dashboardPrimaryButtonClass}>
        <Save className="size-4 shrink-0" aria-hidden />
        Save profile
      </SubmitButton>
    </form>
  )
}
