import { requireAuth } from "@/lib/auth"
import DashboardShell from "./dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireAuth()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:h-[100dvh] md:overflow-hidden">
      <DashboardShell profile={{ full_name: profile.full_name, role: profile.role }}>{children}</DashboardShell>
    </div>
  )
}
