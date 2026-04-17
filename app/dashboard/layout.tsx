import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { logoutAction } from "@/lib/actions"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-r bg-white p-5">
          <p className="font-heading text-2xl">Clinic Dashboard</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.full_name || "User"} ({profile.role})
          </p>

          <nav className="mt-6 space-y-2 text-sm">
            <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard">
              Overview
            </Link>
            <Link
              className="block rounded-md px-3 py-2 hover:bg-slate-100"
              href="/dashboard/patients"
            >
              Patients
            </Link>
            <Link
              className="block rounded-md px-3 py-2 hover:bg-slate-100"
              href="/dashboard/appointments"
            >
              Appointments
            </Link>
            <Link
              className="block rounded-md px-3 py-2 hover:bg-slate-100"
              href="/dashboard/billing"
            >
              Billing
            </Link>
            {profile.role === "admin" ? (
              <Link
                className="block rounded-md px-3 py-2 hover:bg-slate-100"
                href="/dashboard/users"
              >
                Users
              </Link>
            ) : null}
          </nav>

          <form action={logoutAction} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            >
              Logout
            </button>
          </form>
        </aside>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
