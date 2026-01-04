import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import ProjectBoard from '../boards/ProjectBoard'
import type { Project, ProjectHeading, Task } from '../../../lib/supabase.js'

const project: Project = {
  id: 'project-1',
  user_id: 'user-1',
  name: 'Proyecto Uno',
  color: null,
  sort_order: 0,
  created_at: '2025-01-01T00:00:00.000Z',
  area_id: 'area-1',
}

const headings: ProjectHeading[] = [
  { id: 'heading-1', project_id: 'project-1', user_id: 'user-1', name: 'To Do', sort_order: 0, created_at: '2025-01-01T00:00:00.000Z' },
]

const tasks = new Map<string, Task[]>([
  [
    'heading-1',
    [
      {
        id: 'task-1',
        user_id: 'user-1',
        project_id: 'project-1',
        area_id: 'area-1',
        heading_id: 'heading-1',
        title: 'Tarea demo',
        notes: null,
        status: 'open',
        priority: 0,
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
      },
    ],
  ],
])

describe('ProjectBoard', () => {
  it('renders headings and triggers handlers', () => {
    const onEditHeading = vi.fn()
    const onDeleteHeading = vi.fn()
    const onSelectArea = vi.fn()

    renderWithProviders(
      <ProjectBoard
        project={project}
        headings={headings}
        tasksByHeading={tasks}
        completedCount={0}
        totalCount={1}
        showCompletedTasks
        headingEditingId={null}
        headingEditingName=""
        onStartEditHeading={onEditHeading}
        onChangeHeadingName={vi.fn()}
        onSaveHeadingName={vi.fn()}
        onCancelHeadingEdit={vi.fn()}
        onDeleteHeading={onDeleteHeading}
        onSelectArea={onSelectArea}
        areaName="Área Uno"
        renderTaskList={(tasks) => <div>{tasks.length} tarea(s)</div>}
        renderHeadingForm={() => <div>Formulario Heading</div>}
      />
    )

    fireEvent.click(screen.getByText('✏️'))
    expect(onEditHeading).toHaveBeenCalledWith('heading-1', 'To Do')

    fireEvent.click(screen.getByText('🗑️'))
    expect(onDeleteHeading).toHaveBeenCalledWith('heading-1')

    fireEvent.click(screen.getByText('Área Uno'))
    expect(onSelectArea).toHaveBeenCalledWith('area-1')
    expect(screen.getByText('Formulario Heading')).toBeDefined()
  })
})
