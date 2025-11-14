import type { Task, Project, Label } from '../lib/supabase'

export type QuickViewId = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'logbook'

export interface ActiveFilterDescriptor {
  key: string
  label: string
  type: 'project' | 'label'
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

export function getTaskView(task: Task, todayISO: string): QuickViewId {
  if (task.status === 'done') {
    return 'logbook'
  }
  if (task.status === 'snoozed') {
    return 'anytime'
  }

  const normalized = normalizeDate(task.due_at)

  if (normalized === todayISO) {
    return 'today'
  }

  if (normalized && normalized > todayISO) {
    return 'upcoming'
  }

  return 'inbox'
}

export function buildActiveFilters(
  selectedProjectId: string | null,
  projects: Project[],
  selectedLabelIds: string[],
  labels: Label[]
): ActiveFilterDescriptor[] {
  const filters: ActiveFilterDescriptor[] = []

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
  selectedLabelIds: string[]
) {
  return (
    activeView !== 'inbox' ||
    !!searchQuery.trim() ||
    !!selectedProjectId ||
    (selectedLabelIds && selectedLabelIds.length > 0)
  )
}
