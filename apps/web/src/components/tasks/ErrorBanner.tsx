interface ErrorBannerProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export default function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps) {
  if (!message) {
    return null
  }
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-4 rounded-[var(--radius-container)] border border-[rgba(214,69,69,0.35)] bg-[rgba(214,69,69,0.12)] text-[var(--color-danger-500)] text-sm flex items-center justify-between gap-3"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="min-h-[44px] px-3 py-1 rounded-[var(--radius-chip)] border border-[rgba(214,69,69,0.35)] text-xs font-semibold text-[var(--color-danger-500)] hover:opacity-80"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
