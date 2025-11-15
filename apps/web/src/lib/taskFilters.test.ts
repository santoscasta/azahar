import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import type { Task } from './supabase'
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
    start_at: null,
    repeat_rrule: null,
    reminder_at: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    completed_at: null,
    labels: [],
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
    assert.deepEqual(filtered.map(task => task.id), ['work-urgent', 'work-document'])
  })

  it('filters by area id when no project specified', () => {
    const filtered = applyTaskFilters(tasks, { areaId: 'personal' })
    assert.deepEqual(filtered.map(task => task.id), ['inbox'])
  })

  it('filters by search query in title or notes (case insensitive)', () => {
    const filtered = applyTaskFilters(tasks, { query: 'documentar' })
    assert.deepEqual(filtered.map(task => task.id), ['work-document'])

    const matchesNotes = applyTaskFilters(tasks, { query: 'MERCADO' })
    assert.deepEqual(matchesNotes.map(task => task.id), ['inbox'])
  })

  it('requires tasks to contain all selected labels', () => {
    const filtered = applyTaskFilters(tasks, { labelIds: ['urgent', 'dev'] })
    assert.deepEqual(filtered.map(task => task.id), ['work-urgent'])
  })

  it('returns empty result when label filter includes ids not present on a task', () => {
    const filtered = applyTaskFilters(tasks, { labelIds: ['missing'] })
    assert.equal(filtered.length, 0)
  })

  it('combines project, query and label filters', () => {
    const filtered = applyTaskFilters(tasks, {
      projectId: 'work',
      query: 'revisar',
      labelIds: ['urgent'],
    })
    assert.deepEqual(filtered.map(task => task.id), ['work-urgent'])
  })

  it('ignores empty/whitespace queries and empty label arrays', () => {
    const filtered = applyTaskFilters(tasks, { query: '   ', labelIds: [] })
    assert.equal(filtered.length, tasks.length)
  })
})
