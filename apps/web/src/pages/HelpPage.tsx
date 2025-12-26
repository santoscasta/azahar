import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../App.js'
import type { QuickViewId } from './tasksSelectors.js'

export default function HelpPage() {
  const { t } = useTranslations()
  const navigate = useNavigate()

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
        <header className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('help.subtitle')}</p>
              <h1 className="text-[26px] font-bold text-[var(--on-surface)]">{t('help.title')}</h1>
              <p className="text-sm text-[var(--color-text-muted)]">{t('help.intro')}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/app')}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
              >
                {t('help.back')}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className="min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-primary-300)]"
              >
                {t('help.settings')}
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">{t('help.principles.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map(step => (
              <div key={step.title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-1">
                <p className="text-sm font-semibold text-[var(--on-surface)]">{step.title}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{step.subtitle}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">{t('help.usage.title')}</h2>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>{t('help.usage.capture')}</li>
            <li>{t('help.usage.organize')}</li>
            <li>{t('help.usage.context')}</li>
            <li>{t('help.usage.review')}</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-8 py-6 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">{t('help.views.title')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {viewItems.map(view => (
              <div key={view.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 space-y-1">
                <p className="text-sm font-semibold text-[var(--on-surface)]">{view.label}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{view.description}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--color-text-subtle)]">{t('help.footer')}</p>
      </div>
    </main>
  )
}
