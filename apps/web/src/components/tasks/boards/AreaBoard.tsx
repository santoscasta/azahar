import type { Task, Project } from '../../../lib/supabase.js'
import { useState } from 'react'

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
  renderTaskList: (tasks: Task[]) => React.ReactNode
  showCompletedTasks: boolean
  onMoveTaskToProject?: (payload: { taskId: string; projectId: string | null; areaId: string | null }) => void
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
  onMoveTaskToProject,
}: AreaBoardProps) {
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null)
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

  const handleTaskDragOver = (event: React.DragEvent<HTMLElement>, projectId: string | null) => {
    if (!onMoveTaskToProject) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverProjectId(projectId ?? 'loose')
  }

  const handleTaskDragLeave = (projectId: string | null) => {
    if (!onMoveTaskToProject) {
      return
    }
    if (dragOverProjectId === (projectId ?? 'loose')) {
      setDragOverProjectId(null)
    }
  }

  const handleTaskDrop = (event: React.DragEvent<HTMLElement>, projectId: string | null) => {
    if (!onMoveTaskToProject) {
      return
    }
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDragOverProjectId(null)
    if (!taskId) {
      return
    }
    onMoveTaskToProject({ taskId, projectId, areaId: projectId ? projects.find(project => project.id === projectId)?.area_id ?? null : areaId })
  }

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
      <div className="divide-y divide-[var(--color-divider)]">
        {projects.map(project => (
          <section
            key={project.id}
            onDragOver={(event) => handleTaskDragOver(event, project.id)}
            onDragLeave={() => handleTaskDragLeave(project.id)}
            onDrop={(event) => handleTaskDrop(event, project.id)}
            className={`px-6 py-6 space-y-3 rounded-[var(--radius-container)] ${
              dragOverProjectId === project.id ? 'ring-1 ring-[var(--color-primary-200)]' : ''
            }`}
          >
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
          <section
            onDragOver={(event) => handleTaskDragOver(event, null)}
            onDragLeave={() => handleTaskDragLeave(null)}
            onDrop={(event) => handleTaskDrop(event, null)}
            className={`px-6 py-6 rounded-[var(--radius-container)] ${
              dragOverProjectId === 'loose' ? 'ring-1 ring-[var(--color-primary-200)]' : ''
            }`}
          >
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
