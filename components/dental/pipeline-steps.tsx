import { Fragment } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export type PipelineStep = "oral-exam" | "treatment-plan" | "work-done"

const STEPS: { key: PipelineStep; label: string; segment: string }[] = [
  { key: "oral-exam", label: "Oral Exam", segment: "oral-exams" },
  { key: "treatment-plan", label: "Treatment Plan", segment: "treatment-plan" },
  { key: "work-done", label: "Work Done", segment: "work-done" },
]

/** Horizontal 3-step pipeline shown on each clinical module page for the patient. */
export default function PipelineSteps({ patientId, current }: { patientId: string; current: PipelineStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === current)

  return (
    <nav className="flex flex-wrap items-center gap-1 rounded-lg border bg-white p-2 text-sm">
      {STEPS.map((step, index) => {
        const href = `/dashboard/patients/${patientId}/${step.segment}`
        const isCurrent = index === currentIndex
        const isDone = index < currentIndex
        return (
          <Fragment key={step.key}>
            <Link
              href={href}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                isCurrent
                  ? "bg-[var(--yellow-mid)] font-semibold text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span
                className={`flex size-5 items-center justify-center rounded-full text-xs font-semibold ${
                  isCurrent ? "bg-white text-[var(--brand-dark)]" : isDone ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {index + 1}
              </span>
              {step.label}
            </Link>
            {index < STEPS.length - 1 ? <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden /> : null}
          </Fragment>
        )
      })}
    </nav>
  )
}
