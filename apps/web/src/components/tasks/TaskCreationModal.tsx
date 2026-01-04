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
  deadlineDateLabel: string
  savingTask: boolean
  savingLabel: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onUpdateDraft: <K extends keyof TaskCreationDraft>(key: K, value: TaskCreationDraft[K]) => void
  onApplyViewPreset: (view: QuickViewId) => void
  onRequestDueDate: (anchor?: HTMLElement | null) => void
  onRequestDeadline: (anchor?: HTMLElement | null) => void
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
  deadlineDateLabel,
  savingTask,
  savingLabel,
  onClose,
  onSubmit,
  onUpdateDraft,
  onApplyViewPreset,
  onRequestDueDate,
  onRequestDeadline,
  onToggleLabel,
  inlineLabelName,
  onInlineLabelNameChange,
  onCreateInlineLabel,
}: TaskCreationModalProps) {
  const [showContext, setShowContext] = useState(false)
  const [showDetails, setShowDetails] = useState(isMobile)

  const wrapperClasses = isMobile
    ? 'fixed inset-0 z-40 bg-[var(--color-overlay)] backdrop-blur-sm overflow-y-auto'
    : 'fixed inset-0 z-40 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4'
  const cardClasses = isMobile
    ? 'az-card w-full min-h-full rounded-none border-0 shadow-none'
    : 'az-card max-w-xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl'

  const orderedProjects = useMemo(() => {
    const withArea: Project[] = []
    const withoutArea: Project[] = []
    projects.forEach(project => {
      if (project.area_id) {
        withArea.push(project)
      } else {
        withoutArea.push(project)
      }
    })
    const byName = (a: Project, b: Project) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    withArea.sort(byName)
    withoutArea.sort(byName)
    return {
      withoutArea,
      withArea,
    }
  }, [projects])
  const filteredProjects = draft.areaId
    ? orderedProjects.withArea.filter(project => project.area_id === draft.areaId)
    : [...orderedProjects.withoutArea, ...orderedProjects.withArea]
  const availableHeadings = draft.projectId ? headings.filter(heading => heading.project_id === draft.projectId) : []

  const hasContext = Boolean(draft.areaId || draft.projectId || draft.headingId)
  const hasDetails = Boolean(draft.notes || draft.labelIds.length > 0 || inlineLabelName)
  const isTitleEmpty = draft.title.trim().length === 0

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

  if (!open) {
    return null
  }

  return (
    <div className={wrapperClasses}>
      <div className={cardClasses}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="az-meta text-[var(--color-text-muted)]">Captura rápida</p>
            <p className="az-h2 text-[var(--on-surface)]">Nueva tarea</p>
            <p className="az-body text-[var(--color-text-muted)]">Igual que en móvil: escribe, agenda y listo.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)] text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">Vista destino</p>
                <p className="text-sm text-[var(--on-surface)]">Elige la lista donde aterriza, como en el panel móvil.</p>
              </div>
              <span className="text-xs font-medium text-[var(--color-action-500)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)]">
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
                    className="min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] border flex items-center gap-2 text-sm font-medium transition"
                    style={
                      draft.view === option.id
                        ? {
                          background: 'var(--color-action-500)',
                          color: 'var(--on-primary)',
                          borderColor: 'var(--color-action-500)',
                        }
                        : {
                          color: 'var(--on-surface)',
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-surface-elevated)',
                        }
                    }
                >
                  <span className="h-8 w-8 rounded-[var(--radius-card)] bg-[var(--color-surface-elevated)] flex items-center justify-center">
                    <img src={option.icon} alt="" className="h-5 w-5" />
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--on-surface)]">
                ¿Qué quieres hacer?
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(event) => onUpdateDraft('title', event.target.value)}
                placeholder="Nueva tarea (igual que en móvil)"
                className="w-full px-4 py-3 rounded-[var(--radius-container)] border border-[var(--color-border)] text-base text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface-elevated)]"
                autoFocus
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={(event) => onRequestDueDate(event.currentTarget)}
                className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-sm font-medium text-[var(--on-surface)] hover:border-[var(--color-primary-400)]"
              >
                <span className="text-lg">🗓️</span>
                Cuando: {dueDateLabel}
              </button>
              <button
                type="button"
                onClick={(event) => onRequestDeadline(event.currentTarget)}
                className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-sm font-medium text-[var(--on-surface)] hover:border-[var(--color-primary-400)]"
              >
                <span className="text-lg">⚑</span>
                Fecha límite: {deadlineDateLabel}
              </button>
              <div className="flex items-center gap-3 text-xl text-[var(--color-text-muted)]">
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="relative h-11 w-11 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-center hover:border-[var(--color-primary-400)]"
                  aria-label="Etiquetas"
                >
                  🏷
                  {draft.labelIds.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-1 text-[10px] font-semibold text-[var(--color-primary-700)]">
                  {draft.labelIds.length}
                </span>
              )}
                </button>
              </div>
            </div>
            {draft.labelIds.length > 0 && !showDetails && (
              <div className="flex flex-wrap gap-2">
                {draft.labelIds.map(labelId => {
                  const label = labels.find(item => item.id === labelId)
                  if (!label) return null
                  return (
                    <span
                      key={label.id}
                      className="px-2 py-1 rounded-[var(--radius-chip)] text-xs border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]"
                    >
                      #{label.name}
                    </span>
                  )
                })}
              </div>
            )}
            {draft.due_at && (
              <p className="text-xs text-[var(--color-text-muted)]">Cuando: {dueDateLabel}</p>
            )}
            {draft.deadline_at && (
              <p className="text-xs text-[var(--color-text-muted)]">Fecha límite: {deadlineDateLabel}</p>
            )}
          </div>

          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">
                  Contexto opcional
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Añade área, proyecto o sección solo si ayuda a ubicarla.</p>
              </div>
              <div className="flex items-center gap-2">
                {hasContext && (
                  <div className="flex flex-wrap gap-1 text-xs text-[var(--color-text-muted)]">
                    {contextBadges.map(badge => (
                      <span
                        key={badge}
                        className="px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowContext(previous => !previous)}
                  className="min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-medium text-[var(--on-surface)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary-400)]"
                >
                  {showContext ? 'Ocultar' : 'Añadir contexto'}
                </button>
              </div>
            </div>
            {showContext && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">{t('context.label.area')}</p>
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
                    className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface-elevated)]"
                  >
                    <option value="">{t('project.new.area.none')}</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">{t('context.label.project')}</p>
                  <select
                    value={draft.projectId || (draft.view === 'inbox' ? '__inbox__' : '')}
                    onChange={(event) => {
                      const value = event.target.value || null
                      if (value === '__inbox__') {
                        onUpdateDraft('projectId', null)
                        onUpdateDraft('areaId', null)
                        onUpdateDraft('headingId', null)
                        onApplyViewPreset('inbox')
                        return
                      }
                      onUpdateDraft('projectId', value)
                      if (value) {
                        const project = projects.find(project => project.id === value)
                        onUpdateDraft('areaId', project?.area_id || null)
                      }
                      onUpdateDraft('headingId', null)
                    }}
                    className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface-elevated)]"
                  >
                    <option value="__inbox__">{t('view.inbox')}</option>
                    <option value="">{t('task.project.none')}</option>
                    {orderedProjects.withoutArea.length > 0 && !draft.areaId && (
                      <optgroup label={t('project.new.area.none')}>
                        {orderedProjects.withoutArea.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {draft.areaId ? (
                      filteredProjects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))
                    ) : orderedProjects.withArea.length > 0 ? (
                      <optgroup label={t('sidebar.areas')}>
                        {orderedProjects.withArea.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </optgroup>
                    ) : null}
                  </select>
                </div>
              </div>
            )}
            {showContext && draft.projectId && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--color-text-muted)]">{t('context.label.section')}</p>
                <select
                  value={draft.headingId || ''}
                  onChange={(event) => onUpdateDraft('headingId', event.target.value || null)}
                  className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--on-surface)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface-elevated)]"
                >
                  <option value="">{t('task.section.none')}</option>
                  {availableHeadings.map(heading => (
                    <option key={heading.id} value={heading.id}>
                      {heading.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[var(--on-surface)]">
                  Detalles al vuelo
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">Notas y etiquetas solo cuando aportan claridad.</p>
              </div>
              {hasDetails && (
                <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)] px-3 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)]">
                  {draft.labelIds.length > 0 ? `${draft.labelIds.length} etiqueta(s)` : 'Notas añadidas'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowDetails(previous => !previous)}
                className="min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-medium text-[var(--on-surface)] bg-[var(--color-surface-elevated)] hover:border-[var(--color-primary-400)]"
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
                    <span className="text-xs text-[var(--color-text-muted)]">Opcional</span>
                  </div>
                  <textarea
                    value={draft.notes}
                    onChange={(event) => onUpdateDraft('notes', event.target.value)}
                    placeholder="Pega ideas, enlaces o pasos sueltos."
                    rows={3}
                    className="w-full px-3 py-3 rounded-[var(--radius-container)] border border-[var(--color-border)] text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none resize-none bg-[var(--color-surface-elevated)]"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                      Etiquetas rápidas
                    </label>
                    {labels.length > 0 && (
                      <span className="text-xs text-[var(--color-text-muted)]">Toca para añadirlas al vuelo</span>
                    )}
                  </div>
                  {labels.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)]">
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
                            aria-pressed={isSelected}
                            className={`az-pill transition ${isSelected ? 'font-semibold' : ''}`}
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
                      className="flex-1 px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface-elevated)]"
                      disabled={savingLabel}
                    />
                    <button
                      type="submit"
                      disabled={savingLabel}
                      className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] text-sm font-semibold text-[var(--on-primary)] disabled:opacity-60"
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
            <p className="text-xs text-[var(--color-text-muted)]">Pulsa "Crear" y ajusta luego en la lista si hace falta.</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="az-btn-secondary min-h-[44px] px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={savingTask || isTitleEmpty} className="az-btn-primary min-h-[44px] px-6 py-2 text-sm">
                {savingTask ? 'Creando...' : 'Crear tarea'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
