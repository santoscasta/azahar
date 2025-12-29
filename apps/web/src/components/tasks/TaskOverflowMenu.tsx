import type { Task } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

type QuickViewActionId = 'waiting' | 'someday' | 'reference'

interface TaskOverflowMenuProps {
  open: boolean
  task: Task | null
  isDuplicating: boolean
  isPinning: boolean
  isApplyingQuickView?: boolean
  quickViewActions?: Array<{ id: QuickViewActionId; label: string; active: boolean }>
  onApplyQuickView?: (view: QuickViewActionId) => void
  onTogglePin: () => void
  onDuplicate: () => void
  onCopyLink: () => void
  onClose: () => void
}

export default function TaskOverflowMenu({
  open,
  task,
  isDuplicating,
  isPinning,
  isApplyingQuickView = false,
  quickViewActions = [],
  onApplyQuickView,
  onTogglePin,
  onDuplicate,
  onCopyLink,
  onClose,
}: TaskOverflowMenuProps) {
  if (!open || !task) {
    return null
  }
  const { t } = useTranslations()
  const quickViewIcons: Record<QuickViewActionId, string> = {
    waiting: '⏳',
    someday: '📦',
    reference: '📚',
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-[var(--color-surface)] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">{t('task.menu.title')}</p>
            <p className="text-lg font-semibold text-[var(--on-surface)]">{task.title}</p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={onTogglePin}
              disabled={isPinning}
              className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-400)] disabled:opacity-60"
            >
              {task.pinned ? t('task.menu.unpin') : t('task.menu.pin')}
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              disabled={isDuplicating}
              className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-400)] disabled:opacity-60"
            >
              {t('task.menu.duplicate')}
            </button>
            <button
              type="button"
              onClick={onCopyLink}
              className="w-full min-h-[44px] rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-400)]"
            >
              {t('task.menu.copyLink')}
            </button>
          </div>
          {quickViewActions.length > 0 && onApplyQuickView && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--color-text-muted)]">{t('task.quickView.title')}</p>
              <div className="grid gap-2">
                {quickViewActions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={isApplyingQuickView}
                    onClick={() => onApplyQuickView(action.id)}
                    className={`w-full min-h-[44px] rounded-xl border px-4 py-3 text-left font-semibold transition disabled:opacity-60 ${
                      action.active
                        ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-100)] text-[var(--color-primary-700)]'
                        : 'border-[var(--color-border)] text-[var(--on-surface)] hover:border-[var(--color-primary-400)]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="text-lg">{quickViewIcons[action.id]}</span>
                      <span>{action.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]"
            >
              {t('actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
