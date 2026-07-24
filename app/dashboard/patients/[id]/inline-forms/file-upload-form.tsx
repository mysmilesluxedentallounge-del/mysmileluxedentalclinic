import { Upload } from "lucide-react"
import { uploadPatientFileAction } from "@/lib/clinical-actions"
import { FILE_CATEGORIES } from "@/lib/patient-files"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import SubmitButton from "@/app/dashboard/submit-button"

const fieldClass = "w-full rounded-md border px-3 py-2 text-sm"
const labelClass = "block text-sm font-medium text-slate-700"

/** Inline file upload — oral images, X-rays, profile photo or documents. */
export default function InlineFileUploadForm({
  patientId,
  redirectTo,
}: {
  patientId: string
  redirectTo: string
}) {
  return (
    <form action={uploadPatientFileAction} className="space-y-3">
      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />

      <label className="block space-y-1">
        <FormLabel required className={labelClass}>Category</FormLabel>
        <select name="category" required defaultValue="oral_image" className={fieldClass}>
          {FILE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className={labelClass}>Label (optional)</span>
        <input name="label" placeholder="e.g. Pre-op scaling" className={fieldClass} />
      </label>
      <label className="block space-y-1">
        <FormLabel required className={labelClass}>File</FormLabel>
        <input
          name="file"
          type="file"
          required
          className={`${fieldClass} file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm`}
        />
      </label>

      <SubmitButton pendingText="Uploading…" className={dashboardPrimaryButtonClass}>
        <Upload className="size-4 shrink-0" aria-hidden />
        Upload
      </SubmitButton>
      <p className="text-xs text-muted-foreground">Max 10 MB per file.</p>
    </form>
  )
}
