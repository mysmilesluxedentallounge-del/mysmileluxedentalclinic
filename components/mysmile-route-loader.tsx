import Image from "next/image"
import { cn } from "@/lib/utils"

type MysmileRouteLoaderProps = {
  className?: string
}

export default function MysmileRouteLoader({ className }: MysmileRouteLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex min-h-[100dvh] w-full flex-col items-center justify-center bg-gradient-to-b from-[var(--brand-cream)] via-white to-[var(--brand-cream)] px-4",
        className
      )}
    >
      <span className="sr-only">Loading</span>
      <div className="relative flex size-36 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-[3px] border-[var(--yellow-mid)]/25 border-t-[var(--yellow-mid)] border-r-[var(--yellow-mid)]/50 motion-safe:animate-spin"
          style={{ animationDuration: "0.9s" }}
          aria-hidden
        />
        <div className="relative z-10 flex size-[5.5rem] items-center justify-center rounded-full bg-white p-2.5 shadow-md ring-1 ring-slate-200/90">
          <Image
            src="/mainlogo.png"
            alt="MySmile Luxe Dental Lounge"
            width={140}
            height={90}
            className="h-auto w-full max-h-[3.25rem] object-contain"
            priority
          />
        </div>
      </div>
      <p className="mt-7 text-sm font-medium tracking-wide text-slate-500">Loading...</p>
    </div>
  )
}
