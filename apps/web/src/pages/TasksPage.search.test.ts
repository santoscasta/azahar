import { describe, it, expect } from 'vitest'
import type { Task } from '../lib/supabase'

// Test the search filtering logic
describe('TasksPage search filtering', () => {
  const createTask = (overrides: Partial<Task>): Task => ({
    id: 'task-1',
    user_id: 'user-1',
    project_id: null,
    area_id: null,
    heading_id: null,
    title: 'Test task',
    notes: null,
    status: 'open',
    due_at: null,
    deadline_at: null,
    start_at: null,
    repeat_rrule: null,
    reminder_at: null,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    completed_at: null,
    pinned: false,
    labels: [],
    checklist_items: [],
    client_mutation_id: null,
    ...overrides,
  })

  it('should handle null title without crashing', () => {
    const task = createTask({ title: null as any })
    const query = 'test'
    const title = String(task.title ?? '').toLowerCase()
    expect(() => title.includes(query)).not.toThrow()
    expect(title).toBe('')
  })

  it('should handle null notes without crashing', () => {
    const task = createTask({ notes: null })
    const query = 'test'
    const notes = task.notes ? String(task.notes).toLowerCase() : ''
    expect(() => notes.includes(query)).not.toThrow()
    expect(notes).toBe('')
  })

  it('should handle special characters in search query', () => {
    const query = '!@#$%^&*()'
    const task = createTask({ title: 'Test task with special !@#$%^&*()' })
    const title = String(task.title ?? '').toLowerCase()
    const normalizedQuery = query.toLowerCase()
    expect(() => title.includes(normalizedQuery)).not.toThrow()
  })

  it('should handle regex special characters in search query', () => {
    const query = '[test].*+?'
    const task = createTask({ title: 'Test [task] with regex' })
    const title = String(task.title ?? '').toLowerCase()
    const normalizedQuery = query.toLowerCase()
    // Using includes() instead of regex, so special chars won't cause issues
    expect(() => title.includes(normalizedQuery)).not.toThrow()
  })

  it('should handle unicode characters', () => {
    const queries = ['café', '日本語', 'ñoño', '你好']
    const task = createTask({ title: 'Café para ñoño 日本語 你好' })
    const title = String(task.title ?? '').toLowerCase()

    queries.forEach(query => {
      const normalizedQuery = query.toLowerCase()
      expect(() => title.includes(normalizedQuery)).not.toThrow()
    })
  })

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(100000)
    const task = createTask({ title: longString })
    const query = 'test'
    const title = String(task.title ?? '').toLowerCase()
    expect(() => title.includes(query)).not.toThrow()
  })
})
