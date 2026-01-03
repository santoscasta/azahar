import { useTranslations } from '../../App.js'

interface MultiSelectActionBarProps {
  variant: 'desktop' | 'mobile'
  count: number
  onCancel: () => void
  onMove: () => void
  onComplete: () => void
  onDelete: () => void
  onCopy: () => void
  onShare: () => void
  onPaste: () => void
  isProcessing?: boolean
}

function ActionButton({
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'default' | 'danger'
}) {
  const toneClass =
    tone === 'danger'
      ? 'border-[var(--color-danger-500)] text-[var(--color-danger-500)]'
      : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border text-sm font-semibold transition ${toneClass} disabled:opacity-50`}
    >
      {label}
    </button>
  )
}

export default function MultiSelectActionBar({
  variant,
  count,
  onCancel,
  onMove,
  onComplete,
  onDelete,
  onCopy,
  onShare,
  onPaste,
  isProcessing = false,
}: MultiSelectActionBarProps) {
  const { t } = useTranslations()
  const hasSelection = count > 0
  const container =
    variant === 'desktop'
      ? 'fixed inset-x-0 bottom-6 z-40 flex justify-center pointer-events-none'
      : 'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md'
  const surface =
    variant === 'desktop'
      ? 'pointer-events-auto rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 shadow-lg'
      : 'mx-auto max-w-2xl px-4 py-4'

  return (
    <div className={container} style={variant === 'mobile' ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' } : undefined}>
      <div className={`w-full max-w-5xl ${surface}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm font-semibold text-[var(--on-surface)]">
            {t('multiSelect.selected')}: {count}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]"
          >
            {t('multiSelect.done')}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton
            label={t('multiSelect.actions.move')}
            onClick={onMove}
            disabled={!hasSelection || isProcessing}
          />
          <ActionButton
            label={t('multiSelect.actions.complete')}
            onClick={onComplete}
            disabled={!hasSelection || isProcessing}
          />
          <ActionButton
            label={t('multiSelect.actions.copy')}
            onClick={onCopy}
            disabled={!hasSelection || isProcessing}
          />
          <ActionButton
            label={t('multiSelect.actions.share')}
            onClick={onShare}
            disabled={!hasSelection || isProcessing}
          />
          <ActionButton
            label={t('multiSelect.actions.paste')}
            onClick={onPaste}
            disabled={isProcessing}
          />
          <ActionButton
            label={t('multiSelect.actions.delete')}
            onClick={onDelete}
            disabled={!hasSelection || isProcessing}
            tone="danger"
          />
        </div>
      </div>
    </div>
  )
}
