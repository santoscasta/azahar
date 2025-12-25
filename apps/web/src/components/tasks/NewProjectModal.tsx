import type { FormEvent } from 'react'
import type { Area } from '../../lib/supabase.js'

interface NewProjectModalProps {
  open: boolean
  projectName: string
  selectedAreaId: string | null
  areas: Area[]
  isSaving: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onNameChange: (value: string) => void
  onAreaChange: (value: string | null) => void
}

export default function NewProjectModal({
  open,
  projectName,
  selectedAreaId,
  areas,
  isSaving,
  onClose,
  onSubmit,
  onNameChange,
  onAreaChange,
}: NewProjectModalProps) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Nuevo proyecto</p>
            <p className="text-2xl font-semibold text-slate-900">Da forma a un objetivo</p>
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
            value={projectName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nombre del proyecto"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />
          <select
            value={selectedAreaId || ''}
            onChange={(event) => onAreaChange(event.target.value || null)}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          >
            <option value="">Sin área</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm font-semibold text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
