import type { Task, Project } from '../../../lib/supabase.js'
import { useTranslations } from '../../../App.js'
import { buildAreaProjectListId } from '../../../lib/dndIds.js'

interface AreaBoardProps {
  areaId: string
  areaName: string
  projectCount: number
  completedCount: number
  totalCount: number
  projects: Project[]
  tasksByProject: Map<string, Task[]>
  looseTasks: Task[]
  onSelectProject: (projectId: string) => void
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean; dndDroppableId?: string }) => React.ReactNode
  showCompletedTasks: boolean
}

export default function AreaBoard({
  areaId,
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
  const { t } = useTranslations()
  const areaLabel = t('context.label.area')
  const projectLabel = t('context.label.project')
  const projectsLabel = t('sidebar.projects').toLowerCase()
  const completedLabel = t('mobile.completed')
  const projectCountLabel = projectCount === 1 ? projectLabel.toLowerCase() : projectsLabel
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
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">{areaLabel}</p>
          <h2 className="text-lg font-semibold text-[var(--on-surface)]">{areaName}</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {projectCount} {projectCountLabel}
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {completedCount}/{totalCount} {completedLabel}
        </span>
      </div>
      <div className="divide-y divide-[var(--color-divider)]">
        {projects.map(project => (
          <section
            key={project.id}
            className="px-6 py-6 space-y-3 rounded-[var(--radius-container)]"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{projectLabel}</p>
              <button
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="min-h-[44px] text-base font-semibold text-[var(--on-surface)] hover:underline text-left"
              >
                {project.name}
              </button>
            </div>
            {renderTaskList(openTasksByProject.get(project.id) || [], {
              dndDroppableId: buildAreaProjectListId(areaId, project.id),
            })}
          </section>
        ))}
        {openLoose.length > 0 && (
          <section
            className="px-6 py-6 rounded-[var(--radius-container)]"
          >
            {renderTaskList(openLoose, {
              dndDroppableId: buildAreaProjectListId(areaId, null),
            })}
          </section>
        )}
        {showCompletedTasks && completedTasks.length > 0 && (
          <section className="px-6 py-6 space-y-3">
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">{completedLabel}</p>
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
