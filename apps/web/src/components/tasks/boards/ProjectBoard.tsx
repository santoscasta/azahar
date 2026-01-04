import type { Task, Project, ProjectHeading } from '../../../lib/supabase.js'
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { useTranslations } from '../../../App.js'
import { buildHeadingDropId, buildProjectHeadingListId } from '../../../lib/dndIds.js'

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
  areaName?: string | null
  renderTaskList: (tasks: Task[], options?: { showEmptyState?: boolean; dndDroppableId?: string }) => React.ReactNode
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
  areaName,
  renderTaskList,
  renderHeadingForm,
}: ProjectBoardProps) {
  const { t } = useTranslations()
  const projectLabel = t('context.label.project')
  const sectionLabel = t('context.label.section')
  const completedLabel = t('mobile.completed')
  const taskSingular = t('task.singular')
  const taskPlural = t('task.plural')
  const headingDroppableId = buildHeadingDropId(project.id)
  const canDragHeadings = !!onReorderHeadings

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
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{projectLabel}</p>
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
              {completedCount}/{totalCount} {completedLabel}
            </span>
          </div>
        </div>
        <div className="space-y-6 p-6">
          {renderHeadingForm ? renderHeadingForm() : null}
          <Droppable droppableId={headingDroppableId} type="HEADING" isDropDisabled={!canDragHeadings}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {headings.map((heading, index) => (
                  <Draggable
                    key={heading.id}
                    draggableId={heading.id}
                    index={index}
                    isDragDisabled={!canDragHeadings || headingEditingId === heading.id}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`flex items-center justify-between rounded-[var(--radius-container)] border border-[var(--color-border)] px-3 py-2 ${
                          dragSnapshot.isDragging ? 'opacity-60' : ''
                        }`}
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
                              {t('actions.save')}
                            </button>
                            <button type="button" onClick={onCancelHeadingEdit} className="az-btn-secondary min-h-[44px] px-4 py-2 text-xs">
                              {t('actions.cancel')}
                            </button>
                          </form>
                        ) : (
                          <>
                            <div>
                              <p className="text-sm font-medium text-[var(--on-surface)]">{heading.name}</p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {(openTasksByHeading.get(heading.id)?.length || 0)}{' '}
                                {(openTasksByHeading.get(heading.id)?.length || 0) === 1 ? taskSingular : taskPlural}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onStartEditHeading(heading.id, heading.name)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-card)] text-xs text-[var(--color-text-muted)] hover:text-[var(--on-surface)]"
                                title={t('actions.rename')}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteHeading(heading.id)}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-card)] text-xs text-[var(--color-danger-500)] hover:opacity-80"
                                title={t('multiSelect.actions.delete')}
                              >
                                🗑️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {headings.map(heading => (
            <section
              key={heading.id}
              className="space-y-3 rounded-[var(--radius-container)]"
            >
              <div className="flex items-center justify_between">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">{sectionLabel}</p>
                  <p className="text-base font-semibold text-[var(--on-surface)]">{heading.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {(openTasksByHeading.get(heading.id)?.length || 0)}{' '}
                    {(openTasksByHeading.get(heading.id)?.length || 0) === 1 ? taskSingular : taskPlural}
                  </p>
                </div>
              </div>
              {renderTaskList(openTasksByHeading.get(heading.id) || [], {
                showEmptyState: false,
                dndDroppableId: buildProjectHeadingListId(project.id, heading.id),
              })}
            </section>
          ))}
          {unassignedOpen.length > 0 && (
            <section
              className="space-y-3 rounded-[var(--radius-container)]"
            >
              {renderTaskList(unassignedOpen, {
                showEmptyState: false,
                dndDroppableId: buildProjectHeadingListId(project.id, null),
              })}
            </section>
          )}
          {showCompletedTasks && completedTasks.length > 0 && (
            <section className="space-y-3">
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{completedLabel}</p>
              {renderTaskList(completedTasks, { showEmptyState: false })}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
