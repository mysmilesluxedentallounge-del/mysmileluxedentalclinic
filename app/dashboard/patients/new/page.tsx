import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createPatientAction } from "@/lib/dashboard-actions"

export default async function NewPatientPage() {
  await requireAuth()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <Link href="/dashboard/patients" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          &larr; Back to patients
        </Link>
        <h1 className="font-heading text-3xl">Add patient</h1>
        <p className="text-sm text-muted-foreground">Enter patient details to create a new record.</p>
      </header>

      <form action={createPatientAction} className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="full_name" required placeholder="Full name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone" className="rounded-md border px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Email" className="rounded-md border px-3 py-2 text-sm" />
          <select name="gender" defaultValue="" className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input name="dob" type="date" className="rounded-md border px-3 py-2 text-sm" />
          <input name="address" placeholder="Address" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
          <textarea name="notes" placeholder="Notes" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save patient
        </button>
      </form>
    </section>
  )
}
