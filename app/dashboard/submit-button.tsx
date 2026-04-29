"use client"

import type { ReactNode } from "react"
import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  children: ReactNode
  pendingText: string
  className?: string
}

export default function SubmitButton({ children, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  const mergedClass = [className, "cursor-pointer disabled:cursor-not-allowed"].filter(Boolean).join(" ")

  return (
    <button type="submit" disabled={pending} className={mergedClass}>
      {pending ? pendingText : children}
    </button>
  )
}

