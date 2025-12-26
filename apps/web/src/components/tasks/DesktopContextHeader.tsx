interface ChipOption {
  id: string
  label: string
}

interface DesktopContextHeaderProps {
  label: string
  title: string
  description: string
  pendingCount: number
  overdueCount: number
  pendingLabel: string
  overdueLabel: string
  chips: ChipOption[]
  activeChip: string
  onChipSelect: (chipId: string) => void
}

export default function DesktopContextHeader({
  label,
  title,
  description,
  pendingCount,
  overdueCount,
  pendingLabel,
  overdueLabel,
  chips,
  activeChip,
  onChipSelect,
}: DesktopContextHeaderProps) {
  const badgeClass =
    'inline-flex items-center justify-center h-5 min-w-[20px] rounded-full px-2 text-[11px] font-semibold border border-[var(--color-border)] bg-[var(--color-surface-elevated)]'
  return (
    <header className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-accent-500)] px-8 py-6 space-y-4 shadow-[var(--shadow-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[220px] flex-1">
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">{label}</p>
          <h1 className="text-[26px] font-bold text-[var(--on-surface)]">{title}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-semibold text-[var(--on-surface)]">
          <span>{pendingLabel}</span>
          <span className={`${badgeClass} text-[var(--on-surface)]`}>{pendingCount}</span>
          {overdueCount > 0 && (
            <>
              <span className={`${badgeClass} text-[var(--color-done-500)]`}>{overdueCount}</span>
              <span className="text-xs text-[var(--color-done-500)]">{overdueLabel}</span>
            </>
          )}
        </div>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map(chip => {
            const isActive = chip.id === activeChip
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onChipSelect(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  isActive
                    ? 'bg-[var(--color-primary-600)] text-[var(--on-primary)] border-[var(--color-primary-600)] shadow'
                    : 'border-[var(--color-border)] text-[var(--on-surface)] hover:bg-[var(--color-primary-100)]'
                }`}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}
    </header>
  )
}
