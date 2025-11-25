import { useEffect, useRef } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type { Area, Project, ProjectHeading, Task } from '../../lib/supabase.js'
import { deserializeChecklistNotes } from '../../lib/checklistNotes.js'
import CalendarIcon from '../icons/CalendarIcon.js'

type Priority = 0 | 1 | 2 | 3

interface EditingState {
  id: string | null
  title: string
  notes: string
  priority: Priority
  dueAt: string
  projectId: string | null
  areaId: string | null
  headingId: string | null
}

interface EditingHandlers {
  setTitle: (value: string) => void
  setNotes: (value: string) => void
  setPriority: (value: Priority) => void
  setAreaId: (value: string | null) => void
  setProjectId: (value: string | null) => void
  setHeadingId: (value: string | null) => void
}

interface TaskListProps {
  variant: 'desktop' | 'mobile'
  tasks: Task[]
  isLoading: boolean
  showEmptyState?: boolean
  showLoadingState?: boolean
  filteredViewActive: boolean
  projects: Project[]
  areas: Area[]
  headings: ProjectHeading[]
  editingState: EditingState
  editingHandlers: EditingHandlers
  onStartEdit: (task: Task) => void
  onSaveEdit: (event?: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onToggleTask: (taskId: string) => void
  togglePending?: boolean
  onDeleteTask: (taskId: string) => void
  deletePending?: boolean
  onOpenEditDatePicker: () => void
  onOpenLabelSheet: (task: Task) => void
  onOpenChecklist: (task: Task) => void
  onOpenPriorityMenu: () => void
  onOpenMoveSheet: (task: Task) => void
  onOpenOverflowMenu: (task: Task) => void
  onToggleCollapsedChecklist: (taskId: string, itemId: string, completed: boolean) => void
  formatDateLabel: (value: string) => string
  renderDraftCard?: () => ReactNode
  showDraftCard?: boolean
  autoSaveOnMobileBlur?: boolean
}

const priorityLabels: Record<Priority, string> = {
  0: 'Sin prioridad',
  1: 'Prioridad baja',
  2: 'Prioridad media',
  3: 'Prioridad alta',
}

export default function TaskList({
  variant,
  tasks,
  isLoading,
  showEmptyState = true,
  showLoadingState = true,
  filteredViewActive,
  projects,
  areas,
  headings,
  editingState,
  editingHandlers,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleTask,
  togglePending,
  onDeleteTask,
  deletePending,
  onOpenEditDatePicker,
  onOpenLabelSheet,
  onOpenChecklist,
  onOpenPriorityMenu,
  onOpenMoveSheet,
  onOpenOverflowMenu,
  onToggleCollapsedChecklist,
  formatDateLabel,
  renderDraftCard,
  showDraftCard,
  autoSaveOnMobileBlur = false,
}: TaskListProps) {
  if (isLoading && showEmptyState && showLoadingState) {
    const loadingClass = variant === 'mobile' ? 'p-6 text-center text-[#736B63]' : 'p-10 text-center text-[#736B63]'
    return <div className={loadingClass}>Cargando tareas...</div>
  }

  if (tasks.length === 0) {
    if (!showEmptyState) {
      return null
    }
    const emptyClass = variant === 'mobile' ? 'p-6 text-center text-[#736B63]' : 'p-10 text-center text-[#736B63]'
    return (
      <div className={emptyClass}>
        {filteredViewActive ? 'No hay tareas que coincidan con tu vista actual.' : 'No hay tareas todavía. ¡Crea la primera!'}
      </div>
    )
  }

  const editingContainerRef = useRef<HTMLDivElement | null>(null)
  const {
    id: editingId,
    title: editingTitle,
    notes: editingNotes,
    priority: editingPriority,
    dueAt: editingDueAt,
    projectId: editingProjectId,
    areaId: editingAreaId,
    headingId: editingHeadingId,
  } = editingState
  const {
    setTitle: setEditingTitle,
    setNotes: setEditingNotes,
    setPriority: _setEditingPriority,
    setAreaId: _setEditingAreaId,
    setProjectId: _setEditingProjectId,
    setHeadingId: _setEditingHeadingId,
  } = editingHandlers

  useEffect(() => {
    if (variant !== 'mobile' || !editingId || !autoSaveOnMobileBlur) {
      editingContainerRef.current = null
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!editingContainerRef.current) {
        return
      }
      if (editingContainerRef.current.contains(event.target as Node)) {
        return
      }
      onSaveEdit()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [variant, editingId, autoSaveOnMobileBlur, onSaveEdit])

  const checkboxIcon = (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )

  return (
    <>
      {variant === 'mobile' && showDraftCard && renderDraftCard ? renderDraftCard() : null}
      <ul className={variant === 'mobile' ? 'flex flex-col gap-4' : 'flex flex-col gap-3'}>
        {tasks.map(task => {
          const legacyContent = deserializeChecklistNotes(task.notes)
          const plainNotes = legacyContent.text
          const checklistItems =
            task.checklist_items && task.checklist_items.length > 0
              ? task.checklist_items
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map(item => ({
                    id: item.id,
                    text: item.text,
                    completed: item.completed,
                    persisted: true,
                  }))
              : legacyContent.items.map((item, index) => ({
                  id: item.id || `${task.id}-legacy-${index}`,
                  text: item.text,
                  completed: item.completed,
                  persisted: false,
                }))
          const taskProject = task.project_id ? projects.find(project => project.id === task.project_id) || null : null
          const taskArea = task.area_id ? areas.find(area => area.id === task.area_id) || null : null
          const taskHeading = task.heading_id ? headings.find(heading => heading.id === task.heading_id) || null : null
          const editingArea = editingAreaId ? areas.find(area => area.id === editingAreaId) || null : null
          const editingProject = editingProjectId ? projects.find(project => project.id === editingProjectId) || null : null
          const editingHeading = editingHeadingId ? headings.find(heading => heading.id === editingHeadingId) || null : null
          const isEditing = editingId === task.id
          const baseLiClass =
            variant === 'mobile'
              ? 'p-4 rounded-3xl border border-[var(--color-border)] bg-white shadow-sm transition-colors'
              : 'group px-6 py-5 rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:border-[var(--color-primary-600)] hover:shadow-[0_10px_28px_rgba(45,37,32,0.08)] transition-all'
          const titleClass = variant === 'mobile' ? 'text-lg font-semibold' : 'font-semibold text-base'
          const metaClass =
            variant === 'mobile'
              ? 'flex flex-wrap items-center gap-2 text-sm text-[#736B63]'
              : 'flex flex-wrap items-center gap-3 text-xs text-[#736B63]'
          const checkboxClass =
            variant === 'mobile'
              ? `mt-1 h-7 w-7 rounded-2xl border-2 flex items-center justify-center transition ${
                  task.status === 'done'
                    ? 'bg-[var(--color-accent-500)] border-[var(--color-accent-500)] text-white'
                    : 'border-[var(--color-border)] text-transparent'
                }`
              : `mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                  task.status === 'done'
                    ? 'bg-[var(--color-accent-500)] border-[var(--color-accent-500)] text-white'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary-600)] text-transparent'
                }`
          const compactActivationProps =
            !isEditing && variant === 'mobile'
              ? {
                  onClick: () => onStartEdit(task),
                }
              : !isEditing && variant === 'desktop'
                ? {
                    onDoubleClick: () => onStartEdit(task),
                  }
                : {}

          return (
            <li key={task.id} className={baseLiClass} {...compactActivationProps}>
              {isEditing ? (
                <div ref={(node) => (isEditing ? (editingContainerRef.current = node) : undefined)}>
                  <form
                    onSubmit={(event) => onSaveEdit(event)}
                    className="space-y-3 p-4 bg-[var(--color-primary-100)] rounded-2xl border border-[var(--color-border)]"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      placeholder="Título"
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-[#2D2520] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
                    />
                    <textarea
                      value={editingNotes}
                      onChange={(event) => setEditingNotes(event.target.value)}
                      placeholder="Notas..."
                      rows={variant === 'mobile' ? 3 : 2}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-[#736B63] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none resize-none"
                    />
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-[#736B63]">
                      <button
                        type="button"
                        onClick={onOpenEditDatePicker}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDateLabel(editingDueAt)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenLabelSheet(task)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span>🏷</span>
                        <span>Etiquetas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenChecklist(task)}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span>☑</span>
                        <span>Checklist</span>
                      </button>
                      <button
                        type="button"
                        onClick={onOpenPriorityMenu}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span>⚑</span>
                        <span>{priorityLabels[editingPriority]}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[#736B63]">
                      {editingArea && (
                        <span className="px-3 py-1 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] border border-[var(--color-border)]">
                          Área: {editingArea.name}
                        </span>
                      )}
                      {editingProject && (
                        <span className="px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-accent-300)_60%,var(--color-bg)_40%)] text-[#2D2520] border border-[var(--color-border)]">
                          Proyecto: {editingProject.name}
                        </span>
                      )}
                      {editingHeading && (
                        <span className="px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--color-primary-300)_40%,white_60%)] text-[var(--color-primary-700)] border border-[var(--color-border)]">
                          Sección: {editingHeading.name}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[var(--color-primary-600)] text-white text-sm font-semibold hover:bg-[var(--color-primary-700)] transition disabled:opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={onCancelEdit}
                        className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[#736B63] hover:border-[var(--color-primary-600)]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                  <div
                    className={`mt-4 ${
                      variant === 'mobile'
                        ? 'flex items-center justify-between gap-3'
                        : 'flex items-center justify-end gap-3'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenMoveSheet(task)}
                      className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[#2D2520] hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                    >
                      <span className="text-lg">→</span>
                      <span>Mover</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      disabled={deletePending}
                      className="flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:border-rose-400 disabled:opacity-50"
                    >
                      <span>🗑</span>
                      <span>Papelera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenOverflowMenu(task)}
                      className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[#736B63] hover:border-[var(--color-primary-600)]"
                    >
                      <span>…</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      onToggleTask(task.id)
                    }}
                    disabled={togglePending}
                    className={`${checkboxClass} disabled:opacity-50`}
                    aria-label={task.status === 'done' ? 'Marcar como pendiente' : 'Marcar como completada'}
                  >
                    {task.status === 'done' ? checkboxIcon : null}
                  </button>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div
                      className={`flex justify-between ${variant === 'mobile' ? 'flex-col gap-2' : 'flex-row items-start'}`}
                    >
                      <p className={`${titleClass} ${task.status === 'done' ? 'text-[#C4BDB5] line-through' : 'text-[#2D2520]'}`}>
                        {task.title}
                      </p>
                      {task.pinned ? <span className="text-lg" aria-label="Tarea fijada">📌</span> : null}
                    </div>
                    {plainNotes && <p className="text-sm text-[#736B63]">{plainNotes}</p>}
                    <div className={metaClass}>
                      {taskProject && (
                        <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                          {taskProject.name}
                        </span>
                      )}
                      {!taskProject && taskArea && (
                        <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-accent-300)_70%,var(--color-bg)_30%)] text-[#2D2520]">
                          {taskArea.name}
                        </span>
                      )}
                      {taskHeading && (
                        <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-primary-300)_50%,white_50%)] text-[var(--color-primary-700)]">
                          {taskHeading.name}
                        </span>
                      )}
                      {task.due_at && (
                        <span className="text-xs px-2 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-primary-300)] text-[var(--color-primary-700)] inline-flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {new Date(task.due_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {task.labels.map(label => (
                          <span key={label.id} className="az-pill">
                            {label.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isEditing && checklistItems.length > 0 && (
                      <ul className="space-y-1">
                        {checklistItems.map(item => (
                          <li key={item.id} className="flex items-center gap-2 text-sm text-[#736B63]">
                            {item.persisted ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onToggleCollapsedChecklist(task.id, item.id, item.completed)
                                }}
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                  item.completed
                                    ? 'bg-[var(--color-accent-500)] border-[var(--color-accent-500)] text-white'
                                    : 'border-[var(--color-border)] text-transparent'
                                }`}
                                aria-label={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                ✓
                              </button>
                            ) : (
                              <span
                                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                  item.completed
                                    ? 'bg-[var(--color-accent-500)] border-[var(--color-accent-500)] text-white'
                                    : 'border-[var(--color-border)] text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                            )}
                            <span className={item.completed ? 'line-through text-[#C4BDB5]' : ''}>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="text-xs text-[#C4BDB5]">
                      Creada el{' '}
                      {new Date(task.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
