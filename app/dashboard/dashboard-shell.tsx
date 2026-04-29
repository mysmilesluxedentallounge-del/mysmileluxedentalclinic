"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  PiggyBank,
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

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (pathname.startsWith(`${href}/`)) return true
  if (href === "/dashboard/dashboard" && pathname === "/dashboard") return true
  return false
}

function isAppointmentsSectionActive(pathname: string) {
  return isNavActive(pathname, "/dashboard/appointments") || pathname.startsWith("/dashboard/scheduler")
}

function sidebarLinkClasses(active: boolean, collapsed: boolean) {
  const layout = collapsed ? "justify-center" : "gap-2"
  const base = `flex items-center rounded-md border-l-4 px-3 py-2 text-sm transition-colors ${layout}`
  if (active) {
    return `${base} border-[var(--yellow-mid)] bg-[var(--yellow-lightest)] font-semibold text-[var(--brand-dark)]`
  }
  return `${base} border-transparent text-slate-700 hover:bg-slate-100`
}

function mobileLinkClasses(active: boolean) {
  const base = "block rounded-md px-3 py-2"
  if (active) {
    return `${base} bg-[var(--yellow-lightest)] font-semibold text-[var(--brand-dark)] ring-2 ring-inset ring-[var(--yellow-mid)]/60`
  }
  return `${base} hover:bg-slate-100`
}

export default function DashboardShell({ children, profile }: DashboardShellProps) {
  const pathname = usePathname() ?? ""
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="dashboard-app-shell mx-auto min-h-screen max-w-7xl md:flex">
      <aside
        className={`hidden border-r bg-white p-4 transition-all duration-200 md:flex md:min-h-screen md:flex-col ${
          isCollapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <Link href="/dashboard/dashboard" className={isCollapsed ? "mx-auto" : ""} title="Dashboard Home">
            <Image
              src="/mainlogo.png"
              alt="MySmile Luxe Dental Lounge"
              width={isCollapsed ? 44 : 156}
              height={isCollapsed ? 44 : 64}
              className="h-auto w-auto max-w-full"
              priority
            />
          </Link>
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
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/dashboard"), isCollapsed)}
            href="/dashboard/dashboard"
            title="Dashboard"
            aria-current={isNavActive(pathname, "/dashboard/dashboard") ? "page" : undefined}
          >
            <LayoutDashboard size={16} />
            {!isCollapsed ? "Dashboard" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/patients"), isCollapsed)}
            href="/dashboard/patients"
            title="Patients"
            aria-current={isNavActive(pathname, "/dashboard/patients") ? "page" : undefined}
          >
            <Users size={16} />
            {!isCollapsed ? "Patients" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isAppointmentsSectionActive(pathname), isCollapsed)}
            href="/dashboard/appointments"
            title="Appointments"
            aria-current={isAppointmentsSectionActive(pathname) ? "page" : undefined}
          >
            <CalendarDays size={16} />
            {!isCollapsed ? "Appointments" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/billing"), isCollapsed)}
            href="/dashboard/billing"
            title="Billing"
            aria-current={isNavActive(pathname, "/dashboard/billing") ? "page" : undefined}
          >
            <Wallet size={16} />
            {!isCollapsed ? "Billing" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/information"), isCollapsed)}
            href="/dashboard/information"
            title="Information"
            aria-current={isNavActive(pathname, "/dashboard/information") ? "page" : undefined}
          >
            <FileText size={16} />
            {!isCollapsed ? "Information" : null}
          </Link>
          {profile.role === "admin" ? (
            <>
              <Link
                className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/users"), isCollapsed)}
                href="/dashboard/users"
                title="Users"
                aria-current={isNavActive(pathname, "/dashboard/users") ? "page" : undefined}
              >
                <UserRound size={16} />
                {!isCollapsed ? "Users" : null}
              </Link>
              <Link
                className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/doctors"), isCollapsed)}
                href="/dashboard/doctors"
                title="Doctors"
                aria-current={isNavActive(pathname, "/dashboard/doctors") ? "page" : undefined}
              >
                <Stethoscope size={16} />
                {!isCollapsed ? "Doctors" : null}
              </Link>
              <Link
                className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/budget"), isCollapsed)}
                href="/dashboard/budget"
                title="Budget"
                aria-current={isNavActive(pathname, "/dashboard/budget") ? "page" : undefined}
              >
                <PiggyBank size={16} />
                {!isCollapsed ? "Budget" : null}
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
                    <Link
                      className={mobileLinkClasses(isNavActive(pathname, "/dashboard/dashboard"))}
                      href="/dashboard/dashboard"
                      aria-current={isNavActive(pathname, "/dashboard/dashboard") ? "page" : undefined}
                    >
                      Dashboard
                    </Link>
                    <Link
                      className={mobileLinkClasses(isNavActive(pathname, "/dashboard/patients"))}
                      href="/dashboard/patients"
                      aria-current={isNavActive(pathname, "/dashboard/patients") ? "page" : undefined}
                    >
                      Patients
                    </Link>
                    <Link
                      className={mobileLinkClasses(isAppointmentsSectionActive(pathname))}
                      href="/dashboard/appointments"
                      aria-current={isAppointmentsSectionActive(pathname) ? "page" : undefined}
                    >
                      Appointments
                    </Link>
                    <Link
                      className={mobileLinkClasses(isNavActive(pathname, "/dashboard/billing"))}
                      href="/dashboard/billing"
                      aria-current={isNavActive(pathname, "/dashboard/billing") ? "page" : undefined}
                    >
                      Billing
                    </Link>
                    <Link
                      className={mobileLinkClasses(isNavActive(pathname, "/dashboard/information"))}
                      href="/dashboard/information"
                      aria-current={isNavActive(pathname, "/dashboard/information") ? "page" : undefined}
                    >
                      Information
                    </Link>
                    {profile.role === "admin" ? (
                      <>
                        <Link
                          className={mobileLinkClasses(isNavActive(pathname, "/dashboard/users"))}
                          href="/dashboard/users"
                          aria-current={isNavActive(pathname, "/dashboard/users") ? "page" : undefined}
                        >
                          Users
                        </Link>
                        <Link
                          className={mobileLinkClasses(isNavActive(pathname, "/dashboard/doctors"))}
                          href="/dashboard/doctors"
                          aria-current={isNavActive(pathname, "/dashboard/doctors") ? "page" : undefined}
                        >
                          Doctors
                        </Link>
                        <Link
                          className={mobileLinkClasses(isNavActive(pathname, "/dashboard/budget"))}
                          href="/dashboard/budget"
                          aria-current={isNavActive(pathname, "/dashboard/budget") ? "page" : undefined}
                        >
                          Budget
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
