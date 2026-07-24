import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, Trash2, Upload } from "lucide-react"
import { requireAuth } from "@/lib/auth"
import { deletePatientFileAction, uploadPatientFileAction } from "@/lib/clinical-actions"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { PatientFile } from "@/lib/database.types"
import {
  FILE_CATEGORIES,
  PATIENT_FILES_BUCKET,
  fileCategoryLabel,
  isImageCategory,
  isValidFileCategory,
} from "@/lib/patient-files"
import { dashboardPrimaryButtonClass } from "@/lib/dashboard-action-styles"
import { FormLabel } from "@/components/form-label"
import SubmitButton from "@/app/dashboard/submit-button"

export default async function PatientFilesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; added?: string; deleted?: string; error?: string }>
}) {
  await requireAuth()
  const { id } = await params
  const { tab, added, deleted, error } = await searchParams
  const supabase = await createSupabaseServerClient()

  const { data: patient } = await supabase.from("patients").select("id, full_name").eq("id", id).maybeSingle()
  if (!patient) notFound()

  const activeTab = tab && isValidFileCategory(tab) ? tab : "oral_image"

  const { data: fileRows } = await supabase
    .from("patient_files")
    .select("id, patient_id, category, file_path, file_name, mime_type, label, uploaded_by, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })

  const files = (fileRows as PatientFile[] | null) ?? []
  const activeFiles = files.filter((file) => file.category === activeTab)

  // Signed URLs (private bucket) generated server-side with the service role.
  const signedUrls = new Map<string, string>()
  if (activeFiles.length > 0) {
    const admin = createSupabaseAdminClient()
    const { data: signed } = await admin.storage
      .from(PATIENT_FILES_BUCKET)
      .createSignedUrls(activeFiles.map((file) => file.file_path), 3600)
    for (const item of signed ?? []) {
      if (item.signedUrl && item.path) signedUrls.set(item.path, item.signedUrl)
    }
  }

  const countByCategory = new Map<string, number>()
  for (const file of files) countByCategory.set(file.category, (countByCategory.get(file.category) ?? 0) + 1)

  const errorMessage = error
    ? error === "no_file"
      ? "Please choose a file to upload."
      : error === "too_large"
        ? "File is too large (max 10 MB)."
        : `Upload failed: ${error}`
    : null

  return (
    <section className="space-y-6">
      {added ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">File uploaded.</p>
      ) : null}
      {deleted ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">File deleted.</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{errorMessage}</p>
      ) : null}

      <header>
        <Link href={`/dashboard/patients/${id}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="size-3.5 shrink-0" aria-hidden />
          Back to patient
        </Link>
        <h1 className="font-heading text-3xl">Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">{patient.full_name}</p>
      </header>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {FILE_CATEGORIES.map((category) => {
          const isActive = category.value === activeTab
          const count = countByCategory.get(category.value) ?? 0
          return (
            <Link
              key={category.value}
              href={`/dashboard/patients/${id}/files?tab=${category.value}`}
              className={`rounded-t-md px-4 py-2 text-sm ${
                isActive ? "bg-[var(--yellow-mid)] font-semibold text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category.label}
              {count > 0 ? <span className={`ml-1.5 text-xs ${isActive ? "text-white/80" : "text-slate-400"}`}>({count})</span> : null}
            </Link>
          )
        })}
      </div>

      {/* Upload form */}
      <form action={uploadPatientFileAction} className="rounded-lg border bg-white p-4">
        <input type="hidden" name="patient_id" value={id} />
        <input type="hidden" name="category" value={activeTab} />
        <h2 className="text-lg font-semibold">Add to {fileCategoryLabel(activeTab)}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <FormLabel required className="block text-sm font-medium text-slate-700">
              File
            </FormLabel>
            <input
              name="file"
              type="file"
              required
              accept={isImageCategory(activeTab) ? "image/*" : undefined}
              className="w-full rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-700">Label (optional)</span>
            <input name="label" placeholder="e.g. Pre-op scaling" className="w-full rounded-md border px-3 py-2 text-sm" />
          </label>
        </div>
        <SubmitButton pendingText="Uploading…" className={`${dashboardPrimaryButtonClass} mt-3`}>
          <Upload className="size-4 shrink-0" aria-hidden />
          Upload
        </SubmitButton>
        <p className="mt-2 text-xs text-muted-foreground">Max 10 MB per file.</p>
      </form>

      {/* Files grid */}
      {activeFiles.length === 0 ? (
        <p className="rounded-lg border bg-white p-6 text-sm text-muted-foreground">
          No {fileCategoryLabel(activeTab).toLowerCase()} uploaded yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activeFiles.map((file) => {
            const url = signedUrls.get(file.file_path)
            return (
              <div key={file.id} className="overflow-hidden rounded-lg border bg-white">
                <div className="flex items-center justify-between border-b bg-slate-50 px-3 py-1.5">
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Download className="size-3.5 shrink-0" aria-hidden />
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unavailable</span>
                  )}
                  <form action={deletePatientFileAction}>
                    <input type="hidden" name="patient_id" value={id} />
                    <input type="hidden" name="file_id" value={file.id} />
                    <input type="hidden" name="category" value={file.category} />
                    <SubmitButton pendingText="…" className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50">
                      <Trash2 className="size-3.5 shrink-0" aria-hidden />
                      Delete
                    </SubmitButton>
                  </form>
                </div>
                {isImageCategory(file.category) && url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed Storage URL, not a static asset
                  <img src={url} alt={file.label || file.file_name} className="h-40 w-full bg-slate-100 object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-slate-50 text-xs text-muted-foreground">
                    {file.mime_type || "Document"}
                  </div>
                )}
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium" title={file.file_name}>{file.label || file.file_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(file.created_at).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
