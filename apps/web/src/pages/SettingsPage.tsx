import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Language } from '../lib/i18n.js'
import { useTranslations } from '../App.js'
import { signOut } from '../lib/supabase.js'

type ThemeOption = 'system' | 'light' | 'dark'

interface SettingsState {
  theme: ThemeOption
  language: Language
  showCompletedInContexts: boolean
}

const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'es',
  showCompletedInContexts: true,
}

const SETTINGS_KEY = 'azahar:settings'

export default function SettingsPage() {
  const { t } = useTranslations()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch {
      setSettings(defaultSettings)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azahar:settings-updated', { detail: settings }))
    }
  }, [settings])

  const themeLabel = useMemo(() => {
    switch (settings.theme) {
      case 'light': return 'Claro'
      case 'dark': return 'Oscuro'
      default: return 'Sistema'
    }
  }, [settings.theme])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    const result = await signOut()
    setLoggingOut(false)
    if (result.success) {
      navigate('/login')
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <header className="rounded-[32px] border border-slate-100 bg-white shadow px-8 py-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{t('settings.title')}</p>
              <h1 className="text-3xl font-semibold text-slate-900">{t('settings.title')}</h1>
              <p className="text-sm text-slate-500">{t('settings.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300"
            >
              {t('settings.back')}
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white shadow px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('settings.theme')}</p>
              <p className="text-xs text-slate-500">{t('settings.themeHint')}</p>
            </div>
            <select
              value={settings.theme}
              onChange={(event) => setSettings(prev => ({ ...prev, theme: event.target.value as ThemeOption }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="system">{t('settings.theme.option.system')} ({themeLabel})</option>
              <option value="light">{t('settings.theme.option.light')}</option>
              <option value="dark">{t('settings.theme.option.dark')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('settings.language')}</p>
              <p className="text-xs text-slate-500">{t('settings.languageHint')}</p>
            </div>
            <select
              value={settings.language}
              onChange={(event) => setSettings(prev => ({ ...prev, language: event.target.value as Language }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Mostrar completadas en proyectos/áreas</p>
              <p className="text-xs text-slate-500">Incluye una sección “Completadas” en vistas de proyecto y área.</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={settings.showCompletedInContexts}
                onChange={(event) => setSettings(prev => ({ ...prev, showCompletedInContexts: event.target.checked }))}
              />
              {settings.showCompletedInContexts ? 'Visible' : 'Ocultas'}
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSettings(defaultSettings)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300"
            >
              {t('settings.reset')}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white shadow px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">Cuenta</p>
            <p className="text-xs text-slate-500">Cerrar sesión y volver a la pantalla de inicio</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-12 w-12 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[#736B63] hover:bg-[var(--color-primary-100)] disabled:opacity-60"
            aria-label="Cerrar sesión"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 17H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h8" />
              <path d="M12 12h9" />
              <path d="M18 15l3-3-3-3" />
            </svg>
          </button>
        </section>
      </div>
    </main>
  )
}
