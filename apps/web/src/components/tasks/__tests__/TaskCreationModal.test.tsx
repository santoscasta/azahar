import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { useState } from 'react'
import TaskCreationModal from '../TaskCreationModal.js'
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

function ModalHarness() {
  const [draft, setDraft] = useState<TaskCreationDraft>(baseDraft)

  return (
    <TaskCreationModal
      open
      isMobile={false}
      draft={draft}
      projects={[]}
      areas={[]}
      headings={[]}
      labels={[]}
      creationViewOptions={[
        { id: 'inbox', label: 'Entrada', icon: '' },
        { id: 'today', label: 'Hoy', icon: '' },
      ]}
      dueDateLabel="Sin fecha"
      savingTask={false}
      savingLabel={false}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
      onUpdateDraft={(key, value) => setDraft(prev => ({ ...prev, [key]: value }))}
      onApplyViewPreset={vi.fn()}
      onRequestDueDate={vi.fn()}
      onToggleLabel={vi.fn()}
      inlineLabelName=""
      onInlineLabelNameChange={vi.fn()}
      onCreateInlineLabel={vi.fn()}
    />
  )
}

describe('TaskCreationModal', () => {
  it('disables the submit button when the title is empty', () => {
    const { getByRole } = render(<ModalHarness />)

    const submitButton = getByRole('button', { name: /Crear tarea/i })
    expect((submitButton as HTMLButtonElement).disabled).toBe(true)
  })

  it('enables the submit button once a title is provided', () => {
    const { getByRole, getAllByPlaceholderText } = render(<ModalHarness />)

    fireEvent.change(getAllByPlaceholderText('Nueva tarea (igual que en móvil)')[0], { target: { value: 'Enviar informe' } })

    const submitButton = getByRole('button', { name: /Crear tarea/i })
    expect((submitButton as HTMLButtonElement).disabled).toBe(false)
  })
})
