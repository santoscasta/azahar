import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MobileDraftCard } from './MobileDraftCard.js'
import type { MobileTaskDraft } from '../../hooks/useTaskCreation.js'

const baseDraft: MobileTaskDraft = {
  title: 'Tarea inicial',
  notes: '',
  view: 'today',
  areaId: null,
  projectId: null,
  due_at: '2025-01-01',
  labelIds: [],
}

const baseLabels = [
  { id: 'a', name: 'Diseño' },
  { id: 'b', name: 'Dev' },
]

describe('MobileDraftCard', () => {
  it('calls callbacks for schedule, labels, date and save', () => {
    const callbacks = {
      onTitleChange: vi.fn(),
      onNotesChange: vi.fn(),
      onSchedulePress: vi.fn(),
      onLabelsPress: vi.fn(),
      onDatePress: vi.fn(),
      onCancel: vi.fn(),
      onSave: vi.fn(),
    }

    const { getByRole, getByLabelText } = render(
      <MobileDraftCard
        draft={{ ...baseDraft, labelIds: ['a'] }}
        labels={baseLabels}
        scheduleLabel="Hoy"
        {...callbacks}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Hoy' }))
    expect(callbacks.onSchedulePress).toHaveBeenCalled()

    fireEvent.click(getByLabelText('Etiquetas'))
    expect(callbacks.onLabelsPress).toHaveBeenCalled()

    fireEvent.click(getByLabelText('Cuando'))
    expect(callbacks.onDatePress).toHaveBeenCalled()

    fireEvent.click(getByRole('button', { name: 'Crear tarea' }))
    expect(callbacks.onSave).toHaveBeenCalled()
  })

  it('renders labels and notes', () => {
    const { getByText, getByDisplayValue } = render(
      <MobileDraftCard
        draft={{ ...baseDraft, labelIds: ['b'], notes: 'Apuntes' }}
        labels={baseLabels}
        scheduleLabel="Hoy"
        onTitleChange={vi.fn()}
        onNotesChange={vi.fn()}
        onSchedulePress={vi.fn()}
        onLabelsPress={vi.fn()}
        onDatePress={vi.fn()}
        onCancel={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(getByDisplayValue('Apuntes')).toBeDefined()
    expect(getByText('Dev')).toBeDefined()
  })
})
