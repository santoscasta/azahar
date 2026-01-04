import type { Task } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'
import CalendarIcon from '../icons/CalendarIcon.js'

interface MobileTaskEditSheetProps {
  open: boolean
  task: Task | null
  title: string
  notes: string
  dueLabel: string
  deadlineLabel: string
  labelCount: number
  onChangeTitle: (value: string) => void
  onChangeNotes: (value: string) => void
  onClose: () => void
  onSave: () => void
  onOpenDatePicker: () => void
  onOpenDeadlinePicker: () => void
  onOpenLabels: () => void
  onOpenChecklist: () => void
  onMove: () => void
  onDelete: () => void
  onOpenMenu: () => void
  saving?: boolean
}

export default function MobileTaskEditSheet({
  open,
  task,
  title,
  notes,
  dueLabel,
  deadlineLabel,
  labelCount,
  onChangeTitle,
  onChangeNotes,
  onClose,
  onSave,
  onOpenDatePicker,
  onOpenDeadlinePicker,
  onOpenLabels,
  onOpenChecklist,
  onMove,
  onDelete,
  onOpenMenu,
  saving = false,
}: MobileTaskEditSheetProps) {
  const { t } = useTranslations()

  if (!open || !task) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-surface)] text-[var(--on-surface)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={onClose}
          className="min-h-[44px] px-3 text-sm font-semibold text-[var(--color-text-muted)]"
        >
          {t('actions.cancel')}
        </button>
        <span className="text-sm font-semibold">{t('task.edit.title')}</span>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-60"
        >
          {t('actions.done')}
        </button>
      </div>
      <div className="px-4 py-5 space-y-4 overflow-y-auto pb-28">
        <input
          type="text"
          value={title}
          onChange={(event) => onChangeTitle(event.target.value)}
          placeholder={t('task.edit.titlePlaceholder')}
          className="w-full bg-transparent text-lg font-semibold text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none"
          autoFocus
        />
        <textarea
          value={notes}
          onChange={(event) => onChangeNotes(event.target.value)}
          placeholder={t('task.edit.notesPlaceholder')}
          className="w-full min-h-[140px] bg-transparent text-sm text-[var(--color-text-muted)] placeholder-[var(--color-text-subtle)] outline-none resize-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenDatePicker}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--on-surface)]"
          >
            <CalendarIcon className="h-4 w-4" />
            {t('task.edit.when')}: {dueLabel}
          </button>
          <button
            type="button"
            onClick={onOpenDeadlinePicker}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--on-surface)]"
          >
            <span aria-hidden>⚑</span>
            {t('gtd.due')}: {deadlineLabel}
          </button>
          <button
            type="button"
            onClick={onOpenLabels}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--on-surface)]"
          >
            <span>🏷</span>
            {t('task.labels')}
            {labelCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 text-[11px] font-semibold text-[var(--color-primary-700)]">
                {labelCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onOpenChecklist}
            className="min-h-[44px] inline-flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--on-surface)]"
          >
            <span>☑</span>
            {t('task.checklist')}
          </button>
        </div>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto max-w-2xl flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onMove}
            className="min-h-[44px] flex-1 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--on-surface)]"
          >
            {t('task.move')}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="min-h-[44px] flex-1 rounded-[var(--radius-card)] border border-[var(--color-danger-500)] text-sm font-semibold text-[var(--color-danger-500)]"
          >
            {t('task.trash')}
          </button>
          <button
            type="button"
            onClick={onOpenMenu}
            className="min-h-[44px] rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-text-muted)]"
          >
            {t('task.menu.title')}
          </button>
        </div>
      </div>
    </div>
  )
}
