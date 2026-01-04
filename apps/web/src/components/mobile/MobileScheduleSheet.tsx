import type { QuickViewId } from '../../pages/tasksSelectors.js'
import { useTranslations } from '../../App.js'

interface MobileScheduleSheetProps {
  open: boolean
  view: QuickViewId
  onClose: () => void
  onSelect: (view: QuickViewId) => void
}

export function MobileScheduleSheet({
  open,
  view,
  onClose,
  onSelect,
}: MobileScheduleSheetProps) {
  if (!open) return null
  const { t } = useTranslations()
  const options: { id: QuickViewId; label: string; icon: string }[] = [
    { id: 'today', label: t('view.today'), icon: '⭐' },
    { id: 'upcoming', label: t('view.upcoming'), icon: '📆' },
    { id: 'anytime', label: t('view.anytime'), icon: '🌤️' },
    { id: 'waiting', label: t('view.waiting'), icon: '⏳' },
    { id: 'someday', label: t('view.someday'), icon: '📦' },
    { id: 'reference', label: t('view.reference'), icon: '📚' },
    { id: 'inbox', label: t('view.inbox'), icon: '📥' },
  ]
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div
        className="absolute inset-x-4 bottom-6 bg-[var(--color-surface)] text-[var(--on-surface)] rounded-[var(--radius-container)] p-6 space-y-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-1">
          <span className="text-lg font-semibold">{t('schedule.title')}</span>
          <p className="text-xs text-[var(--color-text-muted)]">{t('schedule.hint')}</p>
        </div>
        {options.map(option => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              onSelect(option.id)
              onClose()
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-[var(--radius-card)] text-left ${
              view === option.id ? 'bg-[var(--color-primary-100)]' : 'hover:bg-[var(--color-surface-elevated)]'
            }`}
          >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]"
          >
            {t('actions.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
