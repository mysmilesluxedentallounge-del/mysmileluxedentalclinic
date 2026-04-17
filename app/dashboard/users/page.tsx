import { requireAdmin } from "@/lib/auth"
import { createStaffUserAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function UsersPage() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })

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
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.full_name || "-"}</td>
                <td className="px-4 py-2 uppercase">{user.role}</td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
