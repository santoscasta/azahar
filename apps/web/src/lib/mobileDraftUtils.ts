import { deriveStatusFromView } from './scheduleUtils.js'
import type { QuickViewId } from '../pages/tasksSelectors.js'

export interface MobileDraftInput {
  title: string
  notes: string
  view: QuickViewId
  areaId: string | null
  projectId: string | null
  due_at: string | null
  labelIds: string[]
}

export function buildMobileTaskPayload(draft: MobileDraftInput) {
  return {
    title: draft.title.trim(),
    notes: draft.notes,
    status: deriveStatusFromView(draft.view),
    due_at: draft.due_at,
    project_id: draft.projectId,
    area_id: draft.areaId,
    labelIds: draft.labelIds,
  }
}
