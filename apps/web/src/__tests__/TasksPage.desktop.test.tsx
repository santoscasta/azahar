
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import TasksPage from '../pages/TasksPage'
import { renderWithProviders } from '../tests/renderWithProviders'
import { translate } from '../lib/i18n'
import { useConnectivity } from '../hooks/useConnectivity'


// Mock Supabase API
vi.mock('../lib/supabase', () => ({
  searchTasks: vi.fn().mockResolvedValue({
    success: true,
    tasks: [
      {
        id: '1',
        title: 'Desktop Task 1',
        status: 'open',
        due_at: null,
        deadline_at: null,
        user_id: 'u1',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
        notes: null,
        project_id: null,
        area_id: null,
        heading_id: null,
        start_at: null,
        repeat_rrule: null,
        reminder_at: null,
        completed_at: null,
        labels: [],
        pinned: false,
        sort_orders: {},
        checklist_items: [],
        quick_view: 'inbox',
        client_mutation_id: null,
      },
    ],
  }),
  addTask: vi.fn().mockResolvedValue({ success: true }),
  signOut: vi.fn().mockResolvedValue({ success: true }),
  updateTask: vi.fn(),
  toggleTaskStatus: vi.fn(),
  deleteTask: vi.fn(),
  getProjects: vi.fn().mockResolvedValue({
    success: true,
    projects: [
      {
        id: 'p1',
        name: 'Project Alpha',
        color: '#000',
        user_id: 'u1',
        sort_order: 0,
        created_at: '2023-01-01T00:00:00.000Z',
        area_id: null,
      },
    ],
  }),
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
vi.mock('../hooks/useConnectivity', () => ({ useConnectivity: vi.fn(() => true) }))

describe('TasksPage desktop', () => {
  beforeEach(() => {
    // Mock desktop media query
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: false, // Desktop
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders sidebar and task list on desktop', async () => {
    renderWithProviders(<TasksPage />)

    const inboxLabel = translate('es', 'view.inbox')
    const todayLabel = translate('es', 'view.today')

    // Sidebar items should be visible
    expect(screen.getAllByText(inboxLabel)[0]).toBeDefined()
    expect(screen.getAllByText(todayLabel)[0]).toBeDefined()

    // Projects should be loaded and visible in sidebar
    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeDefined()
    })

    // Task list should show the mocked task
    await waitFor(() => {
      expect(screen.getByText('Desktop Task 1')).toBeDefined()
    })
  })

  it('shows an offline banner when connectivity is lost', async () => {
    vi.mocked(useConnectivity).mockReturnValue(false)

    renderWithProviders(<TasksPage />)

    expect(await screen.findByText(translate('es', 'status.offline'))).toBeDefined()
  })
})
