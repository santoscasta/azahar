import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persistenceOptions } from './lib/queryClient'
import { supabase, getCurrentUser } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import { translate, type Language } from './lib/i18n'
import {
  applyThemeToDocument,
  loadSettings,
  resolveThemePreference,
  subscribeToSettings,
} from './lib/settingsStore'

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
    const applySettings = (settings = loadSettings()) => {
      const theme = resolveThemePreference(settings.theme)
      applyThemeToDocument(theme)
      setLanguage(settings.language)
      if (typeof document !== 'undefined') {
        document.documentElement.lang = settings.language
      }
    }

    applySettings()
    const unsubscribe = subscribeToSettings(applySettings)
    const prefersDark = typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-color-scheme: dark)')
      : null
    const handleSystemThemeChange = () => {
      const settings = loadSettings()
      if (settings.theme !== 'system') return
      applyThemeToDocument(resolveThemePreference('system'))
    }

    if (prefersDark) {
      if ('addEventListener' in prefersDark) {
        prefersDark.addEventListener('change', handleSystemThemeChange)
      } else {
        prefersDark.addListener(handleSystemThemeChange)
      }
    }

    return () => {
      unsubscribe()
      if (!prefersDark) return
      if ('removeEventListener' in prefersDark) {
        prefersDark.removeEventListener('change', handleSystemThemeChange)
      } else {
        prefersDark.removeListener(handleSystemThemeChange)
      }
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
            <Route
              path="/help"
              element={(
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              )}
            />
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Router>
      </Provider>
    </LanguageContext.Provider>
  )
}
