import type { FormEvent, ReactNode } from 'react'
import type { Area, Label, Project, ProjectHeading, Task } from '../../lib/supabase.js'
import TaskLabels from './TaskLabels.js'

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
  labels: Label[]
  editingState: EditingState
  editingHandlers: EditingHandlers
  onStartEdit: (task: Task) => void
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void
  onCancelEdit: () => void
  onToggleTask: (taskId: string) => void
  togglePending?: boolean
  onDeleteTask: (taskId: string) => void
  deletePending?: boolean
  selectedTaskForLabel: string | null
  onToggleLabelPicker: (taskId: string) => void
  onAddLabel: (taskId: string, labelId: string) => void
  onRemoveLabel: (taskId: string, labelId: string) => void
  onOpenEditDatePicker: () => void
  formatDateLabel: (value: string) => string
  renderDraftCard?: () => ReactNode
  showDraftCard?: boolean
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
  labels,
  editingState,
  editingHandlers,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleTask,
  togglePending,
  onDeleteTask,
  deletePending,
  selectedTaskForLabel,
  onToggleLabelPicker,
  onAddLabel,
  onRemoveLabel,
  onOpenEditDatePicker,
  formatDateLabel,
  renderDraftCard,
  showDraftCard,
}: TaskListProps) {
  if (isLoading && showEmptyState && showLoadingState) {
    const loadingClass = variant === 'mobile' ? 'p-6 text-center text-slate-500' : 'p-10 text-center text-slate-500'
    return <div className={loadingClass}>Cargando tareas...</div>
  }

  if (tasks.length === 0) {
    if (!showEmptyState) {
      return null
    }
    const emptyClass = variant === 'mobile' ? 'p-6 text-center text-slate-500' : 'p-10 text-center text-slate-500'
    return (
      <div className={emptyClass}>
        {filteredViewActive
          ? 'No hay tareas que coincidan con tu vista actual.'
          : 'No hay tareas todavía. ¡Crea la primera!'}
      </div>
    )
  }

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
    setPriority: setEditingPriority,
    setAreaId: setEditingAreaId,
    setProjectId: setEditingProjectId,
    setHeadingId: setEditingHeadingId,
  } = editingHandlers

  return (
    <>
      {variant === 'mobile' && showDraftCard && renderDraftCard ? renderDraftCard() : null}
      <ul className={variant === 'mobile' ? 'flex flex-col gap-4' : 'divide-y divide-slate-100'}>
        {tasks.map(task => {
          const taskProject = projects.find(project => project.id === task.project_id)
          const taskArea = task.area_id ? areas.find(area => area.id === task.area_id) : null
          const taskHeading = task.heading_id ? headings.find(heading => heading.id === task.heading_id) : null
          const isEditing = editingId === task.id
          const baseLiClass =
            variant === 'mobile'
              ? 'p-4 rounded-3xl border border-slate-100 bg-white shadow-sm'
              : 'px-6 py-5'
          const titleClass = variant === 'mobile' ? 'text-lg font-semibold' : 'font-semibold text-base'
          const metaClass =
            variant === 'mobile'
              ? 'flex flex-wrap items-center gap-2 text-sm'
              : 'flex flex-wrap items-center gap-3'
          const checkboxClass =
            variant === 'mobile'
              ? `mt-1 h-7 w-7 rounded-2xl border-2 flex items-center justify-center transition ${
                  task.status === 'done'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 text-transparent'
                }`
              : `mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                  task.status === 'done'
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300 hover:border-emerald-500'
                }`

          return (
            <li key={task.id} className={baseLiClass}>
              {isEditing ? (
                <form onSubmit={onSaveEdit} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(event) => setEditingTitle(event.target.value)}
                    placeholder="Título"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                  />
                  <textarea
                    value={editingNotes}
                    onChange={(event) => setEditingNotes(event.target.value)}
                    placeholder="Notas..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none resize-none"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editingAreaId || ''}
                      onChange={(event) => {
                        const value = event.target.value || null
                        setEditingAreaId(value)
                        if (value && editingProjectId) {
                          const project = projects.find(project => project.id === editingProjectId)
                          if (project?.area_id !== value) {
                            setEditingProjectId(null)
                            setEditingHeadingId(null)
                          }
                        }
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    >
                      <option value="">Sin área</option>
                      {areas.map(area => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingProjectId || ''}
                      onChange={(event) => {
                        const value = event.target.value || null
                        setEditingProjectId(value)
                        if (value) {
                          const project = projects.find(project => project.id === value)
                          setEditingAreaId(project?.area_id || null)
                        }
                        setEditingHeadingId(null)
                      }}
                      className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    >
                      <option value="">Sin proyecto</option>
                      {(editingAreaId ? projects.filter(project => project.area_id === editingAreaId) : projects).map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {editingProjectId && (
                    <select
                      value={editingHeadingId || ''}
                      onChange={(event) => setEditingHeadingId(event.target.value || null)}
                      className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    >
                      <option value="">Sin sección</option>
                      {headings
                        .filter(heading => heading.project_id === editingProjectId)
                        .map(heading => (
                          <option key={heading.id} value={heading.id}>
                            {heading.name}
                          </option>
                        ))}
                    </select>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editingPriority}
                      onChange={(event) => setEditingPriority(Number(event.target.value) as Priority)}
                      className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    >
                      <option value="0">Sin prioridad</option>
                      <option value="1">🟢 Baja</option>
                      <option value="2">🟡 Media</option>
                      <option value="3">🔴 Alta</option>
                    </select>
                    <button
                      type="button"
                      onClick={onOpenEditDatePicker}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-600 hover:border-slate-400"
                    >
                      {formatDateLabel(editingDueAt)}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-slate-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex gap-4">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      disabled={togglePending}
                      className={`${checkboxClass} disabled:opacity-50`}
                      aria-label={task.status === 'done' ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {task.status === 'done' && (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col gap-2">
                        <div className={`flex justify-between ${variant === 'mobile' ? 'flex-col gap-2' : 'flex-row items-start'}`}>
                          <p className={`${titleClass} ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </p>
                          <div className={metaClass}>
                            {taskProject && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                {taskProject.name}
                              </span>
                            )}
                            {!taskProject && taskArea && (
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                Área: {taskArea.name}
                              </span>
                            )}
                            {taskHeading && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                                {taskHeading.name}
                              </span>
                            )}
                            {task.priority && task.priority > 0 && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                  task.priority === 1
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                    : task.priority === 2
                                      ? 'bg-amber-50 border-amber-100 text-amber-600'
                                      : 'bg-rose-50 border-rose-100 text-rose-600'
                                }`}
                              >
                                {task.priority === 1 ? 'Baja' : task.priority === 2 ? 'Media' : 'Alta'}
                              </span>
                            )}
                            {task.due_at && (
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                📅 {new Date(task.due_at).toLocaleDateString('es-ES')}
                              </span>
                            )}
                          </div>
                        </div>
                        {task.notes && <p className="text-sm text-slate-500">{task.notes}</p>}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {task.labels.map(label => (
                              <span key={label.id} className="az-pill">
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-xs text-slate-400">
                          Creada el{' '}
                          {new Date(task.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleLabelPicker(task.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                            selectedTaskForLabel === task.id
                              ? 'border-slate-900 text-slate-900'
                              : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          Etiquetas
                        </button>
                        <button
                          type="button"
                          onClick={() => onStartEdit(task)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-500 hover:border-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          disabled={deletePending}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-rose-200 text-rose-600 hover:border-rose-400 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                  {labels.length > 0 && (
                    <TaskLabels
                      taskId={task.id}
                      labels={labels}
                      assignedLabels={task.labels || []}
                      onAddLabel={onAddLabel}
                      onRemoveLabel={onRemoveLabel}
                      isOpen={selectedTaskForLabel === task.id}
                      compact={variant === 'mobile'}
                    />
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
