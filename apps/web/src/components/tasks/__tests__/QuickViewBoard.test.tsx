import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import QuickViewBoard from '../boards/QuickViewBoard'
import type { Area, Project, Task } from '../../../lib/supabase.js'

const mockArea: Area = {
  id: 'area-1',
  user_id: 'user-1',
  name: 'Área Uno',
  sort_order: 0,
  created_at: '2025-01-01T00:00:00.000Z',
}

const mockProject: Project = {
  id: 'project-1',
  user_id: 'user-1',
  name: 'Proyecto Uno',
  color: null,
  sort_order: 0,
  created_at: '2025-01-01T00:00:00.000Z',
  area_id: 'area-1',
}

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  project_id: 'project-1',
  area_id: 'area-1',
  heading_id: null,
  title: 'Tarea demo',
  notes: null,
  status: 'open',
  due_at: null,
  deadline_at: null,
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

describe('QuickViewBoard', () => {
  it('renders groups and triggers callbacks', () => {
    const onSelectArea = vi.fn()

    renderWithProviders(
      <QuickViewBoard
        groups={[
          {
            areaId: mockArea.id,
            area: mockArea,
            projects: new Map([[mockProject.id, { project: mockProject, tasks: [mockTask] }]]),
            standalone: [],
          },
        ]}
        onSelectArea={onSelectArea}
        renderTaskList={(tasks) => <div>{tasks.length} tarea(s)</div>}
      />
    )

    fireEvent.click(screen.getByText('Área Uno'))
    expect(onSelectArea).toHaveBeenCalledWith('area-1')

    expect(screen.getByText('1 tarea(s)')).toBeDefined()
  })
})
