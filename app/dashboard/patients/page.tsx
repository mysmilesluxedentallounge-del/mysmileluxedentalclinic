import Link from "next/link"
import { ChevronLeft, ChevronRight, Eye, ListFilter, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import {
  dashboardPrimaryButtonClass,
  dashboardSecondaryButtonClass,
} from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableEmptyRowClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
import { deletePatientAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type PatientSearchParams = {
  q?: string
  gender?: string
  page?: string
  added?: string
}

const PAGE_SIZE = 10

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<PatientSearchParams>
}) {
  await requireAuth()
  const { q = "", gender = "", page = "1", added } = await searchParams
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
      {added ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Patient added successfully.
        </p>
      ) : null}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">Patients</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create and manage patient records.</p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className={dashboardPrimaryButtonClass}
        >
          <Plus className="size-4 shrink-0" aria-hidden />
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
            <button type="submit" className={dashboardPrimaryButtonClass}>
              <ListFilter className="size-4 shrink-0" aria-hidden />
              Apply
            </button>
            <Link href="/dashboard/patients" className={`${dashboardSecondaryButtonClass} border-slate-300 bg-white`}>
              <RotateCcw className="size-4 shrink-0" aria-hidden />
              Reset
            </Link>
          </div>
        </div>
      </form>

      <div className={dashboardTableWrapperClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Name</th>
              <th className={dashboardTableThClass}>Phone</th>
              <th className={dashboardTableThClass}>Email</th>
              <th className={dashboardTableThClass}>Gender</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient, index) => (
              <tr key={patient.id} className={dashboardTableBodyRowClass(index)}>
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{patient.full_name}</td>
                <td className="px-4 py-2">{patient.phone || "-"}</td>
                <td className="px-4 py-2">{patient.email || "-"}</td>
                <td className="px-4 py-2 capitalize">{patient.gender || "-"}</td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/dashboard/patients/${patient.id}/view`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100"
                      title="View"
                      aria-label="View patient"
                    >
                      <Eye className="size-3.5 shrink-0" aria-hidden />
                    </Link>
                    <Link
                      href={`/dashboard/patients/${patient.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-blue-200 text-blue-600 hover:bg-blue-50"
                      title="Edit"
                      aria-label="Edit patient"
                    >
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                    </Link>
                    <form action={deletePatientAction} className="inline">
                      <input type="hidden" name="patient_id" value={patient.id} />
                      <button
                        type="submit"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete"
                        aria-label="Delete patient"
                      >
                        <Trash2 className="size-3.5 shrink-0" aria-hidden />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 ? (
              <tr className={dashboardTableEmptyRowClass}>
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
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={getPageHref(Math.min(totalPages, currentPage + 1))}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${
                currentPage === totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Next
              <ChevronRight className="size-3.5 shrink-0" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  )
}
