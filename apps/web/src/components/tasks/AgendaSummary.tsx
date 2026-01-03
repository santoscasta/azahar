import { useTranslations } from '../../App.js'
import CalendarIcon from '../icons/CalendarIcon.js'

interface AgendaEntry {
  id: string
  title: string
  timeLabel: string
}

interface AgendaSummaryProps {
  entries: AgendaEntry[]
  variant: 'desktop' | 'mobile'
  onSelectEntry?: (taskId: string) => void
}

export default function AgendaSummary({ entries, variant, onSelectEntry }: AgendaSummaryProps) {
  const { t } = useTranslations()

  if (entries.length === 0) {
    return null
  }

  const containerClass = variant === 'mobile' ? 'p-4' : 'p-5'

  return (
    <div className={`rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] ${containerClass}`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
        <CalendarIcon className="h-4 w-4" aria-hidden />
        <span>{t('agenda.title')}</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {entries.map(entry => {
          const row = (
            <div className="flex items-baseline gap-3">
              <span className="w-[72px] shrink-0 text-sm font-semibold text-[var(--color-primary-700)]">
                {entry.timeLabel}
              </span>
              <span className="text-sm text-[var(--on-surface)] truncate">{entry.title}</span>
            </div>
          )
          return (
            <li key={entry.id}>
              {onSelectEntry ? (
                <button
                  type="button"
                  onClick={() => onSelectEntry(entry.id)}
                  className="w-full rounded-[var(--radius-card)] px-2 py-2 text-left hover:bg-[var(--color-primary-50)]"
                >
                  {row}
                </button>
              ) : (
                <div className="px-2 py-1.5">{row}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
