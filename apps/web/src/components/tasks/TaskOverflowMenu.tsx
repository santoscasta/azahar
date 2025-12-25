import type { Task } from '../../lib/supabase.js'

interface TaskOverflowMenuProps {
  open: boolean
  task: Task | null
  isDuplicating: boolean
  isPinning: boolean
  onTogglePin: () => void
  onDuplicate: () => void
  onCopyLink: () => void
  onClose: () => void
}

export default function TaskOverflowMenu({
  open,
  task,
  isDuplicating,
  isPinning,
  onTogglePin,
  onDuplicate,
  onCopyLink,
  onClose,
}: TaskOverflowMenuProps) {
  if (!open || !task) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-white rounded-[32px] p-5 space-y-4 shadow-2xl">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Acciones</p>
          <p className="text-lg font-semibold text-slate-900">{task.title}</p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onTogglePin}
            disabled={isPinning}
            className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-slate-700 hover:border-[var(--color-primary-400)] disabled:opacity-60"
          >
            {task.pinned ? 'Quitar fijado' : 'Fijar tarea'}
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            disabled={isDuplicating}
            className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-slate-700 hover:border-[var(--color-primary-400)] disabled:opacity-60"
          >
            Duplicar tarea
          </button>
          <button
            type="button"
            onClick={onCopyLink}
            className="w-full rounded-2xl border border-[var(--color-border)] px-4 py-3 text-left font-semibold text-slate-700 hover:border-[var(--color-primary-400)]"
          >
            Copiar enlace
          </button>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[var(--color-border)] text-sm font-semibold text-slate-600 hover:border-[var(--color-primary-400)]"
          >
            Cerrar
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
