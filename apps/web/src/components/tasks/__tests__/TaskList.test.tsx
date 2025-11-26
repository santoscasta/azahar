import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import TaskList from '../TaskList'
import type { Task, Project, Area, ProjectHeading } from '../../../lib/supabase.js'

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  user_id: 'user-1',
  project_id: 'project-1',
  area_id: 'area-1',
  heading_id: null,
  title: 'Demo Task',
  notes: 'Notas de prueba',
  status: 'open',
  priority: 1,
  due_at: '2025-01-01T00:00:00.000Z',
  start_at: null,
  repeat_rrule: null,
  reminder_at: null,
  updated_at: '2025-01-01T00:00:00.000Z',
  created_at: '2025-01-01T00:00:00.000Z',
  completed_at: null,
  labels: [],
  pinned: false,
  checklist_items: [],
  ...overrides,
})

const projects: Project[] = [
  { id: 'project-1', user_id: 'user-1', name: 'Proyecto Uno', color: null, sort_order: 0, created_at: '2025-01-01T00:00:00.000Z', area_id: 'area-1' },
]

const areas: Area[] = [
  { id: 'area-1', user_id: 'user-1', name: 'Área Personal', sort_order: 0, created_at: '2025-01-01T00:00:00.000Z' },
]

const headings: ProjectHeading[] = [
  { id: 'heading-1', project_id: 'project-1', user_id: 'user-1', name: 'To Do', sort_order: 0, created_at: '2025-01-01T00:00:00.000Z' },
]

const editingState = {
  id: null as string | null,
  title: '',
  notes: '',
  priority: 0 as 0 | 1 | 2 | 3,
  dueAt: '',
  projectId: null as string | null,
  areaId: null as string | null,
  headingId: null as string | null,
  checklist: [],
}

const editingHandlers = {
  setTitle: vi.fn(),
  setNotes: vi.fn(),
  setPriority: vi.fn(),
  setAreaId: vi.fn(),
  setProjectId: vi.fn(),
  setHeadingId: vi.fn(),
}

describe('TaskList', () => {
  it('renders tasks and triggers actions', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    const onStartEdit = vi.fn()

    renderWithProviders(
      <TaskList
        variant="desktop"
        tasks={[baseTask()]}
        isLoading={false}
        showEmptyState
        filteredViewActive={false}
        projects={projects}
        areas={areas}
        headings={headings}
        contextProjectId={null}
        contextAreaId={null}
        editingState={editingState}
        editingHandlers={editingHandlers}
        onStartEdit={onStartEdit}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onToggleTask={onToggle}
        onDeleteTask={onDelete}
        onOpenEditDatePicker={vi.fn()}
        onOpenLabelSheet={vi.fn()}
        onOpenChecklist={vi.fn()}
        onOpenPriorityMenu={vi.fn()}
        onOpenMoveSheet={vi.fn()}
        onOpenOverflowMenu={vi.fn()}
        onToggleCollapsedChecklist={vi.fn()}
        formatDateLabel={() => 'Sin fecha'}
      />
    )

    expect(screen.getByText('Demo Task')).toBeDefined()
    fireEvent.click(screen.getByLabelText('Marcar como completada'))
    expect(onToggle).toHaveBeenCalledWith('task-1')

    fireEvent.doubleClick(screen.getByText('Demo Task'))
    expect(onStartEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1' }))
  })

  it('shows edit form when editing the task', () => {
    const state = { ...editingState, id: 'task-1', title: 'Demo Task', notes: '', dueAt: '' }

    renderWithProviders(
      <TaskList
        variant="desktop"
        tasks={[baseTask()]}
        isLoading={false}
        showEmptyState
        filteredViewActive={false}
        projects={projects}
        areas={areas}
        headings={headings}
        contextProjectId={null}
        contextAreaId={null}
        editingState={state}
        editingHandlers={editingHandlers}
        onStartEdit={vi.fn()}
        onSaveEdit={vi.fn()}
        onCancelEdit={vi.fn()}
        onToggleTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onOpenEditDatePicker={vi.fn()}
        onOpenLabelSheet={vi.fn()}
        onOpenChecklist={vi.fn()}
        onOpenPriorityMenu={vi.fn()}
        onOpenMoveSheet={vi.fn()}
        onOpenOverflowMenu={vi.fn()}
        onToggleCollapsedChecklist={vi.fn()}
        formatDateLabel={() => 'Sin fecha'}
      />
    )

    expect(screen.getByPlaceholderText('Título')).toBeDefined()
  })

  it('auto-saves on mobile when tapping outside the editor', () => {
    const onSave = vi.fn()
    const state = { ...editingState, id: 'task-1', title: 'Task', notes: '', dueAt: '' }

    renderWithProviders(
      <TaskList
        variant="mobile"
        tasks={[baseTask()]}
        isLoading={false}
        showEmptyState
        filteredViewActive={false}
        projects={projects}
        areas={areas}
        headings={headings}
        contextProjectId={null}
        contextAreaId={null}
        editingState={state}
        editingHandlers={editingHandlers}
        onStartEdit={vi.fn()}
        onSaveEdit={onSave}
        onCancelEdit={vi.fn()}
        onToggleTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onOpenEditDatePicker={vi.fn()}
        onOpenLabelSheet={vi.fn()}
        onOpenChecklist={vi.fn()}
        onOpenPriorityMenu={vi.fn()}
        onOpenMoveSheet={vi.fn()}
        onOpenOverflowMenu={vi.fn()}
        onToggleCollapsedChecklist={vi.fn()}
        formatDateLabel={() => 'Sin fecha'}
        autoSaveOnMobileBlur
      />
    )

    fireEvent.pointerDown(document.body)
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})
