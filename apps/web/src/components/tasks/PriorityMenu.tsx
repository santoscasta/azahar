type Priority = 0 | 1 | 2 | 3

interface PriorityMenuProps {
  open: boolean
  selected: Priority
  onSelect: (priority: Priority) => void
  onClose: () => void
}

const options: Array<{ value: Priority; label: string; emoji: string }> = [
  { value: 0, label: 'Sin prioridad', emoji: '⚪' },
  { value: 1, label: 'Prioridad baja', emoji: '🟢' },
  { value: 2, label: 'Prioridad media', emoji: '🟡' },
  { value: 3, label: 'Prioridad alta', emoji: '🔴' },
]

export default function PriorityMenu({ open, selected, onSelect, onClose }: PriorityMenuProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-10 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-sm bg-white rounded-3xl p-4 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-900">Prioridad</p>
            <button type="button" onClick={onClose} className="text-slate-400 text-lg">
              ✕
            </button>
          </div>
          {options.map(option => {
            const isActive = option.value === selected
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-[var(--color-border)] text-slate-600 hover:border-[var(--color-primary-400)]'
                }`}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
