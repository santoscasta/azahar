import type { Task, Project, Label, Area, TaskQuickView } from '../lib/supabase.js'

export type QuickViewId = TaskQuickView

export interface ActiveFilterDescriptor {
  key: string
  label: string
  type: 'project' | 'label' | 'area'
  referenceId: string
}

export function normalizeDate(value?: string | null): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function buildQuickViewStats(tasks: Task[], todayISO: string) {
  const counts: Record<QuickViewId, number> = {
    inbox: 0,
    today: 0,
    upcoming: 0,
    anytime: 0,
    someday: 0,
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
  selectedAreaId: string | null
) {
  if (selectedProjectId) {
    return tasks.filter(task => task.project_id === selectedProjectId)
  }
  if (selectedAreaId) {
    return tasks.filter(task => task.area_id === selectedAreaId)
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
  areas: Area[]
): ActiveFilterDescriptor[] {
  const filters: ActiveFilterDescriptor[] = []

  if (selectedAreaId) {
    const area = areas.find(item => item.id === selectedAreaId)
    if (area) {
      filters.push({
        key: `area-${area.id}`,
        label: `Área: ${area.name}`,
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
        label: `Proyecto: ${project.name}`,
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
      label: `Etiqueta: ${label.name}`,
      type: 'label',
      referenceId: label.id,
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
