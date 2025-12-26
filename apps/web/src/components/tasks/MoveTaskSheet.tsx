import type { Area, Project, Task } from '../../lib/supabase.js'

interface MoveTaskSheetProps {
  open: boolean
  task: Task | null
  areas: Area[]
  projects: Project[]
  isProcessing?: boolean
  onClose: () => void
  onSelect: (destination: { areaId: string | null; projectId: string | null }) => void
}

export default function MoveTaskSheet({
  open,
  task,
  areas,
  projects,
  isProcessing = false,
  onClose,
  onSelect,
}: MoveTaskSheetProps) {
  if (!open) {
    return null
  }

  const groupedProjects = projects.reduce<Record<string, Project[]>>((acc, project) => {
    const key = project.area_id || 'none'
    acc[key] = acc[key] || []
    acc[key].push(project)
    return acc
  }, {})

  const handleSelection = (areaId: string | null, projectId: string | null) => {
    if (isProcessing) {
      return
    }
    onSelect({ areaId, projectId })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-[var(--color-surface)] text-[var(--on-surface)] rounded-2xl p-6 space-y-6 shadow-2xl border border-[var(--color-border)]">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Mover tarea</p>
            <p className="text-lg font-semibold text-[var(--on-surface)]">{task?.title || 'Selecciona destino'}</p>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            <section>
              <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">General</p>
              <button
                type="button"
                onClick={() => handleSelection(null, null)}
                className="w-full min-h-[44px] flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-medium text-[var(--on-surface)] transition hover:border-[var(--color-primary-600)]"
                disabled={isProcessing}
              >
                <span>Inbox</span>
                <span className="text-lg">→</span>
              </button>
            </section>
            {areas.map(area => (
              <section key={area.id} className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelection(area.id, null)}
                  className="w-full min-h-[44px] flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-medium text-[var(--on-surface)] transition hover:border-[var(--color-primary-600)]"
                  disabled={isProcessing}
                >
                  <span>{area.name}</span>
                  <span className="text-lg">→</span>
                </button>
                {groupedProjects[area.id]?.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleSelection(project.area_id || null, project.id)}
                    className="w-full min-h-[44px] flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-medium text-[var(--on-surface)] transition hover:border-[var(--color-primary-600)]"
                    disabled={isProcessing}
                  >
                    <span className="pl-4">{project.name}</span>
                    <span className="text-lg">→</span>
                  </button>
                ))}
              </section>
            ))}
            {groupedProjects.none && groupedProjects.none.length > 0 && (
              <section className="space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">Proyectos sin área</p>
                {groupedProjects.none.map(project => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => handleSelection(null, project.id)}
                    className="w-full min-h-[44px] flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 text-left font-medium text-[var(--on-surface)] transition hover:border-[var(--color-primary-600)]"
                    disabled={isProcessing}
                  >
                    <span>{project.name}</span>
                    <span className="text-lg">→</span>
                  </button>
                ))}
              </section>
            )}
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
