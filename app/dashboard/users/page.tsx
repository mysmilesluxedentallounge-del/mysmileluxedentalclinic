import Link from "next/link"
import { ChevronLeft, ChevronRight, Pencil, UserPlus } from "lucide-react"
import { requireAdmin } from "@/lib/auth"
import { dashboardEditActionClass, dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import {
  dashboardTableBodyRowClass,
  dashboardTableClass,
  dashboardTableHeadClass,
  dashboardTableThClass,
  dashboardTableWrapperClass,
} from "@/lib/dashboard-table"
import { createStaffUserAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

type UsersSearchParams = {
  page?: string
}

const PAGE_SIZE = 10

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<UsersSearchParams>
}) {
  await requireAdmin()
  const { page = "1" } = await searchParams
  const requestedPage = Math.max(1, Number(page) || 1)
  const supabase = await createSupabaseServerClient()

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
  const typedUsers = users ?? []
  const totalPages = Math.max(1, Math.ceil(typedUsers.length / PAGE_SIZE))
  const currentPage = Math.min(requestedPage, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const paginatedUsers = typedUsers.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-heading text-3xl">User Management</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Admin-only area for creating doctor and admin accounts.
        </p>
      </header>

      <form action={createStaffUserAction} className="rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Add new user</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Full name</span>
            <input name="full_name" required placeholder="Full name" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Email</span>
            <input name="email" required type="email" placeholder="Email" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Temporary password</span>
            <input
              name="password"
              required
              type="password"
              minLength={8}
              placeholder="Temporary password"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Role</span>
            <select name="role" defaultValue="doctor" className="w-full rounded-md border px-3 py-2 text-sm">
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <button type="submit" className={`${dashboardPrimaryButtonClass} mt-3`}>
          <UserPlus className="size-4 shrink-0" aria-hidden />
          Create user
        </button>
      </form>

      <div className={dashboardTableWrapperClass}>
        <table className={dashboardTableClass}>
          <thead className={dashboardTableHeadClass}>
            <tr>
              <th className={dashboardTableThClass}>S.No</th>
              <th className={dashboardTableThClass}>Name</th>
              <th className={dashboardTableThClass}>Role</th>
              <th className={dashboardTableThClass}>Created</th>
              <th className={dashboardTableThClass}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={user.id} className={dashboardTableBodyRowClass(index)}>
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{user.full_name || "-"}</td>
                <td className="px-4 py-2 uppercase">{user.role}</td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/users/${user.id}`} className={dashboardEditActionClass}>
                    <Pencil className="size-3.5 shrink-0" aria-hidden />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {typedUsers.length > 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, typedUsers.length)} of {typedUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/users?page=${Math.max(1, currentPage - 1)}`}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/users?page=${Math.min(totalPages, currentPage + 1)}`}
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
