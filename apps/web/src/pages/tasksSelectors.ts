import type { Task, Project, Label, Area, TaskQuickView } from '../lib/supabase.js'
import { normalizeISODate } from '../lib/dateUtils.js'
import { translate, type Language } from '../lib/i18n.js'

export type QuickViewId = TaskQuickView

export interface ActiveFilterDescriptor {
  key: string
  label: string
  type: 'project' | 'label' | 'area'
  referenceId: string
  color?: string | null
}

const resolveTaskArea = (task: Task, projectMap?: Map<string, Pick<Project, 'area_id'>>) => {
  if (task.area_id) return task.area_id
  if (!task.project_id || !projectMap) return null
  return projectMap.get(task.project_id)?.area_id ?? null
}

const waitingLabels = new Set(['waiting', 'waiting for', 'en espera', 'espera', 'esperando'])
const referenceLabels = new Set(['reference', 'referencia', 'archivo', 'documentacion', 'documentación'])

export const getLabelQuickView = (labelName: string): QuickViewId | null => {
  const normalized = labelName.trim().toLowerCase()
  if (waitingLabels.has(normalized)) {
    return 'waiting'
  }
  if (referenceLabels.has(normalized)) {
    return 'reference'
  }
  return null
}

const resolveLabelQuickView = (task: Task): QuickViewId | null => {
  if (!task.labels || task.labels.length === 0) return null
  for (const label of task.labels) {
    const view = getLabelQuickView(label.name)
    if (view) return view
  }
  return null
}

export function normalizeDate(value?: string | null): string | null {
  return normalizeISODate(value)
}

export function buildQuickViewStats(tasks: Task[], todayISO: string) {
  const counts: Record<QuickViewId, number> = {
    inbox: 0,
    today: 0,
    upcoming: 0,
    anytime: 0,
    waiting: 0,
    someday: 0,
    reference: 0,
    logbook: 0,
  }

  tasks.forEach(task => {
    const view = getTaskView(task, todayISO)
    counts[view] += 1
  })

  return counts
}

export function filterTasksByQuickView(tasks: Task[], view: QuickViewId, todayISO: string) {
  return tasks.filter(task => getTaskView(task, todayISO) === view)
}

export function filterTasksForContext(
  tasks: Task[],
  view: QuickViewId,
  todayISO: string,
  selectedProjectId: string | null,
  selectedAreaId: string | null,
  projectMap?: Map<string, Pick<Project, 'area_id'>>
) {
  if (selectedProjectId) {
    return tasks.filter(task => task.project_id === selectedProjectId)
  }
  if (selectedAreaId) {
    return tasks.filter(task => resolveTaskArea(task, projectMap) === selectedAreaId)
  }
  return filterTasksByQuickView(tasks, view, todayISO)
}

export function getTaskView(task: Task, todayISO: string): QuickViewId {
  const serverQuickView = (task as { quick_view?: TaskQuickView }).quick_view
  if (serverQuickView) {
    return serverQuickView
  }
  if (task.status === 'done') {
    return 'logbook'
  }
  if (task.status === 'snoozed') {
    return 'someday'
  }
  const labelView = resolveLabelQuickView(task)
  if (labelView) {
    return labelView
  }

  const normalized = normalizeDate(task.due_at)

  if (normalized) {
    if (normalized <= todayISO) {
      return 'today'
    }
    return 'upcoming'
  }

  if (!task.project_id && !task.area_id) {
    return 'inbox'
  }

  return 'anytime'
}

export function buildActiveFilters(
  selectedProjectId: string | null,
  projects: Project[],
  selectedLabelIds: string[],
  labels: Label[],
  selectedAreaId: string | null,
  areas: Area[],
  language: Language
): ActiveFilterDescriptor[] {
  const filters: ActiveFilterDescriptor[] = []
  const areaLabel = translate(language, 'context.label.area')
  const projectLabel = translate(language, 'context.label.project')
  const labelsLabel = translate(language, 'task.labels')

  if (selectedAreaId) {
    const area = areas.find(item => item.id === selectedAreaId)
    if (area) {
      filters.push({
        key: `area-${area.id}`,
        label: `${areaLabel}: ${area.name}`,
        type: 'area',
        referenceId: area.id,
      })
    }
  }

  if (selectedProjectId) {
    const project = projects.find(item => item.id === selectedProjectId)
    if (project) {
      filters.push({
        key: `project-${project.id}`,
        label: `${projectLabel}: ${project.name}`,
        type: 'project',
        referenceId: project.id,
      })
    }
  }

  selectedLabelIds.forEach(labelId => {
    const label = labels.find(item => item.id === labelId)
    if (!label) return
    filters.push({
      key: `label-${label.id}`,
      label: `${labelsLabel}: ${label.name}`,
      type: 'label',
      referenceId: label.id,
      color: label.color,
    })
  })

  return filters
}

export function isFilteredView(
  activeView: QuickViewId,
  searchQuery: string,
  selectedProjectId: string | null,
  selectedLabelIds: string[],
  selectedAreaId: string | null
) {
  return (
    activeView !== 'inbox' ||
    !!searchQuery.trim() ||
    !!selectedProjectId ||
    !!selectedAreaId ||
    (selectedLabelIds && selectedLabelIds.length > 0)
  )
}
