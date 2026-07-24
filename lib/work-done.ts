/** Work Done domain: status vocabulary + helpers. */

import type { WorkDoneStatus } from "@/lib/database.types"

export const WORK_DONE_STATUS_VALUES: WorkDoneStatus[] = ["in_progress", "completed"]

export const WORK_DONE_STATUS_LABELS: Record<WorkDoneStatus, string> = {
  in_progress: "In Progress",
  completed: "Completed",
}

export function workDoneStatusOrDefault(raw: unknown): WorkDoneStatus {
  return raw === "completed" ? "completed" : "in_progress"
}
