import { useCallback, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import type { TaskCreationDraft } from '../../hooks/useTaskCreation.js'
import CalendarIcon from '../icons/CalendarIcon.js'

interface DesktopDraftCardProps {
  draft: TaskCreationDraft
  viewLabel: string
  dueLabel: string
  deadlineLabel: string
  labelCount: number
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onTitleChange: (value: string) => void
  onNotesChange: (value: string) => void
  onRequestDueDate: (anchor?: HTMLElement | null) => void
  onRequestDeadline: (anchor?: HTMLElement | null) => void
  onOpenLabels: () => void
  autoSaveEnabled?: boolean
}

export function DesktopDraftCard({
  draft,
  viewLabel,
  dueLabel,
  deadlineLabel,
  labelCount,
  onSubmit,
  onCancel,
  onTitleChange,
  onNotesChange,
  onRequestDueDate,
  onRequestDeadline,
  onOpenLabels,
  autoSaveEnabled = true,
}: DesktopDraftCardProps) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const hasCommittedRef = useRef(false)

  const refocusTitle = useCallback(() => {
    requestAnimationFrame(() => {
      titleRef.current?.focus()
    })
  }, [])

  const commitDraft = useCallback((options?: { forceCancel?: boolean }) => {
    if (hasCommittedRef.current) {
      return
    }
    const trimmedTitle = draft.title.trim()
    if (!trimmedTitle) {
      if (options?.forceCancel) {
        hasCommittedRef.current = true
        onCancel()
        return
      }
      refocusTitle()
      return
    }
    hasCommittedRef.current = true
    onSubmit()
  }, [draft.title, onCancel, onSubmit, refocusTitle])

  useEffect(() => {
    if (!autoSaveEnabled) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!formRef.current) {
        return
      }
      if (formRef.current.contains(event.target as Node)) {
        return
      }
      commitDraft()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [autoSaveEnabled, commitDraft])

  useEffect(() => {
    titleRef.current?.focus()
    hasCommittedRef.current = false
  }, [])

  useEffect(() => {
    hasCommittedRef.current = false
  }, [
    draft.title,
    draft.notes,
    draft.due_at,
    draft.projectId,
    draft.areaId,
    draft.headingId,
    draft.labelIds,
  ])

  return (
    <form
      ref={formRef}
      onSubmit={(event) => {
        onSubmit(event)
        hasCommittedRef.current = true
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          hasCommittedRef.current = true
          onCancel()
        }
      }}
      onBlurCapture={(event) => {
        if (!autoSaveEnabled) {
          return
        }
        if (formRef.current && event.relatedTarget && formRef.current.contains(event.relatedTarget as Node)) {
          return
        }
        commitDraft()
      }}
      className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--on-surface)]  p-6 space-y-4"
    >
      <div className="flex gap-4">
        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] text-transparent">
          □
        </span>
        <div className="flex-1 space-y-2">
          <input
            ref={titleRef}
            type="text"
            value={draft.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Nueva tarea"
            className="w-full bg-transparent text-lg font-semibold text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none border-b border-transparent focus:border-[var(--color-primary-600)]"
          />
          <textarea
            value={draft.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Notas"
            rows={2}
            className="w-full bg-transparent text-sm text-[var(--color-text-muted)] placeholder-[var(--color-text-subtle)] outline-none resize-none"
          />
          <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)] pt-1 flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-chip)] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] font-semibold text-[var(--color-text-muted)]">
              <span className="text-lg">⭐</span>
              {viewLabel}
            </span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <button
                type="button"
                onClick={onOpenLabels}
                className="relative h-11 w-11 rounded-[var(--radius-card)] border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-primary-600)]"
                aria-label="Etiquetas"
              >
                🏷
                {labelCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-1 text-[10px] font-semibold text-[var(--color-primary-700)]">
                    {labelCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={(event) => onRequestDueDate(event.currentTarget)}
                className="min-h-[44px] px-3 rounded-[var(--radius-card)] border border-[var(--color-border)] inline-flex items-center gap-2 hover:border-[var(--color-primary-600)]"
              >
                <CalendarIcon className="h-4 w-4" />
                Cuando: {dueLabel}
              </button>
              <button
                type="button"
                onClick={(event) => onRequestDeadline(event.currentTarget)}
                className="min-h-[44px] px-3 rounded-[var(--radius-card)] border border-[var(--color-border)] inline-flex items-center gap-2 hover:border-[var(--color-primary-600)]"
              >
                <span aria-hidden>⚑</span>
                Fecha límite: {deadlineLabel}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-1 flex-wrap gap-2">
            <p>Se guarda automáticamente al salir.</p>
            <button
              type="button"
              onClick={() => {
                hasCommittedRef.current = true
                onCancel()
              }}
              className="text-[var(--color-text-muted)] hover:text-[var(--on-surface)] font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
