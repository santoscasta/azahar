import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, waitFor } from '@testing-library/react'
import TasksPage from '../pages/TasksPage'
import { renderWithProviders } from '../tests/renderWithProviders'
import * as supabaseApi from '../lib/supabase'

vi.mock('../lib/supabase', () => ({
  searchTasks: vi.fn().mockResolvedValue({ success: true, tasks: [] }),
  addTask: vi.fn().mockResolvedValue({ success: true }),
  signOut: vi.fn().mockResolvedValue({ success: true }),
  updateTask: vi.fn(),
  toggleTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  getProjects: vi.fn().mockResolvedValue({ success: true, projects: [] }),
  addProject: vi.fn(),
  getLabels: vi.fn().mockResolvedValue({ success: true, labels: [] }),
  addLabel: vi.fn(),
  deleteLabel: vi.fn(),
  addTaskLabel: vi.fn(),
  removeTaskLabel: vi.fn(),
  getAreas: vi.fn().mockResolvedValue({ success: true, areas: [] }),
  addArea: vi.fn(),
  getProjectHeadings: vi.fn().mockResolvedValue({ success: true, headings: [] }),
  addProjectHeading: vi.fn(),
  updateProjectHeading: vi.fn(),
  deleteProjectHeading: vi.fn(),
}))

describe('TasksPage mobile quick-add', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('saves a task from the mobile creation sheet', async () => {
    const screen = renderWithProviders(<TasksPage />)

    fireEvent.click(screen.getByLabelText('Abrir creación rápida'))

    const quickTaskButton = await screen.findByRole('button', { name: /Nueva tarea/i })
    fireEvent.click(quickTaskButton)

    const saveButton = await screen.findByRole('button', { name: 'Guardar' })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(vi.mocked(supabaseApi.addTask)).toHaveBeenCalled()
    })
  })
})
