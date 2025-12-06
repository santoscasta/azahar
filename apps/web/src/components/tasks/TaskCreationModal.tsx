import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Area, Label, Project, ProjectHeading } from '../../lib/supabase.js'
import type { QuickViewId } from '../../pages/tasksSelectors.js'
import type { TaskCreationDraft } from '../../hooks/useTaskCreation.js'

interface CreationViewOption {
  id: QuickViewId
  label: string
  icon: string
}

interface TaskCreationModalProps {
  open: boolean
  isMobile: boolean
  draft: TaskCreationDraft
  projects: Project[]
  areas: Area[]
  headings: ProjectHeading[]
  labels: Label[]
  creationViewOptions: readonly CreationViewOption[]
  dueDateLabel: string
  savingTask: boolean
  savingLabel: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdateDraft: <K extends keyof TaskCreationDraft>(key: K, value: TaskCreationDraft[K]) => void
  onApplyViewPreset: (view: QuickViewId) => void
  onRequestDueDate: () => void
  onToggleLabel: (labelId: string) => void
  inlineLabelName: string
  onInlineLabelNameChange: (value: string) => void
  onCreateInlineLabel: (event: FormEvent<HTMLFormElement>) => void
}

export default function TaskCreationModal({
  open,
  isMobile,
  draft,
  projects,
  areas,
  headings,
  labels,
  creationViewOptions,
  dueDateLabel,
  savingTask,
  savingLabel,
  onClose,
  onSubmit,
  onUpdateDraft,
  onApplyViewPreset,
  onRequestDueDate,
  onToggleLabel,
  inlineLabelName,
  onInlineLabelNameChange,
  onCreateInlineLabel,
}: TaskCreationModalProps) {
  const [showContext, setShowContext] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  if (!open) {
    return null
  }

  const wrapperClasses = isMobile
    ? 'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm overflow-y-auto'
    : 'fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'
  const cardClasses = isMobile
    ? 'az-card w-full min-h-full rounded-none border-0 shadow-none'
    : 'az-card max-w-xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto'

  const filteredProjects = draft.areaId ? projects.filter(project => project.area_id === draft.areaId) : projects
  const availableHeadings = draft.projectId ? headings.filter(heading => heading.project_id === draft.projectId) : []

  const hasContext = Boolean(draft.areaId || draft.projectId || draft.headingId)
  const hasDetails = Boolean(draft.notes || draft.labelIds.length > 0 || inlineLabelName)

  const contextBadges = useMemo(() => {
    const badges: string[] = []
    if (draft.areaId) {
      const area = areas.find(currentArea => currentArea.id === draft.areaId)
      if (area?.name) badges.push(area.name)
    }
    if (draft.projectId) {
      const project = projects.find(currentProject => currentProject.id === draft.projectId)
      if (project?.name) badges.push(project.name)
    }
    if (draft.headingId) {
      const heading = availableHeadings.find(currentHeading => currentHeading.id === draft.headingId)
      if (heading?.name) badges.push(heading.name)
    }
    return badges
  }, [areas, availableHeadings, draft.areaId, draft.headingId, draft.projectId, projects])

  return (
    <div className={wrapperClasses}>
      <div className={cardClasses}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-primary-500)' }}>
              Captura rápida
            </p>
            <p className="text-lg font-semibold" style={{ color: 'var(--color-primary-700)' }}>
              Anota y sigue
            </p>
            <p className="text-sm text-[#736B63]">Empieza con la acción; el contexto es opcional y siempre a mano.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#C4BDB5] hover:text-[#736B63] text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-primary-50)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-primary-600)' }}>
                  Vista destino
                </p>
                <p className="text-sm text-[#736B63]">Elige dónde quieres ver esta tarea apenas la crees.</p>
              </div>
              <span className="text-xs font-medium text-[var(--color-primary-600)] bg-white px-3 py-1 rounded-full border border-[var(--color-border)]">
                Cambio en un toque
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {creationViewOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={draft.view === option.id}
                  onClick={() => onApplyViewPreset(option.id)}
                  className="px-3 py-2 rounded-2xl border flex items-center gap-2 text-sm font-medium transition"
                  style={
                    draft.view === option.id
                      ? {
                          background: 'var(--color-primary-600)',
                          color: 'var(--on-primary)',
                          borderColor: 'var(--color-primary-600)',
                        }
                      : {
                          color: 'var(--color-primary-600)',
                          borderColor: 'var(--color-border)',
                          background: '#fff',
                        }
                  }
                >
                  <span className="h-8 w-8 rounded-2xl bg-[color-mix(in_srgb,var(--color-primary-100)_60%,var(--color-bg)_40%)] flex items-center justify-center">
                    <img src={option.icon} alt="" className="h-5 w-5" />
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
              ¿Qué quieres hacer?
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(event) => onUpdateDraft('title', event.target.value)}
              placeholder="Escribe la tarea en lenguaje natural: 'Enviar propuesta mañana', 'Llamar a Ana'..."
              className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] text-base text-[#2D2520] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-white"
              autoFocus
            />
            <div className="flex flex-wrap gap-3 items-center pt-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-[var(--color-border)] bg-white text-sm text-[#2D2520] shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
                <span className="text-xs uppercase tracking-wide text-[#736B63]">Prioridad</span>
                <select
                  value={draft.priority}
                  onChange={(event) => onUpdateDraft('priority', Number(event.target.value) as 0 | 1 | 2 | 3)}
                  className="bg-transparent outline-none text-sm text-[#2D2520]"
                >
                  <option value="0">Sin prioridad</option>
                  <option value="1">🟢 Baja</option>
                  <option value="2">🟡 Media</option>
                  <option value="3">🔴 Alta</option>
                </select>
              </div>
              <button
                type="button"
                onClick={onRequestDueDate}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border)] bg-white text-sm font-medium text-[#2D2520] shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:border-[var(--color-primary-400)]"
              >
                <span className="text-lg">🗓️</span>
                {dueDateLabel}
              </button>
              <span className="text-xs text-[#736B63]">Añade solo lo esencial para arrancar.</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 space-y-3 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                  Contexto opcional
                </p>
                <p className="text-xs text-[#736B63]">Añade área, proyecto o sección solo si ayuda a ubicarla.</p>
              </div>
              <div className="flex items-center gap-2">
                {hasContext && (
                  <div className="flex flex-wrap gap-1 text-xs text-[var(--color-primary-700)]">
                    {contextBadges.map(badge => (
                      <span
                        key={badge}
                        className="px-2 py-1 rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,#fff_85%,var(--color-primary-50)_15%)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowContext(previous => !previous)}
                  className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-primary-700)] bg-[color-mix(in_srgb,#fff_85%,var(--color-primary-50)_15%)] hover:border-[var(--color-primary-400)]"
                >
                  {showContext ? 'Ocultar' : 'Añadir contexto'}
                </button>
              </div>
            </div>
            {showContext && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[#736B63]">Área</p>
                  <select
                    value={draft.areaId || ''}
                    onChange={(event) => {
                      const value = event.target.value || null
                      onUpdateDraft('areaId', value)
                      if (value && draft.projectId) {
                        const project = projects.find(project => project.id === draft.projectId)
                        if (project?.area_id !== value) {
                          onUpdateDraft('projectId', null)
                          onUpdateDraft('headingId', null)
                        }
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-[#2D2520] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[color-mix(in_srgb,#fff_80%,var(--color-primary-50)_20%)]"
                  >
                    <option value="">Sin área</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-[#736B63]">Proyecto</p>
                  <select
                    value={draft.projectId || ''}
                    onChange={(event) => {
                      const value = event.target.value || null
                      onUpdateDraft('projectId', value)
                      if (value) {
                        const project = projects.find(project => project.id === value)
                        onUpdateDraft('areaId', project?.area_id || null)
                      }
                      onUpdateDraft('headingId', null)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-[#2D2520] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[color-mix(in_srgb,#fff_80%,var(--color-primary-50)_20%)]"
                  >
                    <option value="">Sin proyecto</option>
                    {filteredProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {showContext && draft.projectId && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-[#736B63]">Sección</p>
                <select
                  value={draft.headingId || ''}
                  onChange={(event) => onUpdateDraft('headingId', event.target.value || null)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] text-[#2D2520] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[color-mix(in_srgb,#fff_80%,var(--color-primary-50)_20%)]"
                >
                  <option value="">Sin sección</option>
                  {availableHeadings.map(heading => (
                    <option key={heading.id} value={heading.id}>
                      {heading.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 space-y-4 shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                  Detalles al vuelo
                </p>
                <p className="text-xs text-[#736B63]">Notas y etiquetas solo cuando aportan claridad.</p>
              </div>
              {hasDetails && (
                <span className="text-xs text-[var(--color-primary-700)] bg-[color-mix(in_srgb,#fff_85%,var(--color-accent-50)_15%)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                  {draft.labelIds.length > 0 ? `${draft.labelIds.length} etiqueta(s)` : 'Notas añadidas'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowDetails(previous => !previous)}
                className="px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-primary-700)] bg-[color-mix(in_srgb,#fff_85%,var(--color-primary-50)_15%)] hover:border-[var(--color-primary-400)]"
              >
                {showDetails ? 'Ocultar' : 'Añadir detalles'}
              </button>
            </div>
            {showDetails && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                      Notas rápidas
                    </label>
                    <span className="text-xs text-[#736B63]">Opcional</span>
                  </div>
                  <textarea
                    value={draft.notes}
                    onChange={(event) => onUpdateDraft('notes', event.target.value)}
                    placeholder="Pega ideas, enlaces o pasos sueltos."
                    rows={3}
                    className="w-full px-3 py-3 rounded-2xl border border-[var(--color-border)] text-[#736B63] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none resize-none bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                      Etiquetas rápidas
                    </label>
                    {labels.length > 0 && (
                      <span className="text-xs text-[#736B63]">Toca para añadirlas al vuelo</span>
                    )}
                  </div>
                  {labels.length === 0 ? (
                    <p className="text-sm text-[#736B63]">
                      Aún no tienes etiquetas. Crea la primera aquí abajo.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {labels.map(label => {
                        const isSelected = draft.labelIds.includes(label.id)
                        return (
                          <button
                            key={`new-task-label-${label.id}`}
                            type="button"
                            onClick={() => onToggleLabel(label.id)}
                            className={`az-pill transition ${isSelected ? 'bg-[var(--color-accent-500)] text-white' : ''}`}
                            style={
                              isSelected
                                ? {
                                    border: '1px solid var(--color-accent-500)',
                                    boxShadow: '0 5px 15px rgba(47, 125, 87, 0.25)',
                                  }
                                : undefined
                            }
                          >
                            {isSelected ? '✓ ' : ''}
                            #{label.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  <form onSubmit={onCreateInlineLabel} className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={inlineLabelName}
                      onChange={(event) => onInlineLabelNameChange(event.target.value)}
                      placeholder="Ej. Diseño, Personal..."
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[#2D2520] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-white"
                      disabled={savingLabel}
                    />
                    <button
                      type="submit"
                      disabled={savingLabel}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                      style={{ background: 'var(--color-accent-500)' }}
                    >
                      {savingLabel ? 'Añadiendo...' : 'Crear etiqueta'}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-[#736B63]">Pulsa "Crear" y ajusta luego en la lista si hace falta.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="az-btn-secondary px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={savingTask} className="az-btn-primary px-6 py-2 text-sm">
                {savingTask ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
