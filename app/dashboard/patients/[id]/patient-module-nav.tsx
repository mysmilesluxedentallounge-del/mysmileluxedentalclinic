import Link from "next/link"
import { ClipboardCheck, FileText, FolderOpen, Stethoscope } from "lucide-react"

type PatientModuleNavProps = {
  patientId: string
  counts?: {
    oralExams?: number
    treatmentPlans?: number
    workDone?: number
  }
}

/** Clinical workflow entry points for a patient (Oral Exam → Treatment Plan → Work Done). */
export default function PatientModuleNav({ patientId, counts }: PatientModuleNavProps) {
  const modules = [
    {
      href: `/dashboard/patients/${patientId}/oral-exams`,
      label: "Oral Exams",
      description: "Record tooth-level findings",
      count: counts?.oralExams,
      icon: Stethoscope,
    },
    {
      href: `/dashboard/patients/${patientId}/treatment-plan`,
      label: "Treatment Plan",
      description: "Plan treatments from findings",
      count: counts?.treatmentPlans,
      icon: ClipboardCheck,
    },
    {
      href: `/dashboard/patients/${patientId}/work-done`,
      label: "Work Done",
      description: "Track completed treatments",
      count: counts?.workDone,
      icon: FileText,
    },
    {
      href: `/dashboard/patients/${patientId}/files`,
      label: "Files",
      description: "Oral images, X-rays, docs",
      count: undefined,
      icon: FolderOpen,
    },
  ]

  return (
    <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {modules.map((module) => {
        const Icon = module.icon
        return (
          <Link
            key={module.href}
            href={module.href}
            className="group flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:border-[var(--yellow-mid)] hover:bg-[var(--yellow-lightest)]/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--yellow-lightest)] text-[var(--brand-dark)]">
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="font-semibold text-[var(--brand-dark)]">{module.label}</span>
                {typeof module.count === "number" ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{module.count}</span>
                ) : null}
              </span>
              <span className="block text-xs text-muted-foreground">{module.description}</span>
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
