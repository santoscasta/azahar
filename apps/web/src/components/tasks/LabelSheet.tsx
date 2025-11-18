import type { FormEvent } from 'react'
import type { Label } from '../../lib/supabase.js'

interface LabelSheetProps {
  open: boolean
  labels: Label[]
  selection: string[]
  inputValue: string
  isSaving: boolean
  onClose: () => void
  onToggle: (labelId: string) => void
  onDelete: (labelId: string) => void
  onInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onConfirm: () => void
}

export default function LabelSheet({
  open,
  labels,
  selection,
  inputValue,
  isSaving,
  onClose,
  onToggle,
  onDelete,
  onInputChange,
  onSubmit,
  onConfirm,
}: LabelSheetProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-slate-900 text-white rounded-[32px] p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Etiquetas</span>
          <button type="button" onClick={onClose} className="text-2xl">
            ✕
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {labels.length === 0 && <p className="text-sm text-slate-300">Aún no tienes etiquetas.</p>}
          {labels.map(label => {
            const active = selection.includes(label.id)
            return (
              <div key={label.id} className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggle(label.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-2xl ${
                    active ? 'bg-slate-800' : 'bg-slate-800/30'
                  }`}
                >
                  {label.name}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(label.id)}
                  className="text-xl text-slate-400"
                  aria-label={`Eliminar ${label.name}`}
                >
                  🗑
                </button>
              </div>
            )
          })}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Nueva etiqueta"
            className="flex-1 rounded-2xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-2xl bg-[var(--color-primary-600)] text-sm font-semibold disabled:opacity-60"
            disabled={isSaving}
          >
            Añadir
          </button>
        </form>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-full bg-[var(--color-primary-600)] text-sm font-semibold"
          >
            Listo
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
