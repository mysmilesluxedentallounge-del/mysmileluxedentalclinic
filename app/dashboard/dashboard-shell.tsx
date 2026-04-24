"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Stethoscope,
  Users,
  UserRound,
  Wallet,
  LogOut,
} from "lucide-react"
import { logoutAction } from "@/lib/actions"

type DashboardShellProps = {
  children: React.ReactNode
  profile: {
    full_name: string | null
    role: string
  }
}

export default function DashboardShell({ children, profile }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-7xl md:flex">
      <aside
        className={`hidden border-r bg-white p-4 transition-all duration-200 md:flex md:min-h-screen md:flex-col ${
          isCollapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {!isCollapsed ? <p className="font-heading text-2xl">Clinic Dashboard</p> : null}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-slate-100"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!isCollapsed ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {profile.full_name || "User"} ({profile.role})
          </p>
        ) : null}

        <nav className="mt-6 space-y-2 text-sm">
          <Link
            className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
            href="/dashboard/dashboard"
            title="Dashboard"
          >
            <LayoutDashboard size={16} />
            {!isCollapsed ? "Dashboard" : null}
          </Link>
          <Link
            className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
            href="/dashboard/patients"
            title="Patients"
          >
            <Users size={16} />
            {!isCollapsed ? "Patients" : null}
          </Link>
          <Link
            className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
            href="/dashboard/appointments"
            title="Appointments"
          >
            <CalendarDays size={16} />
            {!isCollapsed ? "Appointments" : null}
          </Link>
          <Link
            className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
            href="/dashboard/billing"
            title="Billing"
          >
            <Wallet size={16} />
            {!isCollapsed ? "Billing" : null}
          </Link>
          {profile.role === "admin" ? (
            <>
              <Link
                className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
                href="/dashboard/users"
                title="Users"
              >
                <UserRound size={16} />
                {!isCollapsed ? "Users" : null}
              </Link>
              <Link
                className={`flex items-center rounded-md px-3 py-2 hover:bg-slate-100 ${isCollapsed ? "justify-center" : "gap-2"}`}
                href="/dashboard/doctors"
                title="Doctors"
              >
                <Stethoscope size={16} />
                {!isCollapsed ? "Doctors" : null}
              </Link>
            </>
          ) : null}
        </nav>

        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className={`w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white ${
              isCollapsed ? "flex justify-center" : "flex items-center gap-2"
            }`}
          >
            <LogOut size={16} />
            {!isCollapsed ? "Logout" : null}
          </button>
        </form>
      </aside>

      <div className="flex-1">
        <div className="md:hidden">
          <header className="border-b bg-white px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading text-xl">Clinic Dashboard</p>
              <details className="relative">
                <summary className="cursor-pointer list-none rounded-md border px-3 py-2 text-sm font-medium">
                  Menu
                </summary>
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border bg-white p-2 shadow-lg">
                  <p className="px-2 py-1 text-xs text-muted-foreground">
                    {profile.full_name || "User"} ({profile.role})
                  </p>
                  <nav className="mt-1 space-y-1 text-sm">
                    <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/dashboard">
                      Dashboard
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/patients">
                      Patients
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/appointments">
                      Appointments
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/billing">
                      Billing
                    </Link>
                    {profile.role === "admin" ? (
                      <>
                        <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/users">
                          Users
                        </Link>
                        <Link className="block rounded-md px-3 py-2 hover:bg-slate-100" href="/dashboard/doctors">
                          Doctors
                        </Link>
                      </>
                    ) : null}
                  </nav>
                  <form action={logoutAction} className="mt-2">
                    <button
                      type="submit"
                      className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </header>
        </div>

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
