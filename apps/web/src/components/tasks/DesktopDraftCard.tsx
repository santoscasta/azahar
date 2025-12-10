import { useCallback, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import type { TaskCreationDraft } from '../../hooks/useTaskCreation.js'
import CalendarIcon from '../icons/CalendarIcon.js'

interface DesktopDraftCardProps {
  draft: TaskCreationDraft
  viewLabel: string
  dueLabel: string
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onTitleChange: (value: string) => void
  onNotesChange: (value: string) => void
  onRequestDueDate: () => void
  onOpenLabels: () => void
  onCyclePriority: () => void
  autoSaveEnabled?: boolean
}

const priorityBadge: Record<TaskCreationDraft['priority'], string> = {
  0: 'Sin prioridad',
  1: '🟢 Baja',
  2: '🟡 Media',
  3: '🔴 Alta',
}

export function DesktopDraftCard({
  draft,
  viewLabel,
  dueLabel,
  onSubmit,
  onCancel,
  onTitleChange,
  onNotesChange,
  onRequestDueDate,
  onOpenLabels,
  onCyclePriority,
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
    draft.priority,
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
      className="rounded-2xl border border-[var(--color-border)] bg-white text-[#2D2520] shadow-[0_18px_40px_rgba(45,37,32,0.12)] p-5 space-y-4"
    >
      <div className="flex gap-4">
        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--color-border)] text-transparent">
          □
        </span>
        <div className="flex-1 space-y-2">
          <input
            ref={titleRef}
            type="text"
            value={draft.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Nueva tarea"
            className="w-full bg-transparent text-lg font-semibold text-[#2D2520] placeholder-[#C4BDB5] outline-none border-b border-transparent focus:border-[var(--color-primary-600)]"
          />
          <textarea
            value={draft.notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Notas"
            rows={2}
            className="w-full bg-transparent text-sm text-[#736B63] placeholder-[#C4BDB5] outline-none resize-none"
          />
          <div className="flex items-center justify-between text-sm text-[#736B63] pt-1 flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary-100)] border border-[var(--color-border)] font-semibold text-[var(--color-primary-800)]">
              <span className="text-lg">⭐</span>
              {viewLabel}
            </span>
            <div className="flex items-center gap-2 text-[#9B928A]">
              <button
                type="button"
                onClick={onOpenLabels}
                className="h-9 w-9 rounded-full border border-[var(--color-border)] flex items-center justify-center hover:border-[var(--color-primary-600)]"
                aria-label="Etiquetas"
              >
                🏷
              </button>
              <button
                type="button"
                onClick={onCyclePriority}
                className="h-9 px-3 rounded-full border border-[var(--color-border)] text-xs font-semibold hover:border-[var(--color-primary-600)]"
                aria-label="Prioridad"
              >
                {priorityBadge[draft.priority]}
              </button>
              <button
                type="button"
                onClick={onRequestDueDate}
                className="h-9 px-3 rounded-full border border-[var(--color-border)] inline-flex items-center gap-2 hover:border-[var(--color-primary-600)]"
              >
                <CalendarIcon className="h-4 w-4" />
                {dueLabel}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[#736B63] pt-1 flex-wrap gap-2">
            <p>Se guarda automáticamente al salir.</p>
            <button
              type="button"
              onClick={() => {
                hasCommittedRef.current = true
                onCancel()
              }}
              className="text-[var(--color-primary-700)] hover:text-[var(--color-primary-800)] font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
