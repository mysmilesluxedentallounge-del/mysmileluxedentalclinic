"use client"

import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const email = String(formData.get("email") ?? "")
    const password = String(formData.get("password") ?? "")
    const supabase = createSupabaseBrowserClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border bg-white p-8 shadow-sm">
        <div className="mb-5 flex justify-center">
          <Image
            src="/mainlogo.png"
            alt="MySmile Luxe Dental Lounge"
            width={88}
            height={88}
            className="rounded-full object-contain"
            priority
          />
        </div>
        <h1 className="font-heading text-3xl text-brand-dark">Doctor Portal Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Login as admin or doctor to manage patients, appointments, and billing.
        </p>

        <form action={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-md border px-3 py-2 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.86 3-5.1 5.45-6.45" />
                    <path d="M1 1l22 22" />
                    <path d="M9.53 9.53a3 3 0 0 0 4.24 4.24" />
                    <path d="M14.47 14.47 9.53 9.53" />
                    <path d="M21 12c-.73 2.06-2 3.93-3.56 5.35" />
                    <path d="M12 4c5 0 9.27 3.11 11 8a12.4 12.4 0 0 1-.82 1.85" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  )
}
