import type { FormEvent } from 'react'
import type { Label } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface LabelSheetProps {
  open: boolean
  labels: Label[]
  selection: string[]
  inputValue: string
  isSaving: boolean
  onClose: () => void
  onToggle: (labelId: string) => void
  onDelete: (labelId: string) => void
  onInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onConfirm: () => void
}

export default function LabelSheet({
  open,
  labels,
  selection,
  inputValue,
  isSaving,
  onClose,
  onToggle,
  onDelete,
  onInputChange,
  onSubmit,
  onConfirm,
}: LabelSheetProps) {
  if (!open) {
    return null
  }
  const { t } = useTranslations()

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-[var(--color-surface)] text-[var(--on-surface)] rounded-[var(--radius-container)] p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{t('labels.title')}</span>
            <button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl">
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {labels.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">{t('labels.empty')}</p>}
            {labels.map(label => {
              const active = selection.includes(label.id)
              return (
                <div key={label.id} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggle(label.id)}
                    aria-pressed={active}
                    className={`flex-1 flex items-center justify-between text-left px-3 py-2 rounded-[var(--radius-card)] border ${
                      active
                        ? 'bg-[var(--color-primary-100)] border-[var(--color-primary-200)]'
                        : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)]'
                    }`}
                  >
                    <span>{label.name}</span>
                    {active && <span className="text-xs font-semibold text-[var(--color-primary-600)]">✓</span>}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(label.id)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-xl text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
                    aria-label={`${t('labels.delete')} ${label.name}`}
                  >
                    🗑
                  </button>
                </div>
              )
            })}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder={t('labels.placeholder')}
              className="flex-1 rounded-[var(--radius-container)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none"
            />
          <button
            type="submit"
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-60"
            disabled={isSaving}
          >
            {t('actions.add')}
          </button>
        </form>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold"
          >
            {t('actions.done')}
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
