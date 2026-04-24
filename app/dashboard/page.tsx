import { redirect } from "next/navigation"

export default async function DashboardIndexPage() {
  redirect("/dashboard/dashboard")
}
