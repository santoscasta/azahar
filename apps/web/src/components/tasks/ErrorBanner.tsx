interface ErrorBannerProps {
  message: string
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null
  }
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-4 rounded-[var(--radius-container)] border border-[rgba(214,69,69,0.35)] bg-[rgba(214,69,69,0.12)] text-[var(--color-danger-500)] text-sm"
    >
      {message}
    </div>
  )
}
