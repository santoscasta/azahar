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
  showCompletedTasks: boolean
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
  showCompletedTasks,
}: AreaBoardProps) {
  const openTasksByProject = new Map<string, Task[]>()
  const completedTasks: Task[] = []

  tasksByProject.forEach((list, key) => {
    const open = list.filter(task => task.status !== 'done')
    const done = list.filter(task => task.status === 'done')
    openTasksByProject.set(key, open)
    if (done.length > 0) {
      completedTasks.push(...done)
    }
  })

  const openLoose = openTasksByProject.get('loose') || looseTasks.filter(task => task.status !== 'done')

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
            {renderTaskList(openTasksByProject.get(project.id) || [])}
          </section>
        ))}
        {openLoose.length > 0 && (
          <section className="px-6 py-5">
            {renderTaskList(openLoose)}
          </section>
        )}
        {showCompletedTasks && completedTasks.length > 0 && (
          <section className="px-6 py-5 space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Completadas</p>
            {renderTaskList(completedTasks)}
          </section>
        )}
      </div>
    </div>
  )
}
