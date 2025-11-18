import type { Task, TaskLabelSummary } from './supabase.js'

export interface TaskFilterOptions {
  projectId?: string | null
  areaId?: string | null
  query?: string | null
  labelIds?: string[] | null
}

function normalizeQuery(query?: string | null) {
  return query?.trim().toLowerCase() ?? ''
}

function matchesProject(task: Task, projectId?: string | null, areaId?: string | null) {
  if (projectId) {
    return task.project_id === projectId
  }
  if (areaId) {
    return task.area_id === areaId
  }
  return true
}

function matchesQuery(task: Task, queryValue: string) {
  if (!queryValue) return true
  const title = task.title?.toLowerCase() ?? ''
  const notes = task.notes?.toLowerCase() ?? ''
  return title.includes(queryValue) || notes.includes(queryValue)
}

function matchesLabels(task: Task, labelIds?: string[] | null) {
  if (!labelIds || labelIds.length === 0) return true
  const labels = (task.labels ?? []) as TaskLabelSummary[]
  const labelSet = new Set(labels.map(label => label.id))
  return labelIds.every(labelId => labelSet.has(labelId))
}

export function applyTaskFilters(tasks: Task[], options: TaskFilterOptions) {
  const normalizedQuery = normalizeQuery(options.query)
  const labelIds = options.labelIds?.filter(Boolean)

  return tasks.filter(task => {
    if (!matchesProject(task, options.projectId, options.areaId)) return false
    if (!matchesQuery(task, normalizedQuery)) return false
    if (!matchesLabels(task, labelIds)) return false
    return true
  })
}
