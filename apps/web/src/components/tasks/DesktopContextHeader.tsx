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
  chips,
  activeChip,
  onChipSelect,
}: DesktopContextHeaderProps) {
  return (
    <header className="rounded-[32px] border border-slate-100 bg-white shadow px-8 py-6 space-y-4">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
          <p className="text-2xl font-semibold text-slate-900">{pendingCount}</p>
          {overdueCount > 0 && <p className="text-xs text-rose-500">{overdueCount} vencida(s)</p>}
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
                  isActive ? 'bg-slate-900 text-white border-slate-900 shadow' : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
