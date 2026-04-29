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
  const layout = collapsed ? "justify-center px-2" : "gap-2"
  const base = `flex items-center rounded-md border-l-4 py-2 text-sm transition-colors ${layout} ${collapsed ? "" : "px-3"}`
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
  const navIconSize = isCollapsed ? 15 : 18

  return (
    <div className="dashboard-app-shell mx-auto max-w-7xl min-h-screen md:flex md:h-[100dvh] md:min-h-0 md:overflow-hidden">
      <aside
        className={`hidden shrink-0 border-r bg-white p-4 transition-[width] duration-200 md:flex md:h-full md:min-h-0 md:flex-col ${
          isCollapsed ? "md:w-[4.5rem]" : "md:w-64"
        }`}
      >
        <div
          className={`flex shrink-0 gap-2 ${isCollapsed ? "flex-col items-stretch" : "items-start justify-between"}`}
        >
          <Link
            href="/dashboard/dashboard"
            className={
              isCollapsed
                ? "mx-auto flex size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-slate-200"
                : "shrink-0"
            }
            title="Dashboard Home"
          >
            <Image
              src="/mainlogo.png"
              alt="MySmile Luxe Dental Lounge"
              width={isCollapsed ? 36 : 156}
              height={isCollapsed ? 36 : 64}
              className={isCollapsed ? "size-9 object-cover" : "h-auto w-auto max-w-full"}
              priority
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className={`rounded-md border px-2 py-1 text-xs font-medium hover:bg-slate-100 ${isCollapsed ? "flex justify-center" : "shrink-0"}`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {!isCollapsed ? (
          <p className="mt-2 shrink-0 text-sm text-muted-foreground">
            {profile.full_name || "User"} ({profile.role})
          </p>
        ) : null}

        <nav className="mt-6 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto text-sm">
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/dashboard"), isCollapsed)}
            href="/dashboard/dashboard"
            title="Dashboard"
            aria-current={isNavActive(pathname, "/dashboard/dashboard") ? "page" : undefined}
          >
            <LayoutDashboard size={navIconSize} />
            {!isCollapsed ? "Dashboard" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/patients"), isCollapsed)}
            href="/dashboard/patients"
            title="Patients"
            aria-current={isNavActive(pathname, "/dashboard/patients") ? "page" : undefined}
          >
            <Users size={navIconSize} />
            {!isCollapsed ? "Patients" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isAppointmentsSectionActive(pathname), isCollapsed)}
            href="/dashboard/appointments"
            title="Appointments"
            aria-current={isAppointmentsSectionActive(pathname) ? "page" : undefined}
          >
            <CalendarDays size={navIconSize} />
            {!isCollapsed ? "Appointments" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/billing"), isCollapsed)}
            href="/dashboard/billing"
            title="Billing"
            aria-current={isNavActive(pathname, "/dashboard/billing") ? "page" : undefined}
          >
            <Wallet size={navIconSize} />
            {!isCollapsed ? "Billing" : null}
          </Link>
          <Link
            className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/information"), isCollapsed)}
            href="/dashboard/information"
            title="Information"
            aria-current={isNavActive(pathname, "/dashboard/information") ? "page" : undefined}
          >
            <FileText size={navIconSize} />
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
                <UserRound size={navIconSize} />
                {!isCollapsed ? "Users" : null}
              </Link>
              <Link
                className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/doctors"), isCollapsed)}
                href="/dashboard/doctors"
                title="Doctors"
                aria-current={isNavActive(pathname, "/dashboard/doctors") ? "page" : undefined}
              >
                <Stethoscope size={navIconSize} />
                {!isCollapsed ? "Doctors" : null}
              </Link>
              <Link
                className={sidebarLinkClasses(isNavActive(pathname, "/dashboard/budget"), isCollapsed)}
                href="/dashboard/budget"
                title="Budget"
                aria-current={isNavActive(pathname, "/dashboard/budget") ? "page" : undefined}
              >
                <PiggyBank size={navIconSize} />
                {!isCollapsed ? "Budget" : null}
              </Link>
            </>
          ) : null}
        </nav>

        <form action={logoutAction} className="mt-auto shrink-0 pt-4">
          <button
            type="submit"
            className={`w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white ${
              isCollapsed ? "flex justify-center px-2" : "flex items-center gap-2"
            }`}
          >
            <LogOut size={navIconSize} />
            {!isCollapsed ? "Logout" : null}
          </button>
        </form>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0 md:hidden">
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

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
