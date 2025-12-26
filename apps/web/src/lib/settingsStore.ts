import type { Language } from './i18n'
import type { QuickViewId } from '../pages/tasksSelectors'

export type ThemeOption = 'system' | 'light' | 'dark'

export interface SettingsState {
  version: 1
  theme: ThemeOption
  language: Language
  showCompletedInContexts: boolean
  forceMobileView: boolean
  customViewNames?: Partial<Record<QuickViewId, string>>
}

export const SETTINGS_STORAGE_KEY = 'azahar:settings'
export const SETTINGS_EVENT = 'azahar:settings-updated'

export const defaultSettings: SettingsState = {
  version: 1,
  theme: 'system',
  language: 'es',
  showCompletedInContexts: true,
  forceMobileView: false,
}

const isClient = typeof window !== 'undefined'

const sanitizeTheme = (theme: unknown): ThemeOption => {
  if (theme === 'light' || theme === 'dark' || theme === 'system') return theme
  return defaultSettings.theme
}

const sanitizeLanguage = (language: unknown): Language => {
  if (language === 'es' || language === 'en') return language
  return defaultSettings.language
}

const sanitizeCustomViewNames = (value: unknown): SettingsState['customViewNames'] => {
  if (!value || typeof value !== 'object') return undefined
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, name]) => typeof name === 'string' && name.trim().length > 0) as [QuickViewId, string][]
  if (!entries.length) return undefined
  return Object.fromEntries(entries)
}

const sanitizeSettings = (raw: Partial<SettingsState> | null | undefined): SettingsState => ({
  ...defaultSettings,
  ...raw,
  theme: sanitizeTheme(raw?.theme),
  language: sanitizeLanguage(raw?.language),
  showCompletedInContexts: typeof raw?.showCompletedInContexts === 'boolean'
    ? raw.showCompletedInContexts
    : defaultSettings.showCompletedInContexts,
  forceMobileView: typeof raw?.forceMobileView === 'boolean'
    ? raw.forceMobileView
    : defaultSettings.forceMobileView,
  customViewNames: sanitizeCustomViewNames(raw?.customViewNames),
  version: 1,
})

export const loadSettings = (): SettingsState => {
  if (typeof localStorage === 'undefined') return defaultSettings
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw) as Partial<SettingsState>
    return sanitizeSettings(parsed)
  } catch {
    return defaultSettings
  }
}

export const persistSettings = (settings: SettingsState) => {
  if (typeof localStorage === 'undefined') return
  const sanitized = sanitizeSettings(settings)
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitized))
  if (isClient) {
    window.dispatchEvent(new CustomEvent<SettingsState>(SETTINGS_EVENT, { detail: sanitized }))
  }
}

export const subscribeToSettings = (listener: (state: SettingsState) => void) => {
  if (!isClient) return () => {}

  const handleCustom = (event: Event) => {
    const detail = (event as CustomEvent<Partial<SettingsState>>).detail
    listener(sanitizeSettings(detail))
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_STORAGE_KEY) return
    listener(loadSettings())
  }

  window.addEventListener(SETTINGS_EVENT, handleCustom as EventListener)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(SETTINGS_EVENT, handleCustom as EventListener)
    window.removeEventListener('storage', handleStorage)
  }
}

export const resolveThemePreference = (theme: ThemeOption): Exclude<ThemeOption, 'system'> => {
  if (theme === 'system') {
    if (isClient && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
  return theme
}

export const applyThemeToDocument = (theme: Exclude<ThemeOption, 'system'>) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}
