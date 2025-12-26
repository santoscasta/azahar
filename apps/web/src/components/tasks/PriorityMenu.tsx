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
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-10 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-sm bg-[var(--color-surface)] rounded-2xl p-4 space-y-2 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[var(--on-surface)]">Prioridad</p>
            <button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] text-lg">
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
                className={`w-full min-h-[44px] flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                  isActive
                    ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-100)] text-[var(--on-surface)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]'
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
