import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { deletePatientAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PatientSearchParams = {
  q?: string
  gender?: string
  page?: string
}

const PAGE_SIZE = 10

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<PatientSearchParams>
}) {
  await requireAuth()
  const { q = "", gender = "", page = "1" } = await searchParams
  const searchQuery = q.trim()
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()
  let query = supabase.from("patients").select("id, full_name, phone, email, gender, created_at")

  if (gender && ["male", "female", "other"].includes(gender)) {
    query = query.eq("gender", gender)
  }

  const { data: patients } = await query.order("created_at", { ascending: false })

  const filteredPatients = (patients ?? []).filter((patient) => {
    if (!searchQuery) return true
    const haystack = `${patient.full_name ?? ""} ${patient.phone ?? ""} ${patient.email ?? ""}`.toLowerCase()
    return haystack.includes(searchQuery.toLowerCase())
  })
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + PAGE_SIZE)

  function getPageHref(nextPage: number) {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (gender) params.set("gender", gender)
    params.set("page", String(nextPage))
    return `/dashboard/patients?${params.toString()}`
  }

  return (
    <section className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Patients</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create and manage patient records.</p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add Patient
        </Link>
      </header>

      <form className="rounded-lg border bg-white p-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search name, phone, email"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
          <select name="gender" defaultValue={gender} className="rounded-md border px-3 py-2 text-sm">
            <option value="">All genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              Apply
            </button>
            <Link href="/dashboard/patients" className="rounded-md border px-4 py-2 text-sm font-medium">
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient, index) => (
              <tr key={patient.id} className="border-t">
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{patient.full_name}</td>
                <td className="px-4 py-2">{patient.phone || "-"}</td>
                <td className="px-4 py-2">{patient.email || "-"}</td>
                <td className="px-4 py-2 capitalize">{patient.gender || "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deletePatientAction}>
                      <input type="hidden" name="patient_id" value={patient.id} />
                      <button type="submit" className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-sm text-muted-foreground" colSpan={6}>
                  No patients found for current search/filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filteredPatients.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, filteredPatients.length)} of{" "}
            {filteredPatients.length}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={getPageHref(Math.max(1, currentPage - 1))}
              className={`rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={getPageHref(Math.min(totalPages, currentPage + 1))}
              className={`rounded-md border px-3 py-1 text-sm ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
