import type { FormEvent } from 'react'
import type { Area, Project, ProjectHeading, Task } from '../../lib/supabase.js'
import { deserializeChecklistNotes } from '../../lib/checklistNotes.js'
import { getSoftLabelStyle } from '../../lib/colorUtils.js'
import { useTranslations } from '../../App.js'
import CalendarIcon from '../icons/CalendarIcon.js'
import { getLabelQuickView } from '../../pages/tasksSelectors.js'

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

interface DesktopDetailPanelProps {
  task: Task | null
  project: Project | null
  area: Area | null
  heading: ProjectHeading | null
  className?: string
  editingState: EditingState
  editingHandlers: EditingHandlers
  onSaveEdit: (event?: FormEvent<HTMLFormElement>) => boolean
  onCancelEdit: () => void
  onOpenEditDatePicker: (anchor?: HTMLElement | null) => void
  onOpenLabelSheet: (task: Task, anchor?: HTMLElement | null) => void
  onOpenChecklist: (task: Task, anchor?: HTMLElement | null) => void
  onOpenMoveSheet: (task: Task, anchor?: HTMLElement | null) => void
  onOpenOverflowMenu: (task: Task) => void
  onApplyQuickView?: (task: Task, view: 'waiting' | 'someday' | 'reference') => void
  quickViewPending?: boolean
  formatDateLabel: (value: string) => string
}

const statusLabels: Record<string, string> = {
  open: 'Pendiente',
  done: 'Completada',
  snoozed: 'Algún día',
}

export default function DesktopDetailPanel({
  task,
  project,
  area,
  heading,
  className,
  editingState,
  editingHandlers,
  onSaveEdit,
  onCancelEdit,
  onOpenEditDatePicker,
  onOpenLabelSheet,
  onOpenChecklist,
  onOpenMoveSheet,
  onOpenOverflowMenu,
  onApplyQuickView,
  quickViewPending,
  formatDateLabel,
}: DesktopDetailPanelProps) {
  const { t } = useTranslations()
  if (!task) {
    return (
      <aside className={`rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col min-h-0 ${className ?? ''}`}>
        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <p className="az-meta text-[var(--color-text-muted)]">Detalle</p>
          <p className="az-h2 text-[var(--on-surface)]">Selecciona una tarea</p>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6 text-sm text-[var(--color-text-muted)]">
          Elige una tarea en la lista para ver su contexto, notas y etiquetas aquí.
        </div>
      </aside>
    )
  }

  const legacy = deserializeChecklistNotes(task.notes)
  const checklistItems =
    task.checklist_items && task.checklist_items.length > 0
      ? task.checklist_items.map(item => ({ id: item.id, text: item.text, completed: item.completed }))
      : legacy.items.map(item => ({ id: item.id || item.text, text: item.text, completed: item.completed }))

  const metaChips: Array<{ id: string; label: string }> = [
    { id: 'status', label: `Estado: ${statusLabels[task.status] || 'Pendiente'}` },
  ]

  if (editingState.dueAt) {
    metaChips.push({ id: 'due', label: `Cuando: ${formatDateLabel(editingState.dueAt)}` })
  }
  if (project) {
    metaChips.push({ id: 'project', label: `Proyecto: ${project.name}` })
  }
  if (area && !project) {
    metaChips.push({ id: 'area', label: `Área: ${area.name}` })
  }
  if (heading) {
    metaChips.push({ id: 'heading', label: `Sección: ${heading.name}` })
  }

  const labelCount = task.labels?.length ?? 0
  const waitingActive = (task.labels || []).some(label => getLabelQuickView(label.name) === 'waiting')
  const referenceActive = (task.labels || []).some(label => getLabelQuickView(label.name) === 'reference')
  const somedayActive = task.status === 'snoozed'

  return (
    <aside className={`rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col min-h-0 ${className ?? ''}`}>
      <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <p className="az-meta text-[var(--color-text-muted)]">Detalle</p>
          <input
            type="text"
            value={editingState.title}
            onChange={(event) => editingHandlers.setTitle(event.target.value)}
            placeholder="Título"
            className="w-full bg-transparent text-[var(--on-surface)] text-lg font-semibold outline-none border-b border-transparent focus:border-[var(--color-primary-600)]"
          />
        </div>
        <button
          type="button"
          onClick={onCancelEdit}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--on-surface)] text-xl"
          aria-label={t('actions.close')}
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={(event) => onOpenEditDatePicker(event.currentTarget)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {formatDateLabel(editingState.dueAt)}
          </button>
          <button
            type="button"
            onClick={(event) => onOpenLabelSheet(task, event.currentTarget)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            <span>🏷</span>
            {t('task.labels')}
            {labelCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 text-[11px] font-semibold text-[var(--color-primary-700)]">
                {labelCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={(event) => onOpenChecklist(task, event.currentTarget)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            <span>☑</span>
            {t('task.checklist')}
          </button>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--on-surface)]">Notas</p>
          <textarea
            value={editingState.notes}
            onChange={(event) => editingHandlers.setNotes(event.target.value)}
            placeholder="Notas..."
            rows={5}
            className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none resize-none bg-[var(--color-surface-elevated)]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {metaChips.map(chip => (
            <span key={chip.id} className="az-pill">
              {chip.label}
            </span>
          ))}
        </div>
        {onApplyQuickView && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">{t('task.quickView.title')}</span>
            {[
              { id: 'waiting', label: t('view.waiting'), icon: '⏳', active: waitingActive },
              { id: 'someday', label: t('view.someday'), icon: '📦', active: somedayActive },
              { id: 'reference', label: t('view.reference'), icon: '📚', active: referenceActive },
            ].map(action => (
              <button
                key={action.id}
                type="button"
                disabled={quickViewPending}
                onClick={() => onApplyQuickView(task, action.id as 'waiting' | 'someday' | 'reference')}
                className={`inline-flex items-center gap-1 rounded-[var(--radius-chip)] border px-3 py-1 font-semibold transition ${
                  action.active
                    ? 'border-[var(--color-action-500)] bg-[var(--color-accent-200)] text-[var(--color-action-500)]'
                    : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-action-500)]'
                }`}
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--on-surface)]">{t('task.labels')}</p>
          {task.labels && task.labels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {task.labels.map(label => (
                <span key={label.id} className="az-pill" style={getSoftLabelStyle(label.color)}>
                  {label.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Sin etiquetas.</p>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--on-surface)]">{t('task.checklist')}</p>
          {checklistItems.length > 0 ? (
            <ul className="space-y-2">
              {checklistItems.map(item => (
                <li key={item.id} className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] ${
                      item.completed
                        ? 'bg-[var(--color-action-500)] border-[var(--color-action-500)] text-[var(--on-primary)]'
                        : 'border-[var(--color-border)] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span className={item.completed ? 'line-through text-[var(--color-text-subtle)]' : ''}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">Sin checklist.</p>
          )}
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[var(--color-text-subtle)]">
          {t('task.created')}{' '}
          {new Date(task.created_at).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(event) => onOpenMoveSheet(task, event.currentTarget)}
            className="min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            {t('task.move')}
          </button>
          <button
            type="button"
            onClick={() => onOpenOverflowMenu(task)}
            className="min-h-[44px] px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            ⋯
          </button>
          <button
            type="button"
            onClick={() => onSaveEdit()}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90"
          >
            Guardar
          </button>
        </div>
      </div>
    </aside>
  )
}
