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
      className="rounded-3xl border p-4 space-y-3"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
    >
      <div>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Nueva tarea"
          className="w-full bg-transparent text-lg font-semibold text-slate-900 placeholder-slate-400 outline-none"
        />
        <textarea
          value={draft.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notas"
          className="w-full bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none resize-none mt-1"
          rows={2}
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSchedulePress}
          className="text-sm font-semibold text-white rounded-full px-3 py-1"
          style={{ backgroundColor: 'var(--color-primary-600)' }}
        >
          {scheduleLabel}
        </button>
        <div className="flex items-center gap-3 text-slate-500 text-xl">
          <button type="button" onClick={onLabelsPress} aria-label="Etiquetas">
            🏷
          </button>
          <button type="button" onClick={onDatePress} aria-label="Plazo" className="flex items-center justify-center">
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
                className="px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}
              >
                {label.name}
              </span>
            )
          })}
        </div>
      )}
      {draft.due_at && (
        <p className="text-xs text-slate-500">Plazo: {draft.due_at}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-full border text-sm"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary-700)' }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-2 rounded-full text-white text-sm font-semibold disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-primary-600)' }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
