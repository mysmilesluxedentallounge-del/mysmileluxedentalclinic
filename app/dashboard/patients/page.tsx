import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createPatientAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function PatientsPage() {
  await requireAuth()
  const supabase = await createSupabaseServerClient()
  const { data: patients } = await supabase
    .from("patients")
    .select("id, full_name, phone, email, created_at")
    .order("created_at", { ascending: false })

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl">Patients</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create and manage patient records.</p>
      </header>

      <form action={createPatientAction} className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Add patient</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input name="full_name" required placeholder="Full name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="phone" placeholder="Phone" className="rounded-md border px-3 py-2 text-sm" />
          <input name="email" type="email" placeholder="Email" className="rounded-md border px-3 py-2 text-sm" />
          <input name="dob" type="date" className="rounded-md border px-3 py-2 text-sm" />
          <input name="address" placeholder="Address" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
          <textarea name="notes" placeholder="Notes" className="rounded-md border px-3 py-2 text-sm md:col-span-2" />
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Save patient
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {patients?.map((patient) => (
              <tr key={patient.id} className="border-t">
                <td className="px-4 py-2">{patient.full_name}</td>
                <td className="px-4 py-2">{patient.phone || "-"}</td>
                <td className="px-4 py-2">{patient.email || "-"}</td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline">
                    View detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
