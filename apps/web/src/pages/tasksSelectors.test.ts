import { describe, it, expect } from 'vitest'
import type { Task, Project, Label, Area } from '../lib/supabase.js'
import {
  normalizeDate,
  buildQuickViewStats,
  filterTasksByQuickView,
  buildActiveFilters,
  isFilteredView,
  getTaskView,
  type QuickViewId,
} from './tasksSelectors.js'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-id',
    user_id: 'user',
    project_id: null,
    area_id: null,
    heading_id: null,
    title: 'Example',
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
    pinned: false,
    checklist_items: [],
    ...overrides,
  }
}

const emptyProject: Project = {
  id: 'project-1',
  user_id: 'user',
  name: 'Inbox',
  color: null,
  sort_order: 0,
  created_at: new Date().toISOString(),
  area_id: null,
}

const emptyArea: Area = {
  id: 'area-1',
  user_id: 'user',
  name: 'Trabajo',
  sort_order: 0,
  created_at: new Date().toISOString(),
}

const labelFactory = (id: string, name: string): Label => ({
  id,
  name,
  color: null,
  user_id: 'user',
})

describe('normalizeDate', () => {
  it('returns YYYY-MM-DD for valid ISO strings', () => {
    expect(normalizeDate('2024-01-10T12:00:00.000Z')).toBe('2024-01-10')
  })

  it('returns null for invalid inputs', () => {
    expect(normalizeDate('not-a-date')).toBeNull()
    expect(normalizeDate(undefined)).toBeNull()
  })
})

describe('buildQuickViewStats', () => {
  it('counts tasks for each quick view bucket', () => {
    const today = '2024-01-10'
    const tasks: Task[] = [
      makeTask({ id: 't1', due_at: '2024-01-10T08:00:00.000Z' }),
      makeTask({ id: 't2', due_at: '2024-01-12T08:00:00.000Z' }),
      makeTask({ id: 't3', project_id: 'project-1', due_at: null }),
      makeTask({ id: 't4', due_at: null }),
      makeTask({ id: 't5', status: 'snoozed', due_at: null }),
      makeTask({ id: 't6', status: 'done' }),
    ]

    const stats = buildQuickViewStats(tasks, today)

    expect(stats).toEqual({
      inbox: 1,
      today: 1,
      upcoming: 1,
      anytime: 1,
      someday: 1,
      logbook: 1,
    })
  })
})

describe('filterTasksByQuickView', () => {
  const today = '2024-01-10'
  const tasks: Task[] = [
    makeTask({ id: 'today', due_at: '2024-01-10T10:00:00.000Z' }),
    makeTask({ id: 'overdue', due_at: '2024-01-05T10:00:00.000Z' }),
    makeTask({ id: 'upcoming', due_at: '2024-02-10T10:00:00.000Z' }),
    makeTask({ id: 'anytime', project_id: 'project-1', due_at: null }),
    makeTask({ id: 'inbox-null', due_at: null }),
    makeTask({ id: 'someday', status: 'snoozed', due_at: null }),
    makeTask({ id: 'done', status: 'done' }),
  ]

  const cases: Array<[QuickViewId, string[]]> = [
    ['inbox', ['inbox-null']],
    ['today', ['today', 'overdue']],
    ['upcoming', ['upcoming']],
    ['anytime', ['anytime']],
    ['someday', ['someday']],
    ['logbook', ['done']],
  ]

  cases.forEach(([view, expectedIds]) => {
    it(`filters tasks for quick view "${view}"`, () => {
      const result = filterTasksByQuickView(tasks, view, today)
      expect(result.map(task => task.id)).toEqual(expectedIds)
    })
  })
})

describe('buildActiveFilters', () => {
  it('returns descriptors for selected project and labels', () => {
    const projects: Project[] = [emptyProject]
    const labels: Label[] = [labelFactory('label-1', 'Urgente')]

    const filters = buildActiveFilters('project-1', projects, ['label-1'], labels, 'area-1', [emptyArea])

    expect(filters).toEqual([
      {
        key: 'area-area-1',
        label: 'Área: Trabajo',
        type: 'area',
        referenceId: 'area-1',
      },
      {
        key: 'project-project-1',
        label: 'Proyecto: Inbox',
        type: 'project',
        referenceId: 'project-1',
      },
      {
        key: 'label-label-1',
        label: 'Etiqueta: Urgente',
        type: 'label',
        referenceId: 'label-1',
      },
    ])
  })

  it('ignores ids that do not exist in source arrays', () => {
    const filters = buildActiveFilters('missing', [], ['not-found'], [], 'missing', [])
    expect(filters).toEqual([])
  })
})

describe('isFilteredView', () => {
  it('detects when any filter is active', () => {
    expect(isFilteredView('inbox', '', null, [], null)).toBe(false)
    expect(isFilteredView('today', '', null, [], null)).toBe(true)
    expect(isFilteredView('inbox', 'hola', null, [], null)).toBe(true)
    expect(isFilteredView('inbox', '', 'project', [], null)).toBe(true)
    expect(isFilteredView('inbox', '', null, ['label'], null)).toBe(true)
    expect(isFilteredView('inbox', '', null, [], 'area')).toBe(true)
  })
})

describe('getTaskView', () => {
  const today = '2024-01-10'

  it('returns exclusive views for each task', () => {
    const cases: Array<[Task, QuickViewId]> = [
      [makeTask({ due_at: '2024-01-10T12:00:00Z' }), 'today'],
      [makeTask({ due_at: '2024-01-15T12:00:00Z' }), 'upcoming'],
      [makeTask({ status: 'snoozed', due_at: null }), 'someday'],
      [makeTask({ due_at: null, project_id: 'project-1' }), 'anytime'],
      [makeTask({ due_at: null }), 'inbox'],
      [makeTask({ status: 'done' }), 'logbook'],
      [makeTask({ due_at: '2023-12-01T12:00:00Z' }), 'today'],
    ]

    cases.forEach(([task, expected]) => {
      expect(getTaskView(task, today)).toBe(expected)
    })
  })
})
