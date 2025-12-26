import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Language } from '../lib/i18n.js'
import { translate } from '../lib/i18n.js'
import { useTranslations } from '../App.js'
import { signOut } from '../lib/supabase.js'
import {
  defaultSettings,
  loadSettings,
  persistSettings,
  subscribeToSettings,
  type SettingsState,
  type ThemeOption,
} from '../lib/settingsStore.js'

export default function SettingsPage() {
  const { t } = useTranslations()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SettingsState>(() => loadSettings())
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    persistSettings(settings)
  }, [settings])

  useEffect(() => {
    const unsubscribe = subscribeToSettings(next => setSettings(prev => ({ ...prev, ...next })))
    return unsubscribe
  }, [])

  const defaultViewNames = useMemo(() => ({
    inbox: translate(settings.language, 'view.inbox'),
    today: translate(settings.language, 'view.today'),
    upcoming: translate(settings.language, 'view.upcoming'),
    anytime: translate(settings.language, 'view.anytime'),
    waiting: translate(settings.language, 'view.waiting'),
    someday: translate(settings.language, 'view.someday'),
    reference: translate(settings.language, 'view.reference'),
    logbook: translate(settings.language, 'view.logbook'),
  }), [settings.language])

  const viewName = (id: keyof typeof defaultViewNames) => settings.customViewNames?.[id] || defaultViewNames[id]

  const themeLabel = useMemo(() => {
    switch (settings.theme) {
      case 'light': return translate(settings.language, 'settings.theme.option.light')
      case 'dark': return translate(settings.language, 'settings.theme.option.dark')
      default: return translate(settings.language, 'settings.theme.option.system')
    }
  }, [settings.language, settings.theme])

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
        <header className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('settings.title')}</p>
              <h1 className="text-[26px] font-bold text-[var(--on-surface)]">{t('settings.title')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('settings.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
            >
              {t('settings.back')}
            </button>
          </div>
        </header>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--on-surface)]">{t('settings.theme')}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{t('settings.themeHint')}</p>
            </div>
            <select
              value={settings.theme}
              onChange={(event) => setSettings(prev => ({ ...prev, theme: event.target.value as ThemeOption }))}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
            >
              <option value="system">{t('settings.theme.option.system')} ({themeLabel})</option>
              <option value="light">{t('settings.theme.option.light')}</option>
              <option value="dark">{t('settings.theme.option.dark')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--on-surface)]">{t('settings.language')}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{t('settings.languageHint')}</p>
            </div>
            <select
              value={settings.language}
              onChange={(event) => setSettings(prev => ({ ...prev, language: event.target.value as Language }))}
              className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-[var(--on-surface)]">{t('settings.views.title')}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{t('settings.views.subtitle')}</p>
              </div>
              {settings.customViewNames ? (
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, customViewNames: undefined }))}
                  className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
                >
                  {t('settings.reset')}
                </button>
              ) : null}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {([
                { id: 'inbox', hint: t('settings.views.inbox') },
                { id: 'today', hint: t('settings.views.today') },
                { id: 'upcoming', hint: t('settings.views.upcoming') },
                { id: 'anytime', hint: t('settings.views.anytime') },
                { id: 'waiting', hint: t('settings.views.waiting') },
                { id: 'someday', hint: t('settings.views.someday') },
                { id: 'reference', hint: t('settings.views.reference') },
                { id: 'logbook', hint: t('settings.views.logbook') },
              ] as const).map(view => (
                <label key={view.id} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)]">{defaultViewNames[view.id]}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{view.hint}</p>
                    </div>
                    {settings.customViewNames?.[view.id] ? (
                      <button
                        type="button"
                        onClick={() => setSettings(prev => {
                          const next = { ...(prev.customViewNames ?? {}) }
                          delete next[view.id]
                          return { ...prev, customViewNames: Object.keys(next).length ? next : undefined }
                        })}
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-lg text-[var(--color-text-muted)] hover:text-[var(--on-surface)] hover:bg-[var(--color-surface-elevated)]"
                        aria-label="Reset nombre de vista"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    value={settings.customViewNames?.[view.id] ?? ''}
                    placeholder={viewName(view.id)}
                    onChange={(event) => setSettings(prev => ({
                      ...prev,
                      customViewNames: {
                        ...(prev.customViewNames ?? {}),
                        [view.id]: event.target.value,
                      },
                    }))}
                    onBlur={(event) => setSettings(prev => {
                      const next = { ...(prev.customViewNames ?? {}) }
                      const value = event.target.value.trim()
                      if (value) {
                        next[view.id] = value
                      } else {
                        delete next[view.id]
                      }
                      return { ...prev, customViewNames: Object.keys(next).length ? next : undefined }
                    })}
                    className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--on-surface)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[var(--on-surface)]">{t('settings.completedContexts.title')}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{t('settings.completedContexts.description')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--on-surface)]">
              <input
                type="checkbox"
                checked={settings.showCompletedInContexts}
                onChange={(event) => setSettings(prev => ({ ...prev, showCompletedInContexts: event.target.checked }))}
              />
              {settings.showCompletedInContexts ? t('settings.completedContexts.visible') : t('settings.completedContexts.hidden')}
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSettings(defaultSettings)}
              className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
            >
              {t('settings.reset')}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-[var(--on-surface)]">{t('settings.account')}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{t('settings.accountHint')}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-12 w-12 flex items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] disabled:opacity-60"
            aria-label={t('settings.logout.aria')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
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
