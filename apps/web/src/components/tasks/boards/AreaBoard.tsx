import type { Task, Project } from '../../../lib/supabase.js'

interface AreaBoardProps {
  areaName: string
  projectCount: number
  completedCount: number
  totalCount: number
  projects: Project[]
  tasksByProject: Map<string, Task[]>
  looseTasks: Task[]
  onSelectProject: (projectId: string) => void
  renderTaskList: (tasks: Task[]) => React.ReactNode
}

export default function AreaBoard({
  areaName,
  projectCount,
  completedCount,
  totalCount,
  projects,
  tasksByProject,
  looseTasks,
  onSelectProject,
  renderTaskList,
}: AreaBoardProps) {
  return (
    <div className="az-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Área</p>
          <h2 className="text-lg font-semibold text-slate-800">{areaName}</h2>
          <p className="text-sm text-slate-500">
            {projectCount} proyecto{projectCount === 1 ? '' : 's'}
          </p>
        </div>
        <span className="text-sm text-slate-500">
          {completedCount}/{totalCount} completadas
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {projects.map(project => (
          <section key={project.id} className="px-6 py-5 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
              <button
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="text-base font-semibold text-slate-800 hover:underline text-left"
              >
                {project.name}
              </button>
            </div>
            {renderTaskList(tasksByProject.get(project.id) || [])}
          </section>
        ))}
        {looseTasks.length > 0 && (
          <section className="px-6 py-5">
            {renderTaskList(looseTasks)}
          </section>
        )}
      </div>
    </div>
  )
}
