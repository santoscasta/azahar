import type { Task, Area, Project } from '../../../lib/supabase.js'

interface QuickViewGroup {
  areaId: string | null
  area: Area | null
  projects: Map<string, { project: Project | null; tasks: Task[] }>
  standalone: Task[]
}

interface QuickViewBoardProps {
  quickViewLabel: string
  quickViewDescription: string
  completedCount: number
  totalCount: number
  groups: QuickViewGroup[]
  onSelectArea: (areaId: string) => void
  onSelectProject: (projectId: string) => void
  renderTaskList: (
    tasks: Task[]
  ) => React.ReactNode
}

export default function QuickViewBoard({
  quickViewLabel,
  quickViewDescription,
  completedCount,
  totalCount,
  groups,
  onSelectArea,
  onSelectProject,
  renderTaskList,
}: QuickViewBoardProps) {
  return (
    <div className="space-y-6">
      <div className="az-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Vista rápida</p>
              <h2 className="text-lg font-semibold text-slate-800">{quickViewLabel}</h2>
              <p className="text-sm text-slate-500">{quickViewDescription}</p>
            </div>
            <span className="text-sm text-slate-500">
              {completedCount}/{totalCount} completadas
            </span>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {groups.map(group => (
            <section key={group.areaId || 'none'} className="px-6 py-5 space-y-5">
              {group.area && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Área</p>
                  <button
                    type="button"
                    onClick={() => onSelectArea(group.areaId!)}
                    className="text-base font-semibold text-slate-800 hover:underline text-left"
                  >
                    {group.area.name}
                  </button>
                  <p className="text-xs text-slate-400">
                    {group.projects.size} proyecto{group.projects.size === 1 ? '' : 's'} / {group.standalone.length} tareas sueltas
                  </p>
                </div>
              )}
              <div className="space-y-5">
                {Array.from(group.projects.values()).map(({ project, tasks }) => (
                  <article key={project?.id || 'unknown'} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
                        {project?.id ? (
                          <button
                            type="button"
                            onClick={() => onSelectProject(project.id)}
                            className="text-base font-semibold text-slate-800 hover:underline text-left"
                          >
                            {project.name}
                          </button>
                        ) : (
                          <p className="text-base font-semibold text-slate-800">{project?.name ?? 'Proyecto'}</p>
                        )}
                        <p className="text-xs text-slate-400">{tasks.length} tarea{tasks.length === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                    {renderTaskList(tasks)}
                  </article>
                ))}
                {group.standalone.length > 0 && (
                  <article className="space-y-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Tareas sueltas</p>
                    {renderTaskList(group.standalone)}
                  </article>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
