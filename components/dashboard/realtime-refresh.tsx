"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

type RealtimeRefreshProps = {
  /** Postgres tables to watch for INSERT/UPDATE/DELETE. */
  tables: string[]
  /** Optional debounce (ms) so bursts of changes trigger a single refresh. */
  debounceMs?: number
}

/**
 * Subscribes to Supabase Realtime for the given tables and calls
 * router.refresh() on any change, so the server-rendered dashboard updates
 * live (e.g. a booking made on the marketing site appears without reloading).
 *
 * Requires the tables to be in the `supabase_realtime` publication.
 */
export default function RealtimeRefresh({ tables, debounceMs = 400 }: RealtimeRefreshProps) {
  const router = useRouter()
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase.channel(`dashboard-realtime-${tables.join("-")}`)

    const scheduleRefresh = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => router.refresh(), debounceMs)
    }

    for (const table of tables) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh)
    }

    channel.subscribe()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      supabase.removeChannel(channel)
    }
  }, [router, tables, debounceMs])

  return null
}
