import { describe, it, expect } from 'vitest'
import { buildMobileTaskPayload } from './mobileDraftUtils.js'

describe('buildMobileTaskPayload', () => {
  it('trims title and maps fields', () => {
    const payload = buildMobileTaskPayload({
      title: '  Hola ',
      notes: 'Notas',
      view: 'someday',
      areaId: 'area-1',
      projectId: 'project-1',
      due_at: '2025-02-01',
      deadline_at: null,
      labelIds: ['a', 'b'],
    })

    expect(payload).toEqual({
      title: 'Hola',
      notes: 'Notas',
      status: 'snoozed',
      due_at: '2025-02-01',
      deadline_at: null,
      project_id: 'project-1',
      area_id: 'area-1',
      quick_view: 'someday',
      labelIds: ['a', 'b'],
    })
  })
})
