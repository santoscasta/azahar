import { useMemo, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../App.js'
import { searchTasks } from '../lib/supabase.js'
import { formatISODate } from '../lib/dateUtils.js'
import { buildQuickViewStats, filterTasksByQuickView, type QuickViewId } from './tasksSelectors.js'
import todayIcon from '../assets/icons/today.svg'

export default function HelpPage() {
  const { t } = useTranslations()
  const navigate = useNavigate()
  const todayISO = useMemo(() => formatISODate(new Date()), [])
  const { data: widgetTasks = [], isLoading: widgetsLoading } = useQuery({
    queryKey: ['help', 'widgets', 'tasks'],
    queryFn: async () => {
      const result = await searchTasks()
      if (!result.success) {
        return []
      }
      return result.tasks || []
    },
  })
  const widgetStats = useMemo(() => buildQuickViewStats(widgetTasks, todayISO), [todayISO, widgetTasks])
  const todayWidgetTasks = useMemo(
    () => filterTasksByQuickView(widgetTasks, 'today', todayISO).slice(0, 3),
    [todayISO, widgetTasks]
  )
  const widgetCountStyle = {
    '--az-pill-bg': 'var(--color-accent-200)',
    '--az-pill-text': 'var(--on-surface)',
    '--az-pill-border': 'var(--color-accent-200)',
  } as CSSProperties

  const steps = useMemo(() => ([
    { title: t('gtd.capture'), subtitle: t('gtd.capture.subtitle') },
    { title: t('gtd.clarify'), subtitle: t('gtd.clarify.subtitle') },
    { title: t('gtd.organize'), subtitle: t('gtd.organize.subtitle') },
    { title: t('gtd.reflect'), subtitle: t('gtd.reflect.subtitle') },
    { title: t('gtd.engage'), subtitle: t('gtd.engage.subtitle') },
  ]), [t])

  const viewItems: { id: QuickViewId; label: string; description: string }[] = useMemo(() => ([
    { id: 'inbox', label: t('view.inbox'), description: t('view.desc.inbox') },
    { id: 'today', label: t('view.today'), description: t('view.desc.today') },
    { id: 'upcoming', label: t('view.upcoming'), description: t('view.desc.upcoming') },
    { id: 'anytime', label: t('view.anytime'), description: t('view.desc.anytime') },
    { id: 'waiting', label: t('view.waiting'), description: t('view.desc.waiting') },
    { id: 'someday', label: t('view.someday'), description: t('view.desc.someday') },
    { id: 'reference', label: t('view.reference'), description: t('view.desc.reference') },
    { id: 'logbook', label: t('view.logbook'), description: t('view.desc.logbook') },
  ]), [t])

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <header className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="az-meta text-[var(--color-text-muted)]">{t('help.subtitle')}</p>
              <h1 className="az-h1 text-[var(--on-surface)]">{t('help.title')}</h1>
              <p className="az-body text-[var(--color-text-muted)]">{t('help.intro')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
              >
                {t('help.back')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
              >
                {t('help.settings')}
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6 space-y-4">
          <h2 className="az-h2 text-[var(--on-surface)]">{t('help.principles.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map(step => (
              <div key={step.title} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-1">
                <p className="text-sm font-semibold text-[var(--on-surface)]">{step.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6 space-y-3">
          <h2 className="az-h2 text-[var(--on-surface)]">{t('help.usage.title')}</h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>{t('help.usage.capture')}</li>
            <li>{t('help.usage.organize')}</li>
            <li>{t('help.usage.context')}</li>
            <li>{t('help.usage.review')}</li>
          </ul>
        </section>

        <section className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6 space-y-4">
          <h2 className="az-h2 text-[var(--on-surface)]">{t('help.views.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {viewItems.map(view => (
              <div key={view.id} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-1">
                <p className="text-sm font-semibold text-[var(--on-surface)]">{view.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{view.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-6 space-y-4">
          <h2 className="az-h2 text-[var(--on-surface)]">{t('help.widgets.title')}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--on-surface)]">
                  <span className="h-7 w-7 rounded-[var(--radius-card)] bg-[var(--color-accent-200)] flex items-center justify-center">
                    <img src={todayIcon} alt="" className="h-4 w-4" />
                  </span>
                  <span>{t('view.today')}</span>
                </div>
                <span className="az-pill" style={widgetCountStyle}>{widgetStats.today}</span>
              </div>
              <div className="space-y-2">
                {widgetsLoading ? (
                  <>
                    <div className="h-2.5 rounded bg-[var(--color-divider)] opacity-70" />
                    <div className="h-2.5 rounded bg-[var(--color-divider)] opacity-50" />
                    <div className="h-2.5 rounded bg-[var(--color-divider)] opacity-40" />
                  </>
                ) : todayWidgetTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {todayWidgetTasks.map(task => (
                      <li key={task.id} className="flex items-center gap-2 text-xs text-[var(--on-surface)]">
                        <span className="h-2.5 w-2.5 rounded-full border border-[var(--color-border)]" aria-hidden />
                        <span className="truncate">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)]">{t('help.widgets.home.empty')}</p>
                )}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{t('help.widgets.home.description')}</p>
            </div>
            <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[var(--on-surface)]">
                  <span className="h-7 w-7 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
                    <img src={todayIcon} alt="" className="h-3.5 w-3.5" />
                  </span>
                  <span>{t('view.today')}</span>
                </div>
                <span className="az-pill" style={widgetCountStyle}>{widgetStats.today}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span className="h-7 w-7 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-base">+</span>
                <span>{t('help.widgets.lock.description')}</span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">{t('help.widgets.lock.title')}</p>
            </div>
          </div>
        </section>

        <p className="text-xs text-[var(--color-text-subtle)]">{t('help.footer')}</p>
      </div>
    </main>
  )
}
