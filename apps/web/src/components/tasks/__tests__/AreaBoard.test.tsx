import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import AreaBoard from '../boards/AreaBoard'
import type { Project, Task } from '../../../lib/supabase.js'

const project: Project = {
  id: 'project-1',
  user_id: 'user-1',
  name: 'Proyecto Uno',
  color: null,
  sort_order: 0,
  created_at: '2025-01-01T00:00:00.000Z',
  area_id: 'area-1',
}

const task: Task = {
  id: 'task-1',
  user_id: 'user-1',
  project_id: 'project-1',
  area_id: 'area-1',
  heading_id: null,
  title: 'Tarea demo',
  notes: null,
  status: 'open',
  priority: 0,
  due_at: null,
  start_at: null,
  repeat_rrule: null,
  reminder_at: null,
  updated_at: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  completed_at: null,
  labels: [],
  pinned: false,
  checklist_items: [],
}

describe('AreaBoard', () => {
  it('renders projects and tasks', () => {
    const onSelectProject = vi.fn()
    const tasksByProject = new Map<string, Task[]>([['project-1', [task]]])

    renderWithProviders(
      <AreaBoard
        areaName="Área Uno"
        projectCount={1}
        completedCount={0}
        totalCount={1}
        projects={[project]}
        tasksByProject={tasksByProject}
        looseTasks={[]}
        onSelectProject={onSelectProject}
        renderTaskList={(tasks) => <div>{tasks.length} tarea(s)</div>}
      />
    )

    expect(screen.getByText('Área Uno')).toBeDefined()
    fireEvent.click(screen.getByText('Proyecto Uno'))
    expect(onSelectProject).toHaveBeenCalledWith('project-1')
    expect(screen.getByText('1 tarea(s)')).toBeDefined()
  })
})
