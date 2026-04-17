import { cache } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Profile } from "@/lib/database.types"

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .maybeSingle()

  return (data as Profile | null) ?? null
})

export async function requireAuth() {
  const profile = await getCurrentProfile()
  if (!profile) {
    redirect("/login")
  }
  return profile
}

export async function requireAdmin() {
  const profile = await requireAuth()
  if (profile.role !== "admin") {
    redirect("/dashboard")
  }
  return profile
}
