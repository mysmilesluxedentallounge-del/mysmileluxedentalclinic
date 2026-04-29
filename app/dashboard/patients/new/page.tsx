import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { createPatientAction } from "@/lib/dashboard-actions"
import SubmitButton from "@/app/dashboard/submit-button"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import PatientClinicalFields from "@/app/dashboard/patients/patient-clinical-fields"

export default async function NewPatientPage() {
  await requireAuth()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Link href="/dashboard/patients" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to patients
        </Link>
        <h1 className="font-heading text-3xl">Add patient</h1>
        <p className="text-sm text-muted-foreground">Enter patient details to create a new record.</p>
      </header>

      <form action={createPatientAction} className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Full name</span>
            <input name="full_name" required placeholder="Full name" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" placeholder="Phone" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Email</span>
            <input name="email" type="email" placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Gender</span>
            <select name="gender" defaultValue="" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Date of birth</span>
            <input name="dob" type="date" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Address</span>
            <input name="address" placeholder="Address" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Clinical information</h2>
          <PatientClinicalFields />
        </div>

        <SubmitButton
          pendingText="Saving patient..."
          className={`${dashboardPrimaryButtonClass} mt-3 disabled:opacity-60`}
        >
          <Save className="size-4 shrink-0" aria-hidden />
          Save patient
        </SubmitButton>
      </form>
    </section>
  )
}
