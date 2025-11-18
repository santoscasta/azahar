interface ErrorBannerProps {
  message: string
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null
  }
  return (
    <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
      {message}
    </div>
  )
}
