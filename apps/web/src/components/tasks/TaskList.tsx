import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode, KeyboardEvent, DragEvent, CSSProperties } from 'react'
import type { Area, Project, ProjectHeading, Task } from '../../lib/supabase.js'
import { deserializeChecklistNotes } from '../../lib/checklistNotes.js'
import { parseISODate, formatISODate } from '../../lib/dateUtils.js'
import { useTranslations } from '../../App.js'
import CalendarIcon from '../icons/CalendarIcon.js'
import { getLabelQuickView, normalizeDate, getTaskView } from '../../pages/tasksSelectors.js'

interface EditingState {
  id: string | null
  title: string
  notes: string
  dueAt: string
  deadlineAt: string
  projectId: string | null
  areaId: string | null
  headingId: string | null
}

interface EditingHandlers {
  setTitle: (value: string) => void
  setNotes: (value: string) => void
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
  contextProjectId?: string | null
  contextAreaId?: string | null
  editingState: EditingState
  editingHandlers: EditingHandlers
  onStartEdit: (task: Task) => void
  onSaveEdit: (event?: FormEvent<HTMLFormElement>) => boolean
  onCancelEdit: () => void
  onToggleTask: (taskId: string) => void
  togglePending?: boolean
  onDeleteTask: (taskId: string) => void
  deletePending?: boolean
  onOpenEditDatePicker: (anchor?: HTMLElement | null) => void
  onOpenDeadlinePicker: (anchor?: HTMLElement | null) => void
  onOpenLabelSheet: (task: Task, anchor?: HTMLElement | null) => void
  onOpenChecklist: (task: Task, anchor?: HTMLElement | null) => void
  onOpenMoveSheet: (task: Task, anchor?: HTMLElement | null) => void
  onArchiveTask?: (task: Task) => void
  archivePending?: boolean
  onConvertToProject?: (task: Task) => void
  convertPending?: boolean
  onOpenOverflowMenu: (task: Task) => void
  onToggleCollapsedChecklist: (taskId: string, itemId: string, completed: boolean) => void
  onApplyQuickView?: (task: Task, view: 'waiting' | 'someday' | 'reference') => void
  quickViewPending?: boolean
  formatDateLabel: (value: string) => string
  renderDraftCard?: () => ReactNode
  showDraftCard?: boolean
  autoSaveOnBlur?: boolean
  dragEnabled?: boolean
  onDragStartTask?: (task: Task) => void
  onDragEndTask?: () => void
  highlightedTaskId?: string | null
  multiSelectMode?: boolean
  selectedTaskIds?: string[]
  onToggleSelection?: (taskId: string) => void
  onCreateTask?: () => void
  sortKey?: string
  sortMode?: 'default' | 'due' | 'completed'
  onReorderTasks?: (orderedIds: string[]) => void
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
  contextProjectId = null,
  contextAreaId = null,
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
  onOpenDeadlinePicker,
  onOpenLabelSheet,
  onOpenChecklist,
  onOpenMoveSheet,
  onArchiveTask,
  archivePending = false,
  onConvertToProject,
  convertPending = false,
  onOpenOverflowMenu,
  onToggleCollapsedChecklist,
  onApplyQuickView,
  quickViewPending,
  formatDateLabel,
  renderDraftCard,
  showDraftCard,
  autoSaveOnBlur = false,
  dragEnabled = false,
  onDragStartTask,
  onDragEndTask,
  highlightedTaskId = null,
  multiSelectMode = false,
  selectedTaskIds = [],
  onToggleSelection,
  onCreateTask,
  sortKey,
  sortMode = 'default',
  onReorderTasks,
}: TaskListProps) {
  const { t, language } = useTranslations()
  const selectionEnabled = multiSelectMode && !!onToggleSelection
  const selectedTaskSet = useMemo(() => new Set(selectedTaskIds), [selectedTaskIds])
  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const todayISO = formatISODate(todayDate)
  const locale = language === 'en' ? 'en-US' : 'es-ES'
  const resolveSortOrder = (task: Task) => {
    if (!sortKey) return null
    const orders = task.sort_orders
    if (!orders || typeof orders !== 'object') {
      return null
    }
    const raw = (orders as Record<string, number>)[sortKey]
    return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
  }
  const sortedTasks = useMemo(() => {
    if (!sortKey) {
      return tasks
    }
    const copy = [...tasks]
    return copy.sort((a, b) => {
      if (sortMode === 'due') {
        const aDate = normalizeDate(a.due_at)
        const bDate = normalizeDate(b.due_at)
        if (aDate !== bDate) {
          if (!aDate) return 1
          if (!bDate) return -1
          return aDate.localeCompare(bDate)
        }
      }
      if (sortMode === 'completed') {
        const aCompleted = a.completed_at || ''
        const bCompleted = b.completed_at || ''
        if (aCompleted !== bCompleted) {
          return bCompleted.localeCompare(aCompleted)
        }
      }
      const aOrder = resolveSortOrder(a)
      const bOrder = resolveSortOrder(b)
      if (aOrder !== null || bOrder !== null) {
        if (aOrder === null) return 1
        if (bOrder === null) return -1
        if (aOrder !== bOrder) {
          return aOrder - bOrder
        }
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [tasks, sortKey, sortMode])

  const buildDeadlineFlag = (value?: string | null) => {
    const normalized = normalizeDate(value)
    if (!normalized) return null
    const dueDate = parseISODate(normalized)
    if (!dueDate) return null
    dueDate.setHours(0, 0, 0, 0)
    const diffDays = Math.round((dueDate.getTime() - todayDate.getTime()) / 86400000)
    if (diffDays === 0) {
      return { label: t('view.today').toLowerCase(), isAlert: true }
    }
    if (diffDays < 0) {
      const days = Math.abs(diffDays)
      const label = language === 'en' ? `${days}d ago` : `hace ${days}d`
      return { label, isAlert: true }
    }
    const label = dueDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
    return { label, isAlert: false }
  }
  const [celebratingTaskId, setCelebratingTaskId] = useState<string | null>(null)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)
  const celebrationTimeoutRef = useRef<number | null>(null)
  const editingContainerRef = useRef<HTMLDivElement | null>(null)
  const autoSaveTriggerRef = useRef(false)
  const hasDraft = showDraftCard && renderDraftCard

  const {
    id: editingId,
    title: editingTitle,
    notes: editingNotes,
    dueAt: editingDueAt,
    deadlineAt: editingDeadlineAt,
    projectId: editingProjectId,
    areaId: editingAreaId,
    headingId: editingHeadingId,
  } = editingState
  const {
    setTitle: setEditingTitle,
    setNotes: setEditingNotes,
    setAreaId: _setEditingAreaId,
    setProjectId: _setEditingProjectId,
    setHeadingId: _setEditingHeadingId,
  } = editingHandlers

  const triggerCompletionCelebration = (taskId: string) => {
    if (celebrationTimeoutRef.current) {
      window.clearTimeout(celebrationTimeoutRef.current)
    }
    setCelebratingTaskId(taskId)
    celebrationTimeoutRef.current = window.setTimeout(() => {
      setCelebratingTaskId((current) => (current === taskId ? null : current))
    }, 700)
  }

  useEffect(() => {
    return () => {
      if (celebrationTimeoutRef.current) {
        window.clearTimeout(celebrationTimeoutRef.current)
      }
    }
  }, [])

  const handleDragStart = (event: DragEvent<HTMLLIElement>, task: Task) => {
    if (!dragEnabled || selectionEnabled) {
      return
    }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
    setDraggingTaskId(task.id)
    onDragStartTask?.(task)
  }

  const handleDragEnd = () => {
    if (!dragEnabled || selectionEnabled) {
      return
    }
    setDraggingTaskId(null)
    setDragOverTaskId(null)
    onDragEndTask?.()
  }

  const canReorder = dragEnabled && !selectionEnabled && !!onReorderTasks
  const sortedTaskIds = useMemo(() => sortedTasks.map(task => task.id), [sortedTasks])
  const isSameOrder = (nextOrder: string[], currentOrder: string[]) =>
    nextOrder.length === currentOrder.length && nextOrder.every((id, index) => id === currentOrder[index])

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

  const handleReorderDragOver = (event: DragEvent<HTMLLIElement>, taskId: string) => {
    if (!canReorder) {
      return
    }
    const sourceId = event.dataTransfer.getData('text/plain')
    if (!sourceId || !sortedTaskIds.includes(sourceId)) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverTaskId(taskId)
  }

  const handleReorderDrop = (event: DragEvent<HTMLLIElement>, taskId: string) => {
    if (!canReorder) {
      return
    }
    const sourceId = event.dataTransfer.getData('text/plain')
    if (!sourceId || !sortedTaskIds.includes(sourceId)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY > rect.top + rect.height / 2
    const nextOrder = buildReorderedIds(sortedTaskIds, sourceId, taskId, insertAfter)
    setDragOverTaskId(null)
    if (!isSameOrder(nextOrder, sortedTaskIds)) {
      onReorderTasks?.(nextOrder)
    }
  }

  const handleReorderDropAtEnd = (event: DragEvent<HTMLUListElement>) => {
    if (!canReorder) {
      return
    }
    const sourceId = event.dataTransfer.getData('text/plain')
    if (!sourceId || !sortedTaskIds.includes(sourceId)) {
      return
    }
    event.preventDefault()
    const nextOrder = [...sortedTaskIds.filter(id => id !== sourceId), sourceId]
    setDragOverTaskId(null)
    if (!isSameOrder(nextOrder, sortedTaskIds)) {
      onReorderTasks?.(nextOrder)
    }
  }

  const handleReorderListDragOver = (event: DragEvent<HTMLUListElement>) => {
    if (!canReorder) {
      return
    }
    const sourceId = event.dataTransfer.getData('text/plain')
    if (!sourceId || !sortedTaskIds.includes(sourceId)) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const triggerAutoSave = () => {
    if (autoSaveTriggerRef.current) {
      return
    }
    autoSaveTriggerRef.current = true
    const didSave = onSaveEdit()
    if (didSave) {
      onCancelEdit()
    }
  }

  useEffect(() => {
    autoSaveTriggerRef.current = false
  }, [editingId, editingTitle, editingNotes, editingDueAt, editingDeadlineAt, editingProjectId, editingAreaId, editingHeadingId])

  const handleEditKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancelEdit()
    }
  }

  useEffect(() => {
    const shouldAutoSave = !!editingId && autoSaveOnBlur
    if (!shouldAutoSave) {
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
      triggerAutoSave()
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
    }
  }, [editingId, autoSaveOnBlur, triggerAutoSave])

  if (isLoading && showEmptyState && showLoadingState && !hasDraft) {
    const loadingClass = variant === 'mobile' ? 'p-6 text-center text-[var(--color-text-muted)]' : 'p-10 text-center text-[var(--color-text-muted)]'
    return <div className={loadingClass}>Cargando tareas...</div>
  }

  if (sortedTasks.length === 0 && !hasDraft) {
    if (!showEmptyState) {
      return null
    }
    const emptyClass = variant === 'mobile' ? 'p-6 text-center text-[var(--color-text-muted)]' : 'p-10 text-center text-[var(--color-text-muted)]'
    const emptyMessage = filteredViewActive ? t('tasks.empty.filtered') : t('tasks.empty')
    return (
      <div className={`${emptyClass} space-y-4`}>
        <p>{emptyMessage}</p>
        {onCreateTask && (
          <button
            type="button"
            onClick={onCreateTask}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
          >
            {t('tasks.empty.cta')}
          </button>
        )}
      </div>
    )
  }

  const checkboxIcon = (
    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
  const noteIcon = (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8.5a1 1 0 00-.293-.707l-4.5-4.5A1 1 0 0011.5 3H5zm6 1.414L15.586 9H12a1 1 0 01-1-1V4.414z" />
    </svg>
  )

  return (
    <>
      {showDraftCard && renderDraftCard ? renderDraftCard() : null}
      <ul
        className={variant === 'mobile' ? 'flex flex-col gap-4' : 'flex flex-col divide-y divide-[var(--color-divider)]'}
        onDragOver={handleReorderListDragOver}
        onDrop={handleReorderDropAtEnd}
        onDragLeave={() => setDragOverTaskId(null)}
      >
        {sortedTasks.map(task => {
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
          const isEditingSelected = isEditing
          const isSelectedForBulk = selectionEnabled && selectedTaskSet.has(task.id)
          const isContextView = !!contextProjectId || !!contextAreaId
          const showInlineEditor = isEditing && variant === 'desktop'
          const baseLiClass =
            variant === 'mobile'
              ? `p-4 rounded-[var(--radius-container)] border ${
                  task.status === 'done' ? 'border-transparent bg-transparent ' : 'border-[var(--color-border)] bg-[var(--color-surface)] '
                } transition-colors`
              : `group px-3 py-2 min-h-[48px] ${
                  isEditingSelected
                    ? 'bg-[var(--color-surface-elevated)] border-l-4 border-l-[var(--color-action-500)]'
                    : 'hover:bg-[var(--color-surface-elevated)]'
                } transition-colors`
          const dragAllowed = dragEnabled && !selectionEnabled
          const dragClass = dragAllowed && !isEditing ? 'cursor-grab active:cursor-grabbing' : ''
          const draggingClass = draggingTaskId === task.id ? 'opacity-60' : ''
          const selectionClass = isSelectedForBulk ? 'ring-2 ring-[var(--color-action-500)] bg-[var(--color-accent-50)]' : ''
          const highlightClass = highlightedTaskId === task.id ? 'ring-2 ring-[var(--color-primary-200)]' : ''
          const dropIndicatorClass = canReorder && dragOverTaskId === task.id ? 'ring-2 ring-[var(--color-primary-200)]' : ''
          const titleClass = variant === 'mobile' ? 'text-lg font-semibold' : 'font-semibold text-base'
          const metaClass =
            variant === 'mobile'
              ? 'flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]'
              : 'flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-muted)]'
          const checkboxClass = selectionEnabled
            ? `relative ${variant === 'mobile' ? 'h-7 w-7' : 'h-6 w-6'} rounded-full border-2 flex items-center justify-center overflow-visible transition ${
                isSelectedForBulk
                  ? 'bg-[var(--color-action-500)] border-[var(--color-action-500)] text-[var(--on-primary)]'
                  : 'border-[var(--color-border)] text-transparent'
              }`
            : variant === 'mobile'
              ? `relative h-7 w-7 rounded-full border-2 flex items-center justify-center overflow-visible transition ${
                  task.status === 'done'
                    ? 'bg-[var(--color-done-500)] border-[var(--color-done-500)] text-white'
                    : 'border-[var(--color-border)] text-transparent'
                }`
              : `relative h-6 w-6 rounded-full border-2 flex items-center justify-center overflow-visible transition ${
                  task.status === 'done'
                    ? 'bg-[var(--color-done-500)] border-[var(--color-done-500)] text-white'
                    : 'border-[var(--color-border)] group-hover:border-[var(--color-primary-600)] text-transparent'
                }`
          const handleRowClick = () => {
            if (selectionEnabled) {
              onToggleSelection?.(task.id)
              return
            }
            onStartEdit(task)
          }
          const compactActivationProps = !isEditing
            ? {
                onClick: handleRowClick,
              }
            : {}
          const useInlineLayout = true
          const showInlineMeta = variant === 'desktop'
          const checklistCompleted = checklistItems.filter(item => item.completed).length
          const checklistSummary = checklistItems.length > 0 ? `${checklistCompleted}/${checklistItems.length}` : null
          const waitingActive = (task.labels || []).some(label => getLabelQuickView(label.name) === 'waiting')
          const referenceActive = (task.labels || []).some(label => getLabelQuickView(label.name) === 'reference')
          const somedayActive = task.status === 'snoozed'
          const labelCount = task.labels?.length ?? 0
          const deadlineFlag = buildDeadlineFlag(task.deadline_at)
          const deadlineStyle = deadlineFlag?.isAlert
            ? ({
                '--az-pill-border': 'var(--color-danger-500)',
                '--az-pill-text': 'var(--color-danger-500)',
                '--az-pill-bg': 'var(--color-accent-200)',
              } as CSSProperties)
            : undefined
          const deadlineTitle = deadlineFlag ? `${t('gtd.due')}: ${deadlineFlag.label}` : ''
          const metaChips: ReactNode[] = []
          const contextChipLabel = !isContextView ? (taskProject?.name || taskArea?.name) : null
          const taskView = variant === 'mobile' ? getTaskView(task, todayISO) : null
          const scheduleIcon =
            taskView === 'today'
              ? { icon: '⭐', label: t('view.today') }
              : taskView === 'upcoming'
                ? { icon: '📆', label: t('view.upcoming') }
                : taskView === 'anytime'
                  ? { icon: '🌤️', label: t('view.anytime') }
                  : taskView === 'someday'
                    ? { icon: '📦', label: t('view.someday') }
                    : taskView === 'waiting'
                      ? { icon: '⏳', label: t('view.waiting') }
                      : taskView === 'reference'
                        ? { icon: '📚', label: t('view.reference') }
                        : taskView === 'inbox'
                          ? { icon: '📥', label: t('view.inbox') }
                          : null

          if (useInlineLayout && showInlineMeta) {
            if (contextChipLabel) {
              metaChips.push(
                <span key="context" className="az-pill max-w-[12rem] truncate">
                  {contextChipLabel}
                </span>
              )
            }
            if (contextAreaId && !contextProjectId && taskProject) {
              metaChips.push(
                <span key="context-project" className="az-pill max-w-[12rem] truncate">
                  {taskProject.name}
                </span>
              )
            }
            if (labelCount > 0) {
              metaChips.push(
                <span key="labels" className="az-pill">
                  <span aria-hidden>🏷</span>
                  {labelCount}
                </span>
              )
            }
            if (checklistSummary) {
              metaChips.push(
                <span key="checklist" className="az-pill">
                  <span aria-hidden>☑</span>
                  {checklistSummary}
                </span>
              )
            }
            if (plainNotes) {
              metaChips.push(
                <span key="notes" className="az-pill">
                  {noteIcon}
                  <span className="sr-only">{t('task.notes')}</span>
                </span>
              )
            }
            if (deadlineFlag) {
              metaChips.push(
                <span
                  key="due"
                  className="az-pill whitespace-nowrap"
                  style={deadlineStyle}
                  title={deadlineTitle}
                  aria-label={deadlineTitle}
                >
                  <span aria-hidden>⚑</span>
                  {deadlineFlag.label}
                </span>
              )
            }
          }
          return (
            <li
              key={task.id}
              id={`task-${task.id}`}
              className={`${baseLiClass} ${dragClass} ${draggingClass} ${selectionClass} ${highlightClass} ${dropIndicatorClass}`}
              draggable={dragAllowed && !isEditing}
              onDragStart={(event) => handleDragStart(event, task)}
              onDragEnd={handleDragEnd}
              onDragOver={(event) => handleReorderDragOver(event, task.id)}
              onDrop={(event) => handleReorderDrop(event, task.id)}
              {...compactActivationProps}
            >
              {showInlineEditor ? (
                <div
                  ref={(node) => (isEditing ? (editingContainerRef.current = node) : undefined)}
                  onBlurCapture={(event) => {
                    if (!autoSaveOnBlur || !editingContainerRef.current) {
                      return
                    }
                    const nextTarget = event.relatedTarget as Node | null
                    if (nextTarget && editingContainerRef.current.contains(nextTarget)) {
                      return
                    }
                    triggerAutoSave()
                  }}
                >
                  <form
                    onSubmit={(event) => {
                      autoSaveTriggerRef.current = true
                      onSaveEdit(event)
                    }}
                    className="space-y-3 p-4 bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] border-l-4 border-l-[var(--color-accent-500)]"
                  >
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      placeholder="Título"
                      onKeyDown={handleEditKeyDown}
                      autoFocus
                      className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
                    />
                    <textarea
                      value={editingNotes}
                      onChange={(event) => setEditingNotes(event.target.value)}
                      placeholder="Notas..."
                      onKeyDown={handleEditKeyDown}
                      rows={2}
                      className="w-full px-3 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none resize-none"
                    />
                    <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-[var(--color-text-muted)]">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenEditDatePicker(event.currentTarget)
                        }}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        <span>{t('task.edit.when')}: {formatDateLabel(editingDueAt)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenDeadlinePicker(event.currentTarget)
                        }}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span aria-hidden>⚑</span>
                        <span>{t('gtd.due')}: {formatDateLabel(editingDeadlineAt)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenLabelSheet(task, event.currentTarget)
                        }}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span>🏷</span>
                        <span>{t('task.labels')}</span>
                        {labelCount > 0 && (
                          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 text-[11px] font-semibold text-[var(--color-primary-700)]">
                            {labelCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpenChecklist(task, event.currentTarget)
                        }}
                        className="inline-flex items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 font-semibold hover:border-[var(--color-primary-600)]"
                      >
                        <span>☑</span>
                        <span>{t('task.checklist')}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-[var(--color-text-muted)]">
                      {editingProject && (
                        <span className="px-3 py-1 rounded-[var(--radius-chip)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                          {t('context.label.project')}: {editingProject.name}
                        </span>
                      )}
                      {editingArea && !editingProject && (
                        <span className="px-3 py-1 rounded-[var(--radius-chip)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                          {t('context.label.area')}: {editingArea.name}
                        </span>
                      )}
                      {editingHeading && (
                        <span className="px-3 py-1 rounded-[var(--radius-chip)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                          {t('context.label.section')}: {editingHeading.name}
                        </span>
                      )}
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
                    <p className="text-xs text-[var(--color-text-muted)]">{t('task.autoSaveHint')}</p>
                  </form>
                  <div className="mt-4 flex items-center justify-end gap-3">
                    {onArchiveTask && (
                      <button
                        type="button"
                        onClick={() => onArchiveTask(task)}
                        disabled={archivePending || task.status === 'done'}
                        className="min-h-[44px] flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] disabled:opacity-50"
                      >
                        <span className="text-lg">✓</span>
                        <span>{t('task.archive')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenMoveSheet(task, event.currentTarget)
                      }}
                      className="min-h-[44px] flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-700)]"
                    >
                      <span className="text-lg">→</span>
                      <span>{t('task.move')}</span>
                    </button>
                    {onConvertToProject && (
                      <button
                        type="button"
                        onClick={() => onConvertToProject(task)}
                        disabled={convertPending || !!task.project_id}
                        className="min-h-[44px] flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--on-surface)] hover:border-[var(--color-primary-600)] hover:text-[var(--color-primary-700)] disabled:opacity-50"
                        title={task.project_id ? t('task.convertedHint') : undefined}
                      >
                        <span className="text-lg">📁</span>
                        <span>{t('task.convert')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      disabled={deletePending}
                      className="min-h-[44px] flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-danger-500)] px-4 py-2 text-sm font-semibold text-[var(--color-danger-500)] hover:opacity-80 disabled:opacity-50"
                    >
                      <span>🗑</span>
                      <span>{t('task.trash')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenOverflowMenu(task)}
                      className="min-h-[44px] flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
                    >
                      <span>…</span>
                    </button>
                  </div>
                </div>
              ) : useInlineLayout ? (
                <div className="flex items-center gap-2 cursor-pointer">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      if (selectionEnabled) {
                        onToggleSelection?.(task.id)
                        return
                      }
                      if (task.status !== 'done') {
                        triggerCompletionCelebration(task.id)
                      }
                      onToggleTask(task.id)
                    }}
                    disabled={togglePending}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center group disabled:opacity-50"
                    aria-label={
                      selectionEnabled
                        ? isSelectedForBulk
                          ? t('multiSelect.deselectTask')
                          : t('multiSelect.selectTask')
                        : task.status === 'done'
                          ? 'Marcar como pendiente'
                          : 'Marcar como completada'
                    }
                  >
                    <span className={checkboxClass}>
                      {celebratingTaskId === task.id ? (
                        <>
                          <span className="az-complete-ring" aria-hidden />
                          <span className="az-complete-spark" aria-hidden />
                        </>
                      ) : null}
                      {selectionEnabled ? (isSelectedForBulk ? checkboxIcon : null) : task.status === 'done' ? checkboxIcon : null}
                    </span>
                  </button>
                  <div className="flex-1 min-w-0 flex items-center gap-4 flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-nowrap">
                        {variant === 'mobile' && scheduleIcon ? (
                          <span
                            className="text-sm text-[var(--color-text-muted)]"
                            aria-label={scheduleIcon.label}
                            title={scheduleIcon.label}
                          >
                            {scheduleIcon.icon}
                          </span>
                        ) : null}
                        <p
                          className={`${titleClass} ${
                            task.status === 'done' ? 'text-[var(--color-text-subtle)] line-through' : 'text-[var(--on-surface)]'
                          } truncate flex-1 min-w-0`}
                        >
                          {task.title}
                        </p>
                        {task.pinned ? <span className="text-base" aria-label="Tarea fijada">📌</span> : null}
                        {variant === 'mobile' && plainNotes ? (
                          <span className="text-[var(--color-text-muted)]" aria-label={t('task.notes')}>
                            {noteIcon}
                          </span>
                        ) : null}
                      </div>
                      {variant === 'mobile' && !isContextView && (taskProject || taskArea) ? (
                        <p className="text-sm text-[var(--color-text-muted)] truncate">
                          {taskProject?.name || taskArea?.name}
                        </p>
                      ) : null}
                      {variant === 'mobile' && isContextView && taskProject ? (
                        <p className="text-sm text-[var(--color-text-muted)] truncate">{t('context.label.project')}: {taskProject.name}</p>
                      ) : null}
                      {variant === 'mobile' && isContextView && !taskProject && taskArea ? (
                        <p className="text-sm text-[var(--color-text-muted)] truncate">{t('context.label.area')}: {taskArea.name}</p>
                      ) : null}
                    </div>
                    {variant === 'mobile' && deadlineFlag ? (
                      <span
                        className="ml-auto az-pill whitespace-nowrap text-[10px]"
                        style={deadlineStyle}
                        title={deadlineTitle}
                        aria-label={deadlineTitle}
                      >
                        <span aria-hidden>⚑</span>
                        {deadlineFlag.label}
                      </span>
                    ) : null}
                    {metaChips.length > 0 && (
                      <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-text-muted)] flex-nowrap overflow-hidden min-w-0">
                        {metaChips}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={(event) => {
                      event.stopPropagation()
                      if (selectionEnabled) {
                        onToggleSelection?.(task.id)
                        return
                      }
                      if (task.status !== 'done') {
                        triggerCompletionCelebration(task.id)
                      }
                      onToggleTask(task.id)
                    }}
                    disabled={togglePending}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center group disabled:opacity-50"
                    aria-label={
                      selectionEnabled
                        ? isSelectedForBulk
                          ? t('multiSelect.deselectTask')
                          : t('multiSelect.selectTask')
                        : task.status === 'done'
                          ? 'Marcar como pendiente'
                          : 'Marcar como completada'
                    }
                  >
                    <span className={checkboxClass}>
                      {celebratingTaskId === task.id ? (
                        <>
                          <span className="az-complete-ring" aria-hidden />
                          <span className="az-complete-spark" aria-hidden />
                        </>
                      ) : null}
                      {selectionEnabled ? (isSelectedForBulk ? checkboxIcon : null) : task.status === 'done' ? checkboxIcon : null}
                    </span>
                  </button>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div
                      className={`flex justify-between ${variant === 'mobile' ? 'flex-col gap-2' : 'flex-row items-start'}`}
                    >
                      <p className={`${titleClass} ${task.status === 'done' ? 'text-[var(--color-text-subtle)] line-through' : 'text-[var(--on-surface)]'}`}>
                        {task.title}
                      </p>
                      {task.pinned ? <span className="text-lg" aria-label="Tarea fijada">📌</span> : null}
                    </div>
                    {!isContextView && (taskProject || taskArea) ? (
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {taskProject?.name || taskArea?.name}
                      </p>
                    ) : null}
                    {plainNotes && <p className="text-sm text-[var(--color-text-muted)]">{plainNotes}</p>}
                    <div className={metaClass}>
                      {isContextView && taskProject && (
                        <span className="text-xs px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                          {t('context.label.project')}: {taskProject.name}
                        </span>
                      )}
                      {isContextView && !taskProject && taskArea && (
                        <span className="text-xs px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                          {t('context.label.area')}: {taskArea.name}
                        </span>
                      )}
                      {taskHeading && (
                        <span className="text-xs px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                          {t('context.label.section')}: {taskHeading.name}
                        </span>
                      )}
                      {task.due_at && (
                        <span className="text-xs px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] inline-flex items-center gap-1.5">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {t('task.edit.when')}: {formatDateLabel(task.due_at)}
                        </span>
                      )}
                      {task.deadline_at && (
                        <span
                          className="text-xs px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] inline-flex items-center gap-1.5"
                          aria-label={`${t('gtd.due')}: ${formatDateLabel(task.deadline_at)}`}
                        >
                          <span aria-hidden>⚑</span>
                          {t('gtd.due')}: {formatDateLabel(task.deadline_at)}
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
                          <li key={item.id} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                            {item.persisted ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  onToggleCollapsedChecklist(task.id, item.id, item.completed)
                                }}
                                className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label={item.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                <span
                                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                    item.completed
                                      ? 'bg-[var(--color-done-500)] border-[var(--color-done-500)] text-white'
                                      : 'border-[var(--color-border)] text-transparent'
                                  }`}
                                >
                                  ✓
                                </span>
                              </button>
                            ) : (
                              <span className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                                <span
                                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                    item.completed
                                      ? 'bg-[var(--color-done-500)] border-[var(--color-done-500)] text-white'
                                      : 'border-[var(--color-border)] text-transparent'
                                  }`}
                                >
                                  ✓
                                </span>
                              </span>
                            )}
                            <span className={item.completed ? 'line-through text-[var(--color-text-subtle)]' : ''}>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="text-xs text-[var(--color-text-subtle)]">
                      {t('task.createdOn')}{' '}
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
