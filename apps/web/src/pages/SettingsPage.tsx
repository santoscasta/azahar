import { useEffect, useMemo, useState } from 'react'

type ThemeOption = 'system' | 'light' | 'dark'
type LanguageOption = 'es' | 'en'

interface SettingsState {
  theme: ThemeOption
  language: LanguageOption
  animations: boolean
  appBaseUrl: string
}

const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'es',
  animations: true,
  appBaseUrl: '',
}

const SETTINGS_KEY = 'azahar:settings'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)

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
  }, [settings])

  const themeLabel = useMemo(() => {
    switch (settings.theme) {
      case 'light': return 'Claro'
      case 'dark': return 'Oscuro'
      default: return 'Sistema'
    }
  }, [settings.theme])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <header className="rounded-[32px] border border-slate-100 bg-white shadow px-8 py-6 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Preferencias</p>
          <h1 className="text-3xl font-semibold text-slate-900">Ajustes</h1>
          <p className="text-sm text-slate-500">Personaliza tu experiencia local (se guarda en este dispositivo).</p>
        </header>

        <section className="rounded-3xl border border-slate-100 bg-white shadow px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Tema</p>
              <p className="text-xs text-slate-500">Afecta sólo a este navegador.</p>
            </div>
            <select
              value={settings.theme}
              onChange={(event) => setSettings(prev => ({ ...prev, theme: event.target.value as ThemeOption }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="system">Sistema ({themeLabel})</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Idioma UI</p>
              <p className="text-xs text-slate-500">Textos principales en la app.</p>
            </div>
            <select
              value={settings.language}
              onChange={(event) => setSettings(prev => ({ ...prev, language: event.target.value as LanguageOption }))}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Animaciones suaves</p>
              <p className="text-xs text-slate-500">Desactiva si notas lag en dispositivos lentos.</p>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={(event) => setSettings(prev => ({ ...prev, animations: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-sm text-slate-700">{settings.animations ? 'Activas' : 'Desactivadas'}</span>
            </label>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">App Base URL</p>
              <p className="text-xs text-slate-500">Úsalo en entornos locales para callbacks de auth.</p>
            </div>
            <input
              type="text"
              value={settings.appBaseUrl}
              onChange={(event) => setSettings(prev => ({ ...prev, appBaseUrl: event.target.value }))}
              placeholder="https://mi-app.test"
              className="w-64 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSettings(defaultSettings)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300"
            >
              Restaurar valores por defecto
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
