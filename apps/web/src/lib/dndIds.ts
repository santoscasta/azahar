import type { QuickViewId } from '../pages/tasksSelectors.js'

const TASKLIST_PREFIX = 'tasklist'
const TARGET_PREFIX = 'target'
const HEADING_PREFIX = 'headings'

export type TaskListContext =
  | { kind: 'quick-view'; view: QuickViewId }
  | { kind: 'project-heading'; projectId: string; headingId: string | null }
  | { kind: 'area-project'; areaId: string; projectId: string | null }

export const buildQuickViewListId = (view: QuickViewId) =>
  `${TASKLIST_PREFIX}:view:${view}`

export const buildProjectHeadingListId = (projectId: string, headingId: string | null) =>
  `${TASKLIST_PREFIX}:project:${projectId}:heading:${headingId ?? 'none'}`

export const buildAreaProjectListId = (areaId: string, projectId: string | null) =>
  `${TASKLIST_PREFIX}:area:${areaId}:project:${projectId ?? 'none'}`

export const buildQuickViewTargetId = (view: QuickViewId) =>
  `${TARGET_PREFIX}:quick:${view}`

export const buildAreaTargetId = (areaId: string) =>
  `${TARGET_PREFIX}:area:${areaId}`

export const buildProjectTargetId = (projectId: string) =>
  `${TARGET_PREFIX}:project:${projectId}`

export const buildHeadingDropId = (projectId: string) =>
  `${HEADING_PREFIX}:project:${projectId}`

export const parseTaskListId = (id: string): TaskListContext | null => {
  const parts = id.split(':')
  if (parts[0] !== TASKLIST_PREFIX) {
    return null
  }
  if (parts[1] === 'view') {
    const view = parts[2] as QuickViewId | undefined
    if (!view) return null
    return { kind: 'quick-view', view }
  }
  if (parts[1] === 'project' && parts[3] === 'heading') {
    const projectId = parts[2]
    const headingRaw = parts[4]
    if (!projectId || !headingRaw) return null
    return { kind: 'project-heading', projectId, headingId: headingRaw === 'none' ? null : headingRaw }
  }
  if (parts[1] === 'area' && parts[3] === 'project') {
    const areaId = parts[2]
    const projectRaw = parts[4]
    if (!areaId || !projectRaw) return null
    return { kind: 'area-project', areaId, projectId: projectRaw === 'none' ? null : projectRaw }
  }
  return null
}

export const parseQuickViewTargetId = (id: string): QuickViewId | null => {
  if (!id.startsWith(`${TARGET_PREFIX}:quick:`)) {
    return null
  }
  const parts = id.split(':')
  return (parts[2] as QuickViewId | undefined) || null
}

export const parseAreaTargetId = (id: string): string | null => {
  if (!id.startsWith(`${TARGET_PREFIX}:area:`)) {
    return null
  }
  const parts = id.split(':')
  return parts[2] || null
}

export const parseProjectTargetId = (id: string): string | null => {
  if (!id.startsWith(`${TARGET_PREFIX}:project:`)) {
    return null
  }
  const parts = id.split(':')
  return parts[2] || null
}

export const parseHeadingDropId = (id: string): string | null => {
  if (!id.startsWith(`${HEADING_PREFIX}:project:`)) {
    return null
  }
  const parts = id.split(':')
  return parts[2] || null
}
