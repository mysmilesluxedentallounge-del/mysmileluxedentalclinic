import Link from "next/link"
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { dashboardEditActionClass } from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const DEFAULT_DOCTOR_NAME = "Dr Shridha Prabhu"

function isDefaultDoctorName(name: string | null | undefined) {
  if (!name) return false
  const normalized = name.toLowerCase().replace(/\./g, "").trim()
  return normalized.includes("shridha") && normalized.includes("prabhu")
}

type DoctorRow = {
  id: string
  full_name: string | null
  created_at: string
}

type DoctorsSearchParams = {
  page?: string
}

const PAGE_SIZE = 10

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<DoctorsSearchParams>
}) {
  await requireAdmin()
  const { page = "1" } = await searchParams
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()

  const { data: doctors } = await supabase
    .from("profiles")
    .select("id, full_name, created_at")
    .eq("role", "doctor")
    .order("full_name")

  const defaultDoctor =
    (doctors as DoctorRow[] | null)?.find((doctor) => isDefaultDoctorName(doctor.full_name)) ?? null
  const typedDoctors = (doctors as DoctorRow[] | null) ?? []
  const totalPages = Math.max(1, Math.ceil(typedDoctors.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedDoctors = typedDoctors.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl">Doctors</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage doctor records and keep appointment defaults aligned.
        </p>
      </header>

      <article className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Default doctor</h2>
        <p className="mt-1 text-sm text-slate-700">{DEFAULT_DOCTOR_NAME}</p>
        <p className={`mt-2 text-sm ${defaultDoctor ? "text-emerald-600" : "text-red-600"}`}>
          {defaultDoctor
            ? "Configured in profiles table."
            : 'Not found. Add this doctor from Users page with role Doctor and name containing "Shridha Prabhu".'}
        </p>
      </article>

      <div className={dashboardTableWrapperClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Name</th>
              <th className={dashboardTableThClass}>Default</th>
              <th className={dashboardTableThClass}>Created</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDoctors.map((doctor, index) => {
              const isDefault = isDefaultDoctorName(doctor.full_name)
              return (
                <tr key={doctor.id} className={dashboardTableBodyRowClass(index)}>
                  <td className="px-4 py-2">{startIndex + index + 1}</td>
                  <td className="px-4 py-2">{doctor.full_name || "-"}</td>
                  <td className="px-4 py-2">{isDefault ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{new Date(doctor.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/doctors/${doctor.id}`} className={dashboardEditActionClass}>
                      <Pencil className="size-3.5 shrink-0" aria-hidden />
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {typedDoctors.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, typedDoctors.length)} of {typedDoctors.length}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/doctors?page=${Math.max(1, currentPage - 1)}`}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/doctors?page=${Math.min(totalPages, currentPage + 1)}`}
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
