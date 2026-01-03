import type { MobileTaskDraft } from '../../hooks/useTaskCreation.js'
import CalendarIcon from '../icons/CalendarIcon.js'

interface MobileDraftCardProps {
  draft: MobileTaskDraft
  labels: { id: string; name: string }[]
  scheduleLabel: string
  onTitleChange: (value: string) => void
  onNotesChange: (value: string) => void
  onSchedulePress: () => void
  onLabelsPress: () => void
  onDatePress: () => void
  onCancel: () => void
  onSave: () => void
  saving?: boolean
}

export function MobileDraftCard({
  draft,
  labels,
  scheduleLabel,
  onTitleChange,
  onNotesChange,
  onSchedulePress,
  onLabelsPress,
  onDatePress,
  onCancel,
  onSave,
  saving,
}: MobileDraftCardProps) {
  return (
    <div
      className="rounded-[var(--radius-container)] border p-4 space-y-3"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Nueva tarea"
          className="w-full bg-transparent text-lg font-semibold text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none"
        />
        <textarea
          value={draft.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notas"
          className="w-full bg-transparent text-sm text-[var(--color-text-muted)] placeholder-[var(--color-text-subtle)] outline-none resize-none mt-1"
          rows={2}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSchedulePress}
          className="min-h-[44px] text-sm font-semibold text-[var(--on-primary)] rounded-[var(--radius-card)] px-4 py-2 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-action-500)' }}
        >
          {scheduleLabel}
        </button>
        <div className="flex items-center gap-3 text-[var(--color-text-muted)] text-xl">
          <button type="button" onClick={onLabelsPress} aria-label="Etiquetas">
            🏷
          </button>
          <button type="button" onClick={onDatePress} aria-label="Cuando" className="flex items-center justify-center">
            <CalendarIcon className="h-5 w-5" />
          </button>
          <button type="button" disabled className="opacity-50" aria-label="Checklist (pronto)">
            ☑
          </button>
        </div>
      </div>
      {draft.labelIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {draft.labelIds.map(labelId => {
            const label = labels.find(item => item.id === labelId)
            if (!label) {
              return null
            }
            return (
              <span
                key={label.id}
                className="px-2 py-1 rounded-[var(--radius-chip)] text-xs"
                style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)' }}
              >
                {label.name}
              </span>
            )
          })}
        </div>
      )}
      {draft.due_at && (
        <p className="text-xs text-[var(--color-text-muted)]">Cuando: {draft.due_at}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span
            className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] px-3 py-1 font-semibold border"
            style={{ backgroundColor: 'var(--color-surface-elevated)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}
          >
            <span aria-hidden>✓</span>
            Autoguardado
          </span>
          <span className="hidden sm:inline text-[var(--color-text-muted)]">Marca "Listo" cuando quieras crearla.</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--on-surface)] hover:border-[var(--color-primary-600)]"
            style={{ borderColor: 'var(--color-border)' }}
            aria-label="Cancelar borrador"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-card)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-action-500)' }}
            aria-label="Crear tarea"
          >
            <span className="text-lg" aria-hidden>✓</span>
            <span>{saving ? 'Guardando…' : 'Listo'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
