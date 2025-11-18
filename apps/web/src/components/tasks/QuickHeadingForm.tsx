import type { FormEvent } from 'react'

interface QuickHeadingFormProps {
  open: boolean
  headingName: string
  hasProjectSelected: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onNameChange: (value: string) => void
}

export default function QuickHeadingForm({
  open,
  headingName,
  hasProjectSelected,
  isSaving,
  onClose,
  onSubmit,
  onNameChange,
}: QuickHeadingFormProps) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Nueva sección</p>
            <p className="text-2xl font-semibold text-slate-900">Agrupa tus tareas</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={headingName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nombre de la sección"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasProjectSelected || isSaving}
              className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Crear sección'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
