import { requireAuth } from "@/lib/auth"
import InformationTable from "./information-table"

export default async function InformationPage() {
  await requireAuth()

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl text-black">Information collaterals</h1>
        {/* <p className="text-sm text-muted-foreground">
          Documents open in Google Drive. <strong>View</strong> uses your share link;{" "}
          <strong>Print</strong> opens Drive’s preview and starts the browser print dialog when allowed;{" "}
          <strong>E-Mail</strong> opens your mail app with the Drive link in the message.
        </p> */}
      </header>

      <InformationTable />
    </section>
  )
}
