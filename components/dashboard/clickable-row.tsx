"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"

type ClickableRowProps = {
  href: string
  className?: string
  children: ReactNode
}

/**
 * A table row that navigates to `href` when clicked, while leaving inner
 * interactive elements (links, buttons, forms, inputs) working normally.
 */
export default function ClickableRow({ href, className, children }: ClickableRowProps) {
  const router = useRouter()

  function navigateFromEvent(target: EventTarget | null) {
    if (target instanceof HTMLElement && target.closest("a,button,input,select,textarea,label,form,[data-no-row-nav]")) {
      return
    }
    router.push(href)
  }

  return (
    <tr
      onClick={(event) => navigateFromEvent(event.target)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(href)
      }}
      role="link"
      tabIndex={0}
      className={`cursor-pointer ${className ?? ""}`}
    >
      {children}
    </tr>
  )
}
