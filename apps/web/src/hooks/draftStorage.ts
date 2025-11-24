const EXPIRATION_MS = 1000 * 60 * 120 // 2h

type DraftValue = unknown

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

export function loadDraft<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value: DraftValue; ts: number }
    if (!parsed || typeof parsed.ts !== 'number' || Date.now() - parsed.ts > EXPIRATION_MS) {
      window.localStorage.removeItem(key)
      return null
    }
    return parsed.value as T
  } catch {
    return null
  }
}

export function saveDraft<T>(key: string, value: T) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(key, JSON.stringify({ value, ts: Date.now() }))
  } catch {
    // ignore quota errors
  }
}

export function clearDraft(key: string) {
  if (!isBrowser()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
