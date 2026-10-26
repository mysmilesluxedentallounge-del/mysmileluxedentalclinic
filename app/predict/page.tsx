import Link from "next/link"
import {
  CalendarCheck,
  Camera,
  ClipboardList,
  Lock,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react"
import SmilePredictor from "./smile-predictor"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

// The counter has to reflect live data, so this page is never prerendered.
export const dynamic = "force-dynamic"

const MAIN_SITE_URL = "https://mysmileluxedentallounge.com"

async function fetchPredictionCount(): Promise<number | null> {
  try {
    const supabase = createSupabaseAdminClient()
    const { count, error } = await supabase
      .from("smile_predictions")
      .select("id", { count: "exact", head: true })
    if (error) return null
    return count ?? 0
  } catch {
    // Missing env vars or an unreachable DB must not take the page down.
    return null
  }
}

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Tell us who you are",
    body: "Just your name and number so our smile team can share your personalised plan afterwards.",
  },
  {
    icon: Camera,
    title: "2. Smile at your camera",
    body: "Line your smile up inside the on-screen guide in good light, then tap capture. Nothing is uploaded.",
  },
  {
    icon: Sparkles,
    title: "3. See your brighter smile",
    body: "We generate an instant before-and-after preview you can download and bring to your consultation.",
  },
]

const BENEFITS = [
  {
    icon: Timer,
    title: "Takes under a minute",
    body: "No appointment, no waiting room, no cost. See the possibility before you commit to anything.",
  },
  {
    icon: Lock,
    title: "Your photo stays on your phone",
    body: "The simulation runs inside your own browser. We never upload, store or share the image.",
  },
  {
    icon: ShieldCheck,
    title: "Reviewed by a specialist",
    body: "Dr. Shridha Prabhu and our team translate your preview into a realistic, honest treatment plan.",
  },
  {
    icon: CalendarCheck,
    title: "Straight into a consultation",
    body: "Like what you see? Bring your download to the clinic and we will plan the real thing.",
  },
]

export default async function PredictPage() {
  const predictionCount = await fetchPredictionCount()

  return (
    <main className="min-h-screen bg-[var(--brand-cream)] text-[var(--brand-dark)]">
      {/* Header */}
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <a href={MAIN_SITE_URL} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="MySmile Luxe Dental Lounge" className="h-10 w-auto" />
          </a>
          <a
            href={`${MAIN_SITE_URL}/book`}
            className="rounded-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Book a visit
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--grey-mid)]">
            Free · Instant · Private
          </span>
          <h1
            className="mt-3 text-4xl font-bold leading-tight sm:text-5xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            See your brighter smile before you book
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--grey-dark)] sm:text-lg">
            Our Smile Predictor shows you what professional whitening could do for your teeth — in
            about sixty seconds, from your own phone. Snap a photo, see the difference side by
            side, and download it to bring to your consultation.
          </p>

          {predictionCount !== null && (
            <div className="mt-8 inline-flex items-baseline gap-3 rounded-full border border-[var(--brand-gold)] bg-white px-6 py-3 shadow-sm">
              <span
                className="text-3xl font-bold text-[var(--brand-dark)]"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {predictionCount.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-medium text-[var(--grey-mid)]">
                {predictionCount === 1 ? "smile predicted" : "smiles predicted"} to date
              </span>
            </div>
          )}
        </div>
      </section>

      {/* How to use */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2
          className="mb-8 text-center text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          How to use the Smile Predictor
        </h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="rounded-xl border border-black/10 bg-white p-6 text-center shadow-sm"
            >
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--yellow-lightest)]">
                <step.icon size={22} className="text-[var(--brand-dark)]" />
              </span>
              <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--grey-mid)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* The tool */}
      <section id="start" className="mx-auto max-w-2xl px-4 pb-14 sm:px-6">
        <SmilePredictor />
      </section>

      {/* Why bother */}
      <section className="border-y border-black/5 bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Why your smile is worth the sixty seconds
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--grey-mid)] sm:text-base">
              Tea, coffee, tobacco and simply getting older all dull the enamel. Most people put off
              doing anything because they cannot picture the result. This removes the guesswork.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className="rounded-xl bg-[var(--brand-cream)] p-6">
                <benefit.icon size={22} className="mb-3 text-[var(--brand-dark)]" />
                <h3 className="mb-2 text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--grey-mid)]">{benefit.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honesty note + CTA */}
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
          What the preview can and cannot tell you
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--grey-dark)] sm:text-base">
          The Smile Predictor simulates the brightening effect of a professional whitening
          treatment. It is a visual guide, not a diagnosis. How white your teeth can actually go
          depends on your enamel thickness, the type of staining, existing fillings or crowns, and
          your gum health — all of which need a dentist to assess in person. If whitening is not
          right for you, we will tell you honestly and talk through alternatives such as veneers or
          smile designing.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`${MAIN_SITE_URL}/book`}
            className="rounded-lg bg-[var(--brand-dark)] px-7 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
          >
            Book your consultation
          </a>
          <a
            href={MAIN_SITE_URL}
            className="rounded-lg border border-black/15 px-7 py-3.5 text-base font-semibold transition hover:bg-white"
          >
            Explore our treatments
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--grey-mid)] sm:px-6">
          <p className="font-semibold text-[var(--brand-dark)]">MySmile Luxe Dental Lounge</p>
          <p className="mt-1">Level 2, SLN Terminus Mall, Gachibowli, Hyderabad 500032</p>
          <p className="mt-1">
            <a href="tel:+916304693676" className="underline underline-offset-2">
              +91 63046 93676
            </a>
            {" · "}
            <a href="mailto:mysmileluxedentallounge@gmail.com" className="underline underline-offset-2">
              mysmileluxedentallounge@gmail.com
            </a>
          </p>
          <p className="mt-4">
            <Link href={MAIN_SITE_URL} className="underline underline-offset-2">
              mysmileluxedentallounge.com
            </Link>
          </p>
        </div>
      </footer>
    </main>
  )
}
