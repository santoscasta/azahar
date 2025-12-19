import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyThemeToDocument,
  defaultSettings,
  loadSettings,
  persistSettings,
  resolveThemePreference,
  subscribeToSettings,
  type SettingsState,
} from './settingsStore'

const mockSettings: SettingsState = {
  version: 1,
  theme: 'dark',
  language: 'en',
  showCompletedInContexts: false,
  customViewNames: { today: 'Focus' },
}

afterEach(() => {
  localStorage.clear()
})

describe('settingsStore', () => {
  it('returns defaults when storage is empty or invalid', () => {
    expect(loadSettings()).toEqual(defaultSettings)
    localStorage.setItem('azahar:settings', '{invalid')
    expect(loadSettings()).toEqual(defaultSettings)
  })

  it('persists and broadcasts sanitized settings', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeToSettings(listener)

    persistSettings(mockSettings)

    expect(loadSettings()).toEqual(mockSettings)
    expect(listener).toHaveBeenCalledWith(mockSettings)

    unsubscribe()
  })

  it('resolves system theme using the user preference', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true })
    Object.defineProperty(window, 'matchMedia', { writable: true, value: matchMedia })

    expect(resolveThemePreference('dark')).toBe('dark')
    expect(resolveThemePreference('system')).toBe('dark')

    matchMedia.mockReturnValue({ matches: false })
    expect(resolveThemePreference('system')).toBe('light')
  })

  it('applies theme to the document element dataset', () => {
    applyThemeToDocument('light')
    expect(document.documentElement.dataset.theme).toBe('light')
  })
})
