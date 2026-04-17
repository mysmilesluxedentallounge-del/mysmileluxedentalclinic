import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { updatePatientNotesAction } from "@/lib/dashboard-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  const supabase = await createSupabaseServerClient()

  const [{ data: patient }, { data: appointments }, { data: invoices }] = await Promise.all([
    supabase.from("patients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("appointments")
      .select("id, appointment_date, appointment_time, status, treatment")
      .eq("patient_id", id)
      .order("appointment_date", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, amount, status, invoice_date")
      .eq("patient_id", id)
      .order("invoice_date", { ascending: false }),
  ])

  if (!patient) {
    notFound()
  }

  return (
    <section className="space-y-6">
      <header className="rounded-lg border bg-white p-5">
        <h1 className="font-heading text-3xl">{patient.full_name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {patient.phone || "No phone"} | {patient.email || "No email"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{patient.address || "No address"}</p>
      </header>

      <form action={updatePatientNotesAction} className="rounded-lg border bg-white p-5">
        <h2 className="text-lg font-semibold">Clinical notes</h2>
        <input type="hidden" name="patient_id" value={patient.id} />
        <textarea
          name="notes"
          defaultValue={patient.notes ?? ""}
          className="mt-3 min-h-28 w-full rounded-md border px-3 py-2 text-sm"
        />
        <button type="submit" className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white">
          Update notes
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Appointments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {appointments?.map((item) => (
              <li key={item.id} className="rounded border p-3">
                <p>
                  {item.appointment_date} at {item.appointment_time}
                </p>
                <p className="text-muted-foreground">{item.status}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-lg border bg-white p-5">
          <h2 className="text-lg font-semibold">Invoices</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {invoices?.map((item) => (
              <li key={item.id} className="rounded border p-3">
                <p>Rs. {Number(item.amount).toFixed(2)}</p>
                <p className="text-muted-foreground">
                  {item.status} - {item.invoice_date}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
