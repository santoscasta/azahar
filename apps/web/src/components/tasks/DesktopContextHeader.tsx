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
  return (
    <header className="rounded-[28px] bg-[var(--color-primary-100)] px-8 py-6 space-y-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#736B63]">{label}</p>
          <h1 className="text-3xl font-semibold text-[#2D2520]">{title}</h1>
          <p className="text-sm text-[#736B63] mt-1">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#736B63]">{pendingLabel}</p>
          <p className="text-2xl font-semibold text-[var(--color-primary-700)]">{pendingCount}</p>
          {overdueCount > 0 && <p className="text-xs text-[#FF7A33]">{overdueCount} {overdueLabel}</p>}
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
                    ? 'bg-[var(--color-primary-600)] text-white border-[var(--color-primary-600)] shadow'
                    : 'border-[var(--color-border)] text-[#2D2520] hover:bg-[var(--color-primary-100)]'
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
