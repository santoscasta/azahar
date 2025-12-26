import { describe, expect, it } from 'vitest'
import {
  buildActiveFilters,
  buildQuickViewStats,
  filterTasksForContext,
  getTaskView,
  isFilteredView,
  normalizeDate,
  type QuickViewId,
} from './tasksSelectors'
import type { Area, Label, Project, Task } from '../lib/supabase'

const baseTask: Task = {
  id: 't-1',
  user_id: 'user',
  project_id: null,
  area_id: null,
  heading_id: null,
  title: 'Demo',
  notes: null,
  status: 'open',
  priority: 0,
  due_at: null,
  start_at: null,
  repeat_rrule: null,
  reminder_at: null,
  updated_at: '2024-05-01',
  created_at: '2024-05-01',
  completed_at: null,
  pinned: null,
}

const todayISO = '2024-05-10'

describe('tasksSelectors', () => {
  it('derives task view from task fields', () => {
    expect(getTaskView({ ...baseTask, status: 'done' }, todayISO)).toBe('logbook')
    expect(getTaskView({ ...baseTask, status: 'snoozed' }, todayISO)).toBe('someday')
    expect(getTaskView({ ...baseTask, labels: [{ id: 'l1', name: 'Waiting', color: null }] }, todayISO)).toBe('waiting')
    expect(getTaskView({ ...baseTask, labels: [{ id: 'l2', name: 'Referencia', color: null }] }, todayISO)).toBe('reference')
    expect(getTaskView({ ...baseTask, due_at: '2024-05-09' }, todayISO)).toBe('today')
    expect(getTaskView({ ...baseTask, due_at: '2024-05-12' }, todayISO)).toBe('upcoming')
    expect(getTaskView({ ...baseTask, project_id: 'p1' }, todayISO)).toBe('anytime')
    expect(getTaskView({ ...baseTask, quick_view: 'today' }, todayISO)).toBe('today')
  })

  it('computes quick view stats and filters by context', () => {
    const projects: Project[] = [
      { id: 'p-1', name: 'Proyecto', user_id: 'user', color: null, sort_order: 0, created_at: todayISO, area_id: 'a-1' },
    ]
    const projectMap = new Map(projects.map(project => [project.id, project]))
    const tasks: Task[] = [
      { ...baseTask, id: 't1', due_at: todayISO },
      { ...baseTask, id: 't2', project_id: 'p-1', area_id: null },
      { ...baseTask, id: 't3', area_id: 'a-1' },
    ]

    const stats = buildQuickViewStats(tasks, todayISO)
    expect(stats.today).toBe(1)
    expect(stats.anytime).toBe(2)

    const onlyProject = filterTasksForContext(tasks, 'inbox', todayISO, 'p-1', null, projectMap)
    expect(onlyProject.map(task => task.id)).toEqual(['t2'])

    const onlyArea = filterTasksForContext(tasks, 'inbox', todayISO, null, 'a-1', projectMap)
    expect(onlyArea.map(task => task.id).sort()).toEqual(['t2', 't3'])
  })

  it('builds active filters for areas, projects and labels', () => {
    const projects: Project[] = [{ id: 'p1', name: 'Proyecto', color: null, user_id: 'u', sort_order: 0, created_at: '', area_id: null }]
    const labels: Label[] = [{ id: 'l1', name: 'Importante', color: '#000', user_id: 'u' }]
    const areas: Area[] = [{ id: 'a1', name: 'Área', sort_order: 0, user_id: 'u', created_at: '' }]

    const filters = buildActiveFilters('p1', projects, ['l1'], labels, 'a1', areas)
    expect(filters.map(filter => filter.type)).toEqual(['area', 'project', 'label'])
  })

  it('detects filtered views and normalizes dates', () => {
    const activeView: QuickViewId = 'inbox'
    expect(isFilteredView(activeView, '', null, [], null)).toBe(false)
    expect(isFilteredView(activeView, 'query', null, [], null)).toBe(true)
    expect(normalizeDate('invalid')).toBeNull()
    expect(normalizeDate('2024-05-02')).toBe('2024-05-02')
  })
})
