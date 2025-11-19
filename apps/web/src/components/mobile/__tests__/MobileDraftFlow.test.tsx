import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { MobileDraftCard } from '../MobileDraftCard.js'
import { buildMobileTaskPayload } from '../../../lib/mobileDraftUtils.js'
import type { MobileTaskDraft } from '../../../hooks/useTaskCreation.js'

function DraftHarness({ onSubmit }: { onSubmit: (payload: ReturnType<typeof buildMobileTaskPayload>) => void }) {
  const [draft, setDraft] = useState<MobileTaskDraft>({
    title: '',
    notes: '',
    view: 'today',
    areaId: null,
    projectId: null,
    due_at: '2025-03-01',
    labelIds: [],
  })

  const handleSave = () => {
    onSubmit(buildMobileTaskPayload(draft))
  }

  return (
    <MobileDraftCard
      draft={draft}
      labels={[]}
      scheduleLabel="Hoy"
      onTitleChange={(value) => setDraft(prev => ({ ...prev, title: value }))}
      onNotesChange={(value) => setDraft(prev => ({ ...prev, notes: value }))}
      onSchedulePress={vi.fn()}
      onLabelsPress={vi.fn()}
      onDatePress={vi.fn()}
      onCancel={vi.fn()}
      onSave={handleSave}
    />
  )
}

describe('Mobile draft flow', () => {
  it('submits payload derived from draft', () => {
    const submitSpy = vi.fn()
    const { getByRole, getByPlaceholderText } = render(<DraftHarness onSubmit={submitSpy} />)

    fireEvent.change(getByPlaceholderText('Nueva tarea'), { target: { value: 'Escribir post' } })

    fireEvent.click(getByRole('button', { name: 'Guardar' }))

    expect(submitSpy).toHaveBeenCalledWith({
      title: 'Escribir post',
      notes: '',
      status: 'open',
      due_at: '2025-03-01',
      project_id: null,
      area_id: null,
      labelIds: [],
    })
  })
})
