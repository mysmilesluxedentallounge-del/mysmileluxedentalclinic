import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createSupabaseProxyClient } from "@/lib/supabase/middleware"

const DASHBOARD_PATH = "/dashboard"
const LOGIN_PATH = "/login"
const ADMIN_PATH = "/dashboard/users"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith(DASHBOARD_PATH)
  const isLogin = pathname.startsWith(LOGIN_PATH)
  const hasSupabaseEnv =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasSupabaseEnv) {
    if (isDashboard) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
    }
    return NextResponse.next()
  }

  const { supabase, response } = createSupabaseProxyClient(request)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isDashboard && !user) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  if (isLogin && user) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
  }

  if (pathname.startsWith(ADMIN_PATH) && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
