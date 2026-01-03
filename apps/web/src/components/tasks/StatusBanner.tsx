interface StatusBannerProps {
  message: string
}

export default function StatusBanner({ message }: StatusBannerProps) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 rounded-[var(--radius-container)] border border-[var(--color-primary-200)] bg-[var(--color-primary-100)] px-4 py-3 text-sm font-medium text-[var(--color-primary-700)]"
    >
      {message}
    </div>
  )
}
