import type { FormEvent } from 'react'

interface NewAreaModalProps {
  open: boolean
  areaName: string
  isSaving: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onNameChange: (value: string) => void
}

export default function NewAreaModal({
  open,
  areaName,
  isSaving,
  onClose,
  onSubmit,
  onNameChange,
}: NewAreaModalProps) {
  if (!open) {
    return null
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Nueva área</p>
            <p className="text-[24px] font-bold text-[var(--on-surface)]">Organiza tus espacios</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--on-surface)] text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={areaName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Nombre del área"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--color-primary-600)] text-[var(--on-primary)] text-sm font-semibold shadow-lg disabled:opacity-60"
            >
              {isSaving ? 'Guardando...' : 'Crear área'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
