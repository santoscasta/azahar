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
    { id: 'someday', label: 'Algún día', icon: '📦' },
    { id: 'inbox', label: 'Entrada', icon: '📥' },
  ]
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60" onClick={onClose}>
      <div
        className="absolute inset-x-4 bottom-6 bg-slate-900 text-white rounded-[32px] p-5 space-y-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">¿Cuándo?</span>
          <button type="button" onClick={onClose} className="text-2xl">
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
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left ${
              view === option.id ? 'bg-slate-800' : ''
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
