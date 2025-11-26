
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import TasksPage from '../pages/TasksPage'
import { renderWithProviders } from '../tests/renderWithProviders'
import { translate } from '../lib/i18n'


// Mock Supabase API
vi.mock('../lib/supabase', () => ({
    searchTasks: vi.fn().mockResolvedValue({
        success: true, tasks: [
            { id: '1', title: 'Desktop Task 1', status: 'open', due_at: null, priority: 0, user_id: 'u1', created_at: '2023-01-01' }
        ]
    }),
    addTask: vi.fn().mockResolvedValue({ success: true }),
    signOut: vi.fn().mockResolvedValue({ success: true }),
    updateTask: vi.fn(),
    toggleTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
    getProjects: vi.fn().mockResolvedValue({
        success: true, projects: [
            { id: 'p1', name: 'Project Alpha', color: '#000', user_id: 'u1' }
        ]
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

describe('TasksPage desktop', () => {
    beforeEach(() => {
        // Mock desktop media query
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockReturnValue({
                matches: false, // Desktop
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
})
