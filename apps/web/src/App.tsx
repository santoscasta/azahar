import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { supabase, getCurrentUser } from './lib/supabase'
import LoginPage from './pages/LoginPage'
import TasksPage from './pages/TasksPage'
import SettingsPage from './pages/SettingsPage'

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

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  )
}
