import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import MoveTaskSheet from '../../tasks/MoveTaskSheet'
import type { Task, Project, Area } from '../../../lib/supabase.js'

const mockTask: Task = {
  id: 'task-1',
  user_id: 'user-1',
  project_id: 'project-1',
  area_id: 'area-1',
  heading_id: null,
  title: 'Demo',
  notes: null,
  status: 'open',
  due_at: null,
  deadline_at: null,
  start_at: null,
  repeat_rrule: null,
  reminder_at: null,
  updated_at: '',
  created_at: '',
  completed_at: null,
  pinned: false,
}

const areas: Area[] = [
  { id: 'area-1', user_id: 'user-1', name: 'Personal', sort_order: 0, created_at: '' },
]

const projects: Project[] = [
  { id: 'project-1', user_id: 'user-1', name: 'Proyecto A', color: null, sort_order: 0, created_at: '', area_id: 'area-1' },
  { id: 'project-2', user_id: 'user-1', name: 'Independiente', color: null, sort_order: 1, created_at: '', area_id: null },
]

describe('MoveTaskSheet', () => {
  it('calls onSelect when choosing a destination', () => {
    const onSelect = vi.fn()
    render(
      <MoveTaskSheet
        open
        task={mockTask}
        areas={areas}
        projects={projects}
        onClose={vi.fn()}
        onSelect={onSelect}
      />
    )

    fireEvent.click(screen.getByText('Personal'))
    expect(onSelect).toHaveBeenCalledWith({ areaId: 'area-1', projectId: null })
  })

  it('closes when cancel is pressed', () => {
    const onClose = vi.fn()
    render(
      <MoveTaskSheet
        open
        task={mockTask}
        areas={areas}
        projects={projects}
        onClose={onClose}
        onSelect={vi.fn()}
      />
    )

    const cancelButtons = screen.getAllByText('Cancelar')
    fireEvent.click(cancelButtons[cancelButtons.length - 1]!)
    expect(onClose).toHaveBeenCalled()
  })
})
