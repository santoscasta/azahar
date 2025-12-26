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
  const hasAnyList = projects.length > 0 || openLoose.length > 0 || (showCompletedTasks && completedTasks.length > 0)

  return (
    <div className="az-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-6 border-b border-[var(--color-border)]">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">Área</p>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">{areaName}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {projectCount} proyecto{projectCount === 1 ? '' : 's'}
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {completedCount}/{totalCount} completadas
        </span>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {projects.map(project => (
          <section key={project.id} className="px-6 py-6 space-y-3">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Proyecto</p>
              <button
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="min-h-[44px] text-base font-semibold text-[var(--on-surface)] hover:underline text-left"
              >
                {project.name}
              </button>
            </div>
            {renderTaskList(openTasksByProject.get(project.id) || [])}
          </section>
        ))}
        {openLoose.length > 0 && (
          <section className="px-6 py-6">
            {renderTaskList(openLoose)}
          </section>
        )}
        {showCompletedTasks && completedTasks.length > 0 && (
          <section className="px-6 py-6 space-y-3">
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Completadas</p>
            {renderTaskList(completedTasks)}
          </section>
        )}
        {!hasAnyList && (
          <section className="px-6 py-6">
            {renderTaskList([])}
          </section>
        )}
      </div>
    </div>
  )
}
