import type { Task, Project, ProjectHeading } from '../../../lib/supabase.js'

interface ProjectBoardProps {
  project: Project
  headings: ProjectHeading[]
  tasksByHeading: Map<string, Task[]>
  completedCount: number
  totalCount: number
  showCompletedTasks: boolean
  headingEditingId: string | null
  headingEditingName: string
  onStartEditHeading: (headingId: string, name: string) => void
  onChangeHeadingName: (value: string) => void
  onSaveHeadingName: () => void
  onCancelHeadingEdit: () => void
  onDeleteHeading: (headingId: string) => void
  onSelectArea: (areaId: string) => void
  areaName?: string | null
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean }) => React.ReactNode
  renderHeadingForm?: () => React.ReactNode
}

export default function ProjectBoard({
  project,
  headings,
  tasksByHeading,
  completedCount,
  totalCount,
  showCompletedTasks,
  headingEditingId,
  headingEditingName,
  onStartEditHeading,
  onChangeHeadingName,
  onSaveHeadingName,
  onCancelHeadingEdit,
  onDeleteHeading,
  onSelectArea,
  areaName,
  renderTaskList,
  renderHeadingForm,
}: ProjectBoardProps) {
  const openTasksByHeading = new Map<string, Task[]>()
  const completedTasks: Task[] = []

  tasksByHeading.forEach((list, headingId) => {
    const open = list.filter(task => task.status !== 'done')
    const done = list.filter(task => task.status === 'done')
    if (open.length > 0) {
      openTasksByHeading.set(headingId, open)
    }
    if (done.length > 0) {
      completedTasks.push(...done)
    }
  })
  const unassignedOpen = openTasksByHeading.get('unassigned') || []

  return (
    <div className="space-y-6">
      <div className="az-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
              <h2 className="text-lg font-semibold text-slate-800">{project.name}</h2>
              {project.area_id && areaName && (
                <button
                  type="button"
                  onClick={() => onSelectArea(project.area_id!)}
                  className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline"
                >
                  {areaName}
                </button>
              )}
            </div>
            <span className="text-sm text-slate-500">
              {completedCount}/{totalCount} completadas
            </span>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {renderHeadingForm ? renderHeadingForm() : null}
          <div className="space-y-3">
            {headings.map(heading => (
              <div key={heading.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2">
                {headingEditingId === heading.id ? (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault()
                      onSaveHeadingName()
                    }}
                    className="flex flex-1 items-center gap-2"
                  >
                    <input
                      type="text"
                      value={headingEditingName}
                      onChange={(event) => onChangeHeadingName(event.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                    <button type="submit" className="az-btn-primary px-3 py-1 text-xs">
                      Guardar
                    </button>
                    <button type="button" onClick={onCancelHeadingEdit} className="az-btn-secondary px-3 py-1 text-xs">
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{heading.name}</p>
                      <p className="text-xs text-slate-400">
                        {(openTasksByHeading.get(heading.id)?.length || 0)} tarea
                        {openTasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onStartEditHeading(heading.id, heading.name)}
                        className="p-1 rounded-full text-xs text-slate-500 hover:text-slate-800"
                        title="Renombrar"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHeading(heading.id)}
                        className="p-1 rounded-full text-xs text-rose-500 hover:text-rose-700"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {headings.map(heading => (
            <section key={heading.id} className="space-y-3">
              <div className="flex items-center justify_between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Sección</p>
                  <p className="text-base font-semibold text-slate-800">{heading.name}</p>
                  <p className="text-xs text-slate-400">
                    {(openTasksByHeading.get(heading.id)?.length || 0)} tarea
                    {openTasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              {renderTaskList(openTasksByHeading.get(heading.id) || [], { showEmptyState: false })}
            </section>
          ))}
          {unassignedOpen.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Tareas sin sección</p>
              {renderTaskList(unassignedOpen, { showEmptyState: false })}
            </section>
          )}
          {showCompletedTasks && completedTasks.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Completadas</p>
              {renderTaskList(completedTasks, { showEmptyState: false })}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
