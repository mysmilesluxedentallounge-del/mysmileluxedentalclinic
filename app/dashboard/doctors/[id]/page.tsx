import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { updateDoctorAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function EditDoctorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { updated } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: doctor } = await supabase
    .from("profiles")
    .select("id, full_name, role, doctor_signature")
    .eq("id", id)
    .eq("role", "doctor")
    .maybeSingle()

  if (!doctor) {
    notFound()
  }

  return (
    <section className="space-y-6">
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Doctor updated successfully.
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href="/dashboard/doctors" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          &larr; Back to doctors
        </Link>
        <h1 className="font-heading text-3xl">Edit doctor</h1>
      </header>

      <form action={updateDoctorAction} className="rounded-lg border bg-white p-5">
        <input type="hidden" name="doctor_id" value={doctor.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="full_name"
            required
            defaultValue={doctor.full_name ?? ""}
            placeholder="Doctor name"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <input
            name="signature_file"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" name="clear_signature" />
            Remove existing signature
          </label>
          {doctor.doctor_signature ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-xs text-muted-foreground">Current signature preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={doctor.doctor_signature} alt="Doctor signature" className="max-h-20 rounded border p-2" />
            </div>
          ) : null}
        </div>
        <button type="submit" className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Update doctor
        </button>
      </form>
    </section>
  )
}
