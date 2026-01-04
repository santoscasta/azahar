import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import DesktopTaskBoardSwitcher from '../boards/DesktopTaskBoardSwitcher'
import type { Area, Project, ProjectHeading, Task } from '../../../lib/supabase.js'

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

const mockHeading: ProjectHeading = {
  id: 'heading-1',
  project_id: 'project-1',
  user_id: 'user-1',
  name: 'To Do',
  sort_order: 0,
  created_at: '2025-01-01T00:00:00.000Z',
}

const mockTask: Task = {
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
}

describe('DesktopTaskBoardSwitcher', () => {
  const baseProps = {
    projects: [mockProject],
    areas: [mockArea],
    projectHeadings: [mockHeading],
    filteredTasks: [mockTask],
    visibleProjectTasks: [mockTask],
    completedCount: 0,
    showCompletedTasks: true,
    quickViewLabel: 'Inbox',
    quickViewDescription: 'Descripción',
    quickViewGroups: [],
    headingEditingId: null,
    headingEditingName: '',
    onStartEditHeading: vi.fn(),
    onChangeHeadingName: vi.fn(),
    onSaveHeadingName: vi.fn(),
    onCancelHeadingEdit: vi.fn(),
    onDeleteHeading: vi.fn(),
    onReorderHeadings: vi.fn(),
    onSelectArea: vi.fn(),
    onSelectProject: vi.fn(),
    renderTaskList: (tasks: Task[]) => <div>{tasks.length} tarea(s)</div>,
  }

  it('renders the project board when a project is selected', () => {
    renderWithProviders(
      <DesktopTaskBoardSwitcher
        {...baseProps}
        selectedProject={mockProject}
        selectedArea={null}
        renderHeadingForm={() => <div data-testid="heading-form">Formulario</div>}
      />
    )

    expect(screen.getByText('Proyecto Uno')).toBeDefined()
    expect(screen.getByTestId('heading-form')).toBeDefined()
    expect(screen.getByText('1 tarea(s)')).toBeDefined()
  })

  it('renders the area board when an area is selected', () => {
    const onSelectProject = vi.fn()
    renderWithProviders(
      <DesktopTaskBoardSwitcher
        {...baseProps}
        selectedProject={null}
        selectedArea={mockArea}
        onSelectProject={onSelectProject}
      />
    )

    expect(screen.getByRole('heading', { name: 'Área Uno' })).toBeDefined()
    const projectButton = screen.getAllByRole('button', { name: 'Proyecto Uno' })[0]
    fireEvent.click(projectButton)
    expect(onSelectProject).toHaveBeenCalledWith('project-1')
  })

  it('renders the quick view board when nothing is selected', () => {
    const onSelectArea = vi.fn()
    renderWithProviders(
      <DesktopTaskBoardSwitcher
        {...baseProps}
        selectedProject={null}
        selectedArea={null}
        quickViewGroups={[
          {
            areaId: mockArea.id,
            area: mockArea,
            projects: new Map([[mockProject.id, { project: mockProject, tasks: [mockTask] }]]),
            standalone: [],
          },
        ]}
        onSelectArea={onSelectArea}
      />
    )

    const areaButtons = screen.getAllByText('Área Uno')
    areaButtons.forEach(button => fireEvent.click(button))
    expect(onSelectArea).toHaveBeenCalledWith('area-1')
    expect(screen.getAllByText('1 tarea(s)').length).toBeGreaterThan(0)
  })
})
