import type { Task, Project, ProjectHeading } from '../../../lib/supabase.js'
import { useRef, useState } from 'react'

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
  onReorderHeadings?: (payload: { projectId: string; orderedHeadingIds: string[]; movedHeadingId: string }) => void
  onMoveTaskToHeading?: (payload: { taskId: string; headingId: string | null }) => void
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
  onReorderHeadings,
  onMoveTaskToHeading,
  areaName,
  renderTaskList,
  renderHeadingForm,
}: ProjectBoardProps) {
  const draggingHeadingRef = useRef<string | null>(null)
  const [dragOverHeadingId, setDragOverHeadingId] = useState<string | null>(null)
  const orderedHeadingIds = headings.map(heading => heading.id)

  const resetDragState = () => {
    draggingHeadingRef.current = null
  }

  const buildReorderedIds = (ids: string[], sourceId: string, targetId: string, insertAfter: boolean) => {
    if (sourceId === targetId) {
      return ids
    }
    const trimmed = ids.filter(id => id !== sourceId)
    const targetIndex = trimmed.indexOf(targetId)
    if (targetIndex === -1) {
      return ids
    }
    const insertIndex = insertAfter ? targetIndex + 1 : targetIndex
    return [...trimmed.slice(0, insertIndex), sourceId, ...trimmed.slice(insertIndex)]
  }

  const isSameOrder = (nextOrder: string[], currentOrder: string[]) =>
    nextOrder.length === currentOrder.length && nextOrder.every((id, index) => id === currentOrder[index])

  const handleHeadingDragStart = (event: React.DragEvent<HTMLDivElement>, headingId: string) => {
    draggingHeadingRef.current = headingId
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', headingId)
  }

  const handleHeadingDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const handleHeadingDrop = (event: React.DragEvent<HTMLDivElement>, targetHeadingId: string) => {
    event.preventDefault()
    if (!onReorderHeadings) {
      resetDragState()
      return
    }
    const sourceId = draggingHeadingRef.current
    if (!sourceId) {
      resetDragState()
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY > rect.top + rect.height / 2
    const reordered = buildReorderedIds(orderedHeadingIds, sourceId, targetHeadingId, insertAfter)
    if (!isSameOrder(reordered, orderedHeadingIds)) {
      onReorderHeadings({
        projectId: project.id,
        orderedHeadingIds: reordered,
        movedHeadingId: sourceId,
      })
    }
    resetDragState()
  }

  const handleTaskDragOver = (event: React.DragEvent<HTMLElement>, headingId: string | null) => {
    if (!onMoveTaskToHeading) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverHeadingId(headingId ?? 'unassigned')
  }

  const handleTaskDragLeave = (headingId: string | null) => {
    if (!onMoveTaskToHeading) {
      return
    }
    if (dragOverHeadingId === (headingId ?? 'unassigned')) {
      setDragOverHeadingId(null)
    }
  }

  const handleTaskDrop = (event: React.DragEvent<HTMLElement>, headingId: string | null) => {
    if (!onMoveTaskToHeading) {
      return
    }
    event.preventDefault()
    const taskId = event.dataTransfer.getData('text/plain')
    setDragOverHeadingId(null)
    if (!taskId) {
      return
    }
    onMoveTaskToHeading({ taskId, headingId })
  }

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
        <div className="px-6 py-6 border-b border-[var(--color-border)]">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Proyecto</p>
              <h2 className="text-lg font-semibold text-[var(--on-surface)]">{project.name}</h2>
              {project.area_id && areaName && (
                <button
                  type="button"
                  onClick={() => onSelectArea(project.area_id!)}
                  className="min-h-[44px] inline-flex items-center text-xs font-semibold text-[var(--color-text-muted)] underline-offset-2 hover:underline"
                >
                  {areaName}
                </button>
              )}
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">
              {completedCount}/{totalCount} completadas
            </span>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {renderHeadingForm ? renderHeadingForm() : null}
          <div className="space-y-3">
            {headings.map(heading => (
              <div
                key={heading.id}
                draggable={headingEditingId !== heading.id}
                onDragStart={(event) => handleHeadingDragStart(event, heading.id)}
                onDragOver={handleHeadingDragOver}
                onDrop={(event) => handleHeadingDrop(event, heading.id)}
                onDragEnd={resetDragState}
                className="flex items-center justify-between rounded-[var(--radius-container)] border border-[var(--color-border)] px-3 py-2"
              >
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
                      className="flex-1 px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
                    />
                    <button type="submit" className="az-btn-primary min-h-[44px] px-4 py-2 text-xs">
                      Guardar
                    </button>
                    <button type="button" onClick={onCancelHeadingEdit} className="az-btn-secondary min-h-[44px] px-4 py-2 text-xs">
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-[var(--on-surface)]">{heading.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {(openTasksByHeading.get(heading.id)?.length || 0)} tarea
                        {openTasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onStartEditHeading(heading.id, heading.name)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-card)] text-xs text-[var(--color-text-muted)] hover:text-[var(--on-surface)]"
                        title="Renombrar"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHeading(heading.id)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-card)] text-xs text-[var(--color-danger-500)] hover:opacity-80"
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
            <section
              key={heading.id}
              onDragOver={(event) => handleTaskDragOver(event, heading.id)}
              onDragLeave={() => handleTaskDragLeave(heading.id)}
              onDrop={(event) => handleTaskDrop(event, heading.id)}
              className={`space-y-3 rounded-[var(--radius-container)] ${
                dragOverHeadingId === heading.id ? 'ring-1 ring-[var(--color-primary-200)]' : ''
              }`}
            >
              <div className="flex items-center justify_between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">Sección</p>
                  <p className="text-base font-semibold text-[var(--on-surface)]">{heading.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {(openTasksByHeading.get(heading.id)?.length || 0)} tarea
                    {openTasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              {renderTaskList(openTasksByHeading.get(heading.id) || [], { showEmptyState: false })}
            </section>
          ))}
          {unassignedOpen.length > 0 && (
            <section
              onDragOver={(event) => handleTaskDragOver(event, null)}
              onDragLeave={() => handleTaskDragLeave(null)}
              onDrop={(event) => handleTaskDrop(event, null)}
              className={`space-y-3 rounded-[var(--radius-container)] ${
                dragOverHeadingId === 'unassigned' ? 'ring-1 ring-[var(--color-primary-200)]' : ''
              }`}
            >
              {renderTaskList(unassignedOpen, { showEmptyState: false })}
            </section>
          )}
          {showCompletedTasks && completedTasks.length > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">Completadas</p>
              {renderTaskList(completedTasks, { showEmptyState: false })}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
