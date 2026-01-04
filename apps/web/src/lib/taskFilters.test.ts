import { describe, it, expect } from 'vitest'
import type { Task } from './supabase.js'
import { applyTaskFilters } from './taskFilters.js'

const taskFactory = (overrides: Partial<Task>): Task => {
  const { area_id = null, heading_id = null, ...rest } = overrides
  return {
    id: 'task-id',
    user_id: 'user',
    project_id: null,
    area_id,
    heading_id,
    title: 'Base task',
    notes: null,
    status: 'open',
    priority: 0,
    due_at: null,
    deadline_at: null,
    start_at: null,
    repeat_rrule: null,
    reminder_at: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    completed_at: null,
    labels: [],
    pinned: false,
    checklist_items: [],
    ...rest,
  }
}

describe('applyTaskFilters', () => {
  const tasks: Task[] = [
    taskFactory({ id: 'inbox', project_id: null, area_id: 'personal', title: 'Comprar pan', notes: 'Mercado local' }),
    taskFactory({
      id: 'work-urgent',
      project_id: 'work',
      area_id: 'work-area',
      title: 'Revisar sprint',
      notes: 'Sync con equipo',
      labels: [
        { id: 'urgent', name: 'Urgente', color: null },
        { id: 'dev', name: 'Dev', color: null },
      ],
    }),
    taskFactory({
      id: 'work-document',
      project_id: 'work',
      title: 'Documentar API',
      notes: 'Enviar a QA',
      labels: [{ id: 'dev', name: 'Dev', color: null }],
    }),
  ]

  it('filters by project id', () => {
    const filtered = applyTaskFilters(tasks, { projectId: 'work' })
    expect(filtered.map(task => task.id)).toEqual(['work-urgent', 'work-document'])
  })

  it('filters by area id when no project specified', () => {
    const filtered = applyTaskFilters(tasks, { areaId: 'personal' })
    expect(filtered.map(task => task.id)).toEqual(['inbox'])
  })

  it('filters by search query in title or notes (case insensitive)', () => {
    const filtered = applyTaskFilters(tasks, { query: 'documentar' })
    expect(filtered.map(task => task.id)).toEqual(['work-document'])

    const matchesNotes = applyTaskFilters(tasks, { query: 'MERCADO' })
    expect(matchesNotes.map(task => task.id)).toEqual(['inbox'])
  })

  it('requires tasks to contain all selected labels', () => {
    const filtered = applyTaskFilters(tasks, { labelIds: ['urgent', 'dev'] })
    expect(filtered.map(task => task.id)).toEqual(['work-urgent'])
  })

  it('returns empty result when label filter includes ids not present on a task', () => {
    const filtered = applyTaskFilters(tasks, { labelIds: ['missing'] })
    expect(filtered).toHaveLength(0)
  })

  it('combines project, query and label filters', () => {
    const filtered = applyTaskFilters(tasks, {
      projectId: 'work',
      query: 'revisar',
      labelIds: ['urgent'],
    })
    expect(filtered.map(task => task.id)).toEqual(['work-urgent'])
  })

  it('ignores empty/whitespace queries and empty label arrays', () => {
    const filtered = applyTaskFilters(tasks, { query: '   ', labelIds: [] })
    expect(filtered).toHaveLength(tasks.length)
  })
})
