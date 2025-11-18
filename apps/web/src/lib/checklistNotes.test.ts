import { describe, it, expect } from 'vitest'
import {
  deserializeChecklistNotes,
  serializeChecklistNotes,
  type ChecklistItem,
} from './checklistNotes'

describe('checklistNotes utils', () => {
  it('serializes and deserializes checklist data', () => {
    const items: ChecklistItem[] = [
      { id: 'a', text: 'Primera', completed: false },
      { id: 'b', text: 'Segunda', completed: true },
    ]
    const serialized = serializeChecklistNotes('Notas libres', items)
    const result = deserializeChecklistNotes(serialized)
    expect(result.text).toBe('Notas libres')
    expect(result.items).toHaveLength(2)
    expect(result.items[1]?.text).toBe('Segunda')
    expect(result.items[1]?.completed).toBe(true)
  })

  it('returns raw text when no token is present', () => {
    const result = deserializeChecklistNotes('Solo texto')
    expect(result.text).toBe('Solo texto')
    expect(result.items).toHaveLength(0)
  })

  it('handles malformed payload gracefully', () => {
    const malformed = 'Texto\n\n::checklist::{not-json}'
    const result = deserializeChecklistNotes(malformed)
    expect(result.text).toBe(malformed)
    expect(result.items).toHaveLength(0)
  })
})
