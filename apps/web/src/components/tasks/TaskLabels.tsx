import type { Label, TaskLabelSummary } from '../../lib/supabase.js'

interface TaskLabelsProps {
  taskId: string
  labels: Label[]
  assignedLabels: TaskLabelSummary[]
  isOpen: boolean
  compact?: boolean
  onAddLabel: (taskId: string, labelId: string) => void
  onRemoveLabel: (taskId: string, labelId: string) => void
}

export default function TaskLabels({
  taskId,
  labels,
  assignedLabels,
  isOpen,
  compact = false,
  onAddLabel,
  onRemoveLabel,
}: TaskLabelsProps) {
  if (!isOpen) {
    return null
  }

  const assignedIds = new Set(assignedLabels.map(label => label.id))

  return (
    <div
      className={`${compact ? 'mt-3' : 'ml-9 mt-3'} p-3 rounded-2xl space-y-3`}
      style={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid var(--color-primary-100)' }}
    >
      <div>
        <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-2">Etiquetas asignadas</p>
        {assignedLabels.length === 0 ? (
          <p className="text-xs text-pink-700">La tarea aún no tiene etiquetas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {assignedLabels.map(label => (
              <span key={label.id} className="az-pill">
                {label.name}
                <button
                  type="button"
                  onClick={() => onRemoveLabel(taskId, label.id)}
                  style={{ color: 'var(--color-primary-600)' }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-2">Agregar etiquetas</p>
        <div className="flex flex-wrap gap-2">
          {labels.map(label => {
            const isAssigned = assignedIds.has(label.id)
            return (
              <button
                key={label.id}
                onClick={() => onAddLabel(taskId, label.id)}
                disabled={isAssigned}
                className="az-pill"
                style={{
                  backgroundColor: isAssigned ? 'var(--color-primary-100)' : 'var(--color-surface)',
                  opacity: isAssigned ? 0.5 : 1,
                  border: '1px solid var(--color-primary-100)',
                  cursor: isAssigned ? 'not-allowed' : 'pointer',
                }}
              >
                {isAssigned ? 'Asignada' : `+ ${label.name}`}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
