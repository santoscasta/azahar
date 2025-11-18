import { useState } from 'react'

interface ChecklistSheetProps {
  open: boolean
  items: Array<{ id: string; text: string; completed: boolean }>
  onClose: () => void
  onToggle: (itemId: string) => void
  onAdd: (text: string) => void
  onUpdate: (itemId: string, text: string) => void
  onRemove: (itemId: string) => void
}

export default function ChecklistSheet({
  open,
  items,
  onClose,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
}: ChecklistSheetProps) {
  const [inputValue, setInputValue] = useState('')

  if (!open) {
    return null
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(inputValue)
    setInputValue('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-white rounded-[32px] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900">Checklist</span>
          <button type="button" onClick={onClose} className="text-2xl">
            ✕
          </button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.length === 0 && <p className="text-sm text-slate-500">Aún no hay elementos.</p>}
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={`h-6 w-6 rounded-full border flex items-center justify-center text-sm ${
                  item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'
                }`}
              >
                ✓
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(event) => onUpdate(item.id, event.target.value)}
                className="flex-1 border-none bg-transparent text-sm text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="text-slate-400 hover:text-rose-500"
                aria-label="Eliminar elemento"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Nueva tarea"
            className="flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-[var(--color-primary-600)] text-white text-sm font-semibold disabled:opacity-60"
            disabled={!inputValue.trim()}
          >
            Añadir
          </button>
        </form>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[var(--color-primary-600)] text-white text-sm font-semibold"
          >
            Listo
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
