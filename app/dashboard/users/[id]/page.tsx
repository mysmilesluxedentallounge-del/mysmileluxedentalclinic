import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { updateStaffUserAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string; pwd?: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const { updated, pwd } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: user } = await supabase.from("profiles").select("id, full_name, role").eq("id", id).maybeSingle()

  if (!user) {
    notFound()
  }

  return (
    <section className="space-y-6">
      {updated ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {pwd ? "User details and password updated successfully." : "User updated successfully."}
        </p>
      ) : null}

      <header className="space-y-2">
        <Link href="/dashboard/users" className="inline-flex items-center text-sm text-blue-600 hover:underline">
          &larr; Back to users
        </Link>
        <h1 className="font-heading text-3xl">Edit user</h1>
      </header>

      <form action={updateStaffUserAction} className="rounded-lg border bg-white p-5">
        <input type="hidden" name="user_id" value={user.id} />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            name="full_name"
            required
            defaultValue={user.full_name ?? ""}
            placeholder="Full name"
            className="rounded-md border px-3 py-2 text-sm"
          />
          <select name="role" defaultValue={user.role} className="rounded-md border px-3 py-2 text-sm">
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
          <input
            name="password"
            type="password"
            minLength={8}
            placeholder="New password (optional)"
            className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          />
          <p className="text-xs text-muted-foreground md:col-span-2">
            Leave password blank to keep current password. Admin can set a new password for any user.
          </p>
        </div>
        <button type="submit" className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Update user
        </button>
      </form>
    </section>
  )
}
