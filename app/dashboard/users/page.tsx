import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
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
          <input name="full_name" required placeholder="Full name" className="rounded-md border px-3 py-2 text-sm" />
          <input name="email" required type="email" placeholder="Email" className="rounded-md border px-3 py-2 text-sm" />
          <input
            name="password"
            required
            type="password"
            minLength={8}
            placeholder="Temporary password"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select name="role" defaultValue="doctor" className="rounded-md border px-3 py-2 text-sm">
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Create user
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-4 py-2">S.No</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{startIndex + index + 1}</td>
                <td className="px-4 py-2">{user.full_name || "-"}</td>
                <td className="px-4 py-2 uppercase">{user.role}</td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-2">
                  <Link href={`/dashboard/users/${user.id}`} className="text-blue-600 hover:underline">
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
              className={`rounded-md border px-3 py-1 text-sm ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
            >
              Previous
            </Link>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Link
              href={`/dashboard/users?page=${Math.min(totalPages, currentPage + 1)}`}
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
