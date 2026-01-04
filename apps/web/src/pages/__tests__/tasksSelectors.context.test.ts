import { describe, it, expect } from 'vitest'
import { filterTasksForContext, filterTasksByQuickView, getTaskView } from '../tasksSelectors.js'
import type { Task, Project } from '../../lib/supabase.js'

const todayISO = '2024-11-25'

const makeTask = (overrides: Partial<Task>): Task => ({
  id: crypto.randomUUID(),
  title: 'Task',
  user_id: 'user',
  created_at: todayISO,
  status: 'open',
  priority: 0,
  labels: [],
  notes: '',
  project_id: null,
  area_id: null,
  heading_id: null,
  due_at: null,
  deadline_at: null,
  start_at: null,
  repeat_rrule: null,
  reminder_at: null,
  updated_at: todayISO,
  completed_at: null,
  pinned: false,
  checklist_items: [],
  ...overrides,
})

describe('filterTasksForContext', () => {
  const projectA = 'project-a'
  const projectB = 'project-b'
  const areaX = 'area-x'
  const projects: Project[] = [
    { id: projectA, name: 'Project A', user_id: 'user', color: null, sort_order: 0, created_at: todayISO, area_id: areaX },
    { id: projectB, name: 'Project B', user_id: 'user', color: null, sort_order: 1, created_at: todayISO, area_id: areaX },
  ]
  const projectMap = new Map(projects.map(project => [project.id, project]))

  const tasks: Task[] = [
    makeTask({ id: '1', title: 'Inbox task', due_at: null }),
    makeTask({ id: '2', title: 'Today task', due_at: todayISO }),
    makeTask({ id: '3', title: 'Upcoming task', due_at: '2024-12-31' }),
    makeTask({ id: '4', title: 'Project A task', project_id: projectA, area_id: areaX, due_at: '2024-12-31' }),
    makeTask({ id: '5', title: 'Project B task', project_id: projectB, area_id: null, due_at: null }),
    makeTask({ id: '6', title: 'Area only task', area_id: areaX, due_at: null }),
  ]

  it('filters by quick view when no project/area selected', () => {
    const result = filterTasksForContext(tasks, 'today', todayISO, null, null)
    expect(result.map(task => task.id)).toEqual(['2'])
    expect(result.every(task => getTaskView(task, todayISO) === 'today')).toBe(true)
  })

  it('shows all tasks for a selected project ignoring quick view', () => {
    const result = filterTasksForContext(tasks, 'today', todayISO, projectA, null, projectMap)
    const ids = result.map(task => task.id).sort()
    expect(ids).toEqual(['4'])
  })

  it('shows all tasks for a selected area ignoring quick view', () => {
    const result = filterTasksForContext(tasks, 'today', todayISO, null, areaX, projectMap)
    const ids = result.map(task => task.id).sort()
    expect(ids).toEqual(['4', '5', '6'])
  })
})
