import type { MedicalHistoryData, MedicalHistoryKey } from "@/lib/patient-clinical"
import { PATIENT_NOTES_MAX } from "@/lib/patient-clinical"

const sectionHeaderClass =
  "flex cursor-pointer list-none items-center gap-2 bg-[var(--yellow-mid)] px-4 py-3 font-semibold text-white [&::-webkit-details-marker]:hidden"
const sectionBodyClass = "space-y-5 border border-t-0 border-slate-200 bg-white p-4"
const detailsClass = "overflow-hidden rounded-lg border border-slate-200"

type Option = { value: string; label: string }

function RadioRow({
  name,
  legend,
  options,
  defaultValue,
}: {
  name: string
  legend: string
  options: Option[]
  defaultValue?: string
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-800">{legend}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700">
            <input
              type="radio"
              name={name}
              value={opt.value}
              defaultChecked={defaultValue === opt.value}
              className="h-4 w-4 border-slate-400 text-amber-600"
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

const diabetesOpts: Option[] = [
  { value: "controlled", label: "Controlled" },
  { value: "uncontrolled", label: "Uncontrolled" },
  { value: "no", label: "No" },
  { value: "na", label: "NA" },
]

const pregnancyOpts: Option[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "no", label: "No" },
  { value: "na", label: "NA" },
]

const yesNoNa: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "na", label: "NA" },
]

const bpOpts: Option[] = [
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
  { value: "na", label: "NA" },
]

const dentalOpts: Option[] = [
  { value: "lt_6m", label: "Less than 6 month" },
  { value: "gt_6m", label: "More than 6 month" },
  { value: "gt_1y", label: "More than 1 year" },
]

function medicalDefault(h: MedicalHistoryData | null | undefined, key: MedicalHistoryKey) {
  return h?.[key] ?? ""
}

type PatientClinicalFieldsProps = {
  defaultMedicalHistory?: MedicalHistoryData | null
  defaultDentalVisit?: string | null
  defaultMedication?: string | null
  defaultAllergies?: string | null
  defaultPatientNotes?: string | null
}

export default function PatientClinicalFields({
  defaultMedicalHistory = null,
  defaultDentalVisit = null,
  defaultMedication = null,
  defaultAllergies = null,
  defaultPatientNotes = null,
}: PatientClinicalFieldsProps) {
  const mh = defaultMedicalHistory ?? {}

  return (
    <div className="space-y-4">
      <details open className={detailsClass}>
        <summary className={sectionHeaderClass}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 text-lg leading-none">
            −
          </span>
          Medical history
        </summary>
        <div className={`${sectionBodyClass} grid gap-6 md:grid-cols-2`}>
          <div className="space-y-5">
            <RadioRow
              name="mh_diabetes"
              legend="Diabetes"
              options={diabetesOpts}
              defaultValue={medicalDefault(mh, "diabetes")}
            />
            <RadioRow
              name="mh_pregnancy_trimester"
              legend="Pregnancy (Trimester)"
              options={pregnancyOpts}
              defaultValue={medicalDefault(mh, "pregnancy_trimester")}
            />
            <RadioRow
              name="mh_bleeding_disorder"
              legend="Bleeding disorder"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "bleeding_disorder")}
            />
            <RadioRow
              name="mh_tobacco"
              legend="Tobacco"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "tobacco")}
            />
            <RadioRow
              name="mh_epilepsy"
              legend="Epilepsy"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "epilepsy")}
            />
            <RadioRow
              name="mh_organ_lung_kidney_ulcer_thyroid"
              legend="Lung / Kidney Disease / Stomach Ulcer / Thyroid"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "organ_lung_kidney_ulcer_thyroid")}
            />
          </div>
          <div className="space-y-5">
            <RadioRow
              name="mh_blood_pressure"
              legend="Blood pressure"
              options={bpOpts}
              defaultValue={medicalDefault(mh, "blood_pressure")}
            />
            <RadioRow
              name="mh_cardiac"
              legend="Cardiac / Heart problem"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "cardiac")}
            />
            <RadioRow
              name="mh_hiv_hepatitis_herpes"
              legend="HIV / AIDS / Hepatitis / Herpes"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "hiv_hepatitis_herpes")}
            />
            <RadioRow
              name="mh_alcohol"
              legend="Alcohol"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "alcohol")}
            />
            <RadioRow
              name="mh_radiotherapy_cancer"
              legend="Radiotherapy / Cancer treatment"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "radiotherapy_cancer")}
            />
            <RadioRow
              name="mh_depression"
              legend="Depression"
              options={yesNoNa}
              defaultValue={medicalDefault(mh, "depression")}
            />
          </div>
        </div>
      </details>

      <details open className={detailsClass}>
        <summary className={sectionHeaderClass}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 text-lg leading-none">
            −
          </span>
          Dental visit
        </summary>
        <div className={sectionBodyClass}>
          <RadioRow
            name="dental_visit"
            legend="Do you have dental checkup on a regular basis?"
            options={dentalOpts}
            defaultValue={defaultDentalVisit ?? ""}
          />
        </div>
      </details>

      <details open className={detailsClass}>
        <summary className={sectionHeaderClass}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 text-lg leading-none">
            −
          </span>
          Medication
        </summary>
        <div className={sectionBodyClass}>
          <RadioRow name="medication" legend="Are you on medication?" options={yesNoNa} defaultValue={defaultMedication ?? ""} />
        </div>
      </details>

      <details open className={detailsClass}>
        <summary className={sectionHeaderClass}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 text-lg leading-none">
            −
          </span>
          Allergies
        </summary>
        <div className={sectionBodyClass}>
          <RadioRow
            name="allergies"
            legend="Allergies to any medications?"
            options={yesNoNa}
            defaultValue={defaultAllergies ?? ""}
          />
        </div>
      </details>

      <details open className={detailsClass}>
        <summary className={sectionHeaderClass}>
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white/80 text-lg leading-none">
            −
          </span>
          Patient notes
        </summary>
        <div className={sectionBodyClass}>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-700">Patient notes</span>
            <textarea
              name="patient_notes"
              maxLength={PATIENT_NOTES_MAX}
              defaultValue={defaultPatientNotes ?? ""}
              placeholder="Clinical notes, observations…"
              className="min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <span className="text-xs text-muted-foreground">Max. {PATIENT_NOTES_MAX} characters</span>
          </label>
        </div>
      </details>
    </div>
  )
}
