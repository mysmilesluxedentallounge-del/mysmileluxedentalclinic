import type { OralExaminationFinding } from "@/lib/database.types"
import { findingKeysFromRow, surfaceFindingSummary } from "@/lib/oral-examination"
import { suggestTreatmentsForFindings } from "@/lib/treatment-catalog"
import { toothLabel } from "@/lib/dental-charting"

type ExamFindingsTableProps = {
  findings: OralExaminationFinding[]
  /** When true, adds a Treatment Need(s) column derived from each tooth's findings. */
  showTreatmentNeeds?: boolean
}

/** Read-only presentation of the per-tooth findings of an oral examination. */
export default function ExamFindingsTable({ findings, showTreatmentNeeds = false }: ExamFindingsTableProps) {
  const colSpan = showTreatmentNeeds ? 6 : 5

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-[var(--yellow-mid)] text-left text-white">
          <tr>
            <th className="px-3 py-2 font-semibold">Tooth No.</th>
            <th className="px-3 py-2 font-semibold">Tooth Site &amp; Perio</th>
            <th className="px-3 py-2 font-semibold">Soft Tissue</th>
            <th className="px-3 py-2 font-semibold">Hard Tissue</th>
            {showTreatmentNeeds ? <th className="px-3 py-2 font-semibold">Treatment Need(s)</th> : null}
            <th className="px-3 py-2 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {findings.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="px-3 py-4 text-muted-foreground">
                No findings recorded.
              </td>
            </tr>
          ) : (
            findings.map((finding) => {
              const needs = showTreatmentNeeds
                ? suggestTreatmentsForFindings(findingKeysFromRow(finding))
                : null
              return (
                <tr key={finding.id} className="border-t border-slate-100 align-top">
                  <td className="px-3 py-2 font-medium">{toothLabel(finding.tooth_number)}</td>
                  <td className="px-3 py-2">{surfaceFindingSummary(finding.tooth_site_perio) || "NA"}</td>
                  <td className="px-3 py-2">{surfaceFindingSummary(finding.soft_tissue) || "NA"}</td>
                  <td className="px-3 py-2">{surfaceFindingSummary(finding.hard_tissue) || "NA"}</td>
                  {showTreatmentNeeds ? (
                    <td className="px-3 py-2">
                      {needs && (needs.primary.length > 0 || needs.secondary.length > 0) ? (
                        <div className="space-y-1">
                          {needs.primary.length > 0 ? (
                            <p>
                              <span className="font-medium text-slate-600">Primary:</span>{" "}
                              {needs.primary.join(", ")}
                            </p>
                          ) : null}
                          {needs.secondary.length > 0 ? (
                            <p>
                              <span className="font-medium text-slate-600">Secondary:</span>{" "}
                              {needs.secondary.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        "NA"
                      )}
                    </td>
                  ) : null}
                  <td className="px-3 py-2 text-muted-foreground">{finding.notes?.trim() || "NA"}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
