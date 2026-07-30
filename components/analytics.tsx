"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

/**
 * Google Analytics 4 (gtag) for the public marketing site only.
 *
 * - Loads only when NEXT_PUBLIC_GA_ID is set (so dev/preview stay clean).
 * - Never loads on /dashboard or /login, so patient IDs that appear in
 *   dashboard URLs are never sent to Google.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  const pathname = usePathname() ?? ""
  const isPrivate = pathname.startsWith("/dashboard") || pathname.startsWith("/login")

  if (!gaId || isPrivate) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  )
}
