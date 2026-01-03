import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { DesktopDraftCard } from '../DesktopDraftCard.js'
import type { TaskCreationDraft } from '../../../hooks/useTaskCreation.js'

const baseDraft: TaskCreationDraft = {
  title: '',
  notes: '',
  priority: 0,
  due_at: '',
  projectId: null,
  areaId: null,
  headingId: null,
  status: 'open',
  labelIds: [],
  view: 'inbox',
}

afterEach(() => {
  cleanup()
})

describe('DesktopDraftCard', () => {
  it('keeps focus and draft open on outside click when title is empty', async () => {
    const handleCancel = vi.fn()
    const { getAllByPlaceholderText } = render(
      <DesktopDraftCard
        draft={baseDraft}
        viewLabel="Entrada"
        dueLabel="Sin fecha"
        labelCount={0}
        onSubmit={vi.fn()}
        onCancel={handleCancel}
        onTitleChange={vi.fn()}
        onNotesChange={vi.fn()}
        onRequestDueDate={vi.fn()}
        onOpenLabels={vi.fn()}
      />
    )

    const titleInput = getAllByPlaceholderText('Nueva tarea')[0] as HTMLInputElement
    expect(document.activeElement).toBe(titleInput)

    fireEvent.pointerDown(document.body)

    await waitFor(() => {
      expect(document.activeElement).toBe(titleInput)
    })
    expect(handleCancel).not.toHaveBeenCalled()
  })

  it('cancels the draft when pressing Escape', () => {
    const handleCancel = vi.fn()
    const { getAllByPlaceholderText } = render(
      <DesktopDraftCard
        draft={baseDraft}
        viewLabel="Entrada"
        dueLabel="Sin fecha"
        labelCount={0}
        onSubmit={vi.fn()}
        onCancel={handleCancel}
        onTitleChange={vi.fn()}
        onNotesChange={vi.fn()}
        onRequestDueDate={vi.fn()}
        onOpenLabels={vi.fn()}
      />
    )

    fireEvent.keyDown(getAllByPlaceholderText('Nueva tarea')[0], { key: 'Escape', code: 'Escape', keyCode: 27 })

    expect(handleCancel).toHaveBeenCalledTimes(1)
  })
})
