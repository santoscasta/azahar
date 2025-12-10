import type { Task, Area, Project } from '../../../lib/supabase.js'

export interface QuickViewGroup {
  areaId: string | null
  area: Area | null
  projects: Map<string, { project: Project | null; tasks: Task[] }>
  standalone: Task[]
}

interface QuickViewBoardProps {
  groups: QuickViewGroup[]
  onSelectArea: (areaId: string) => void
  renderTaskList: (
    tasks: Task[]
  ) => React.ReactNode
}

export default function QuickViewBoard({
  groups,
  onSelectArea,
  renderTaskList,
}: QuickViewBoardProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-[var(--color-border)] bg-white px-6 py-5 space-y-3">
        {renderTaskList([])}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <section
          key={group.areaId || 'none'}
          className="rounded-3xl border border-[var(--color-border)] bg-white px-6 py-5 space-y-5"
        >
          {group.area && (
            <div>
              <p className="text-xs uppercase tracking-wide text-[#736B63]">Área</p>
              <button
                type="button"
                onClick={() => onSelectArea(group.areaId!)}
                className="text-base font-semibold text-[#2D2520] hover:underline text-left"
              >
                {group.area.name}
              </button>
              <p className="text-xs text-[#736B63]">
                {group.projects.size} proyecto{group.projects.size === 1 ? '' : 's'} / {group.standalone.length} tareas sueltas
              </p>
            </div>
          )}
          <div className="space-y-5">
            {Array.from(group.projects.entries()).map(([projectId, { tasks }], index) => (
              <div key={projectId || `project-${index}`} className="space-y-3">
                {renderTaskList(tasks)}
              </div>
            ))}
            {group.standalone.length > 0 && (
              <article className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-[#736B63]">Tareas sueltas</p>
                {renderTaskList(group.standalone)}
              </article>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
