export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

const CHECKLIST_TOKEN = '::checklist::'

export const generateChecklistId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `chk-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const deserializeChecklistNotes = (
  rawNotes: string | null | undefined
): { text: string; items: ChecklistItem[] } => {
  if (!rawNotes) {
    return { text: '', items: [] }
  }
  const tokenIndex = rawNotes.indexOf(CHECKLIST_TOKEN)
  if (tokenIndex === -1) {
    return { text: rawNotes, items: [] }
  }
  const text = rawNotes.slice(0, tokenIndex).trimEnd()
  const jsonPayload = rawNotes.slice(tokenIndex + CHECKLIST_TOKEN.length).trim()
  if (!jsonPayload) {
    return { text, items: [] }
  }
  try {
    const parsed = JSON.parse(jsonPayload)
    if (Array.isArray(parsed)) {
      return {
        text,
        items: parsed
          .map(item => {
            if (!item || typeof item !== 'object') {
              return null
            }
            const { id, text: itemText, completed } = item as ChecklistItem
            if (!itemText || typeof itemText !== 'string') {
              return null
            }
            return {
              id: typeof id === 'string' ? id : generateChecklistId(),
              text: itemText,
              completed: Boolean(completed),
            }
          })
          .filter(Boolean) as ChecklistItem[],
      }
    }
  } catch {
    // Ignore malformed payloads and fall back to plain notes
  }
  return { text: rawNotes, items: [] }
}

export const serializeChecklistNotes = (text: string, items: ChecklistItem[]): string => {
  const safeText = text?.trimEnd() ?? ''
  if (!items.length) {
    return safeText
  }
  const payload = JSON.stringify(items)
  const delimiter = safeText ? `${safeText}\n\n` : ''
  return `${delimiter}${CHECKLIST_TOKEN}${payload}`
}
