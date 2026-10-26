"use client"

import { useRef, useTransition } from "react"
import { updateSmilePredictionStatusAction } from "@/lib/smile-prediction-actions"
import {
  SMILE_PREDICTION_STATUSES,
  SMILE_PREDICTION_STATUS_LABELS,
  SMILE_PREDICTION_STATUS_STYLES,
  type SmilePredictionStatus,
} from "@/lib/smile-predictions"

/** Status dropdown that submits on change, with no separate save button. */
export default function SmilePredictionStatusSelect({
  id,
  status,
}: {
  id: string
  status: SmilePredictionStatus
}) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form ref={formRef} action={updateSmilePredictionStatusAction} className="inline-flex">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        disabled={isPending}
        aria-label="Lead status"
        onChange={(event) => {
          const form = event.currentTarget.form
          startTransition(() => form?.requestSubmit())
        }}
        className={`rounded-full border px-3 py-1 text-xs font-semibold outline-none transition disabled:opacity-60 ${SMILE_PREDICTION_STATUS_STYLES[status]}`}
      >
        {SMILE_PREDICTION_STATUSES.map((value) => (
          <option key={value} value={value}>
            {SMILE_PREDICTION_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </form>
  )
}
