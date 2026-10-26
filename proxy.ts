import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createSupabaseProxyClient } from "@/lib/supabase/middleware"

const DASHBOARD_PATH = "/dashboard"
const LOGIN_PATH = "/login"
const ADMIN_PATH = "/dashboard/users"

/** predict.<domain> serves the Smile Predictor at its own root. */
const PREDICT_HOST_PREFIX = "predict."
const PREDICT_PATH = "/predict"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const host = (request.headers.get("host") ?? "").toLowerCase()

  // Host-based routing for the Smile Predictor subdomain. The rewrite keeps the
  // visitor's URL at the bare domain while rendering app/predict.
  if (host.startsWith(PREDICT_HOST_PREFIX)) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL(PREDICT_PATH, request.url))
    }
    if (!pathname.startsWith(PREDICT_PATH)) {
      // The subdomain exists only for the predictor; send anything else there.
      return NextResponse.redirect(new URL(PREDICT_PATH, request.url))
    }
    return NextResponse.next()
  }

  const isDashboard = pathname.startsWith(DASHBOARD_PATH)
  const isLogin = pathname.startsWith(LOGIN_PATH)

  // Only the authenticated areas need a Supabase round-trip; everything else
  // (now that the matcher is broad enough for host routing) passes straight on.
  if (!isDashboard && !isLogin) {
    return NextResponse.next()
  }

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
  // Broad enough to see "/" for subdomain routing, but skipping API routes,
  // build output and static assets so the proxy stays off the hot path.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|mov|txt|xml|webmanifest)$).*)",
  ],
}
