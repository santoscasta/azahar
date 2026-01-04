import type { Task } from './supabase.js'
import { normalizeDate } from '../pages/tasksSelectors.js'

export type TaskSortMode = 'default' | 'due' | 'completed'

const resolveSortOrder = (task: Task, sortKey: string) => {
  const orders = task.sort_orders
  if (!orders || typeof orders !== 'object') {
    return null
  }
  const raw = (orders as Record<string, number>)[sortKey]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

export const sortTasks = (
  tasks: Task[],
  sortKey?: string | null,
  sortMode: TaskSortMode = 'default'
) => {
  if (!sortKey) {
    return tasks
  }
  const copy = [...tasks]
  return copy.sort((a, b) => {
    if (sortMode === 'due') {
      const aDate = normalizeDate(a.due_at)
      const bDate = normalizeDate(b.due_at)
      if (aDate !== bDate) {
        if (!aDate) return 1
        if (!bDate) return -1
        return aDate.localeCompare(bDate)
      }
    }
    if (sortMode === 'completed') {
      const aCompleted = a.completed_at || ''
      const bCompleted = b.completed_at || ''
      if (aCompleted !== bCompleted) {
        return bCompleted.localeCompare(aCompleted)
      }
    }
    const aOrder = resolveSortOrder(a, sortKey)
    const bOrder = resolveSortOrder(b, sortKey)
    if (aOrder !== null || bOrder !== null) {
      if (aOrder === null) return 1
      if (bOrder === null) return -1
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}
