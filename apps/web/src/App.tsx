import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistenceOptions } from './lib/queryClient'
import { supabase, getCurrentUser } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import { translate, type Language } from './lib/i18n'

type ThemeOption = 'system' | 'light' | 'dark'

interface StoredSettings {
  theme: ThemeOption
  language: Language
  showCompletedInContexts: boolean
}

const SETTINGS_STORAGE_KEY = 'azahar:settings'

const readStoredSettings = (): StoredSettings | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredSettings
  } catch {
    return null
  }
}

const resolveTheme = (theme: ThemeOption): Exclude<ThemeOption, 'system'> => {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }
  return theme
}

const applyThemeToDocument = (theme: Exclude<ThemeOption, 'system'>) => {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

const LanguageContext = createContext<{ language: Language; t: (key: Parameters<typeof translate>[1]) => string }>({
  language: 'es',
  t: (key) => translate('es', key),
})

export const useTranslations = () => useContext(LanguageContext)

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  const enableSettings = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_ENABLE_SETTINGS ?? 'true') !== 'false'
  const [language, setLanguage] = useState<Language>('es')

  useEffect(() => {
    const applyStoredTheme = () => {
      const stored = readStoredSettings()
      const theme = resolveTheme(stored?.theme ?? 'system')
      applyThemeToDocument(theme)
      const storedLang = (stored?.language ?? 'es') as Language
      setLanguage(storedLang)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = storedLang
      }
    }

    const handleSettingsUpdate = (event: Event) => {
      const detail = (event as CustomEvent<Partial<StoredSettings>>).detail
      const stored = readStoredSettings()
      const theme = resolveTheme(detail?.theme ?? stored?.theme ?? 'system')
      applyThemeToDocument(theme)
      const nextLang = (detail?.language ?? stored?.language ?? 'es') as Language
      setLanguage(nextLang)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = nextLang
      }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) {
        applyStoredTheme()
      }
    }

    applyStoredTheme()
    window.addEventListener('azahar:settings-updated', handleSettingsUpdate as EventListener)
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('azahar:settings-updated', handleSettingsUpdate as EventListener)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const i18n = useMemo(() => ({
    language,
    t: (key: Parameters<typeof translate>[1]) => translate(language, key),
  }), [language])

  const Provider = ({ children }: { children: React.ReactNode }) => {
    if (persistenceOptions) {
      return (
        <PersistQueryClientProvider client={queryClient} persistOptions={persistenceOptions}>
          {children}
        </PersistQueryClientProvider>
      )
    }
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return (
    <LanguageContext.Provider value={i18n}>
      <Provider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <TasksPage />
                </ProtectedRoute>
              }
            />
            {enableSettings && (
              <Route
                path="/settings"
                element={(
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                )}
              />
            )}
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Router>
      </Provider>
    </LanguageContext.Provider>
  )
}
