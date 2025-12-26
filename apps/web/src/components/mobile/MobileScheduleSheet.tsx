import type { QuickViewId } from '../../pages/tasksSelectors.js'

interface MobileScheduleSheetProps {
  open: boolean
  view: QuickViewId
  onClose: () => void
  onSelect: (view: QuickViewId) => void
}

export function MobileScheduleSheet({
  open,
  view,
  onClose,
  onSelect,
}: MobileScheduleSheetProps) {
  if (!open) return null
  const options: { id: QuickViewId; label: string; icon: string }[] = [
    { id: 'today', label: 'Hoy', icon: '⭐' },
    { id: 'upcoming', label: 'Programadas', icon: '📆' },
    { id: 'anytime', label: 'En cualquier momento', icon: '🌤️' },
    { id: 'waiting', label: 'En espera', icon: '⏳' },
    { id: 'someday', label: 'Algún día', icon: '📦' },
    { id: 'reference', label: 'Referencia', icon: '📚' },
    { id: 'inbox', label: 'Entrada', icon: '📥' },
  ]
  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div
        className="absolute inset-x-4 bottom-6 bg-[var(--color-surface)] text-[var(--on-surface)] rounded-2xl p-6 space-y-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">¿Cuándo?</span>
        <button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl">
          ✕
        </button>
      </div>
      {options.map(option => (
        <button
            key={option.id}
            type="button"
            onClick={() => {
              onSelect(option.id)
              onClose()
            }}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left ${
            view === option.id ? 'bg-[var(--color-primary-100)]' : 'hover:bg-[var(--color-surface-elevated)]'
          }`}
        >
            <span>{option.icon}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
