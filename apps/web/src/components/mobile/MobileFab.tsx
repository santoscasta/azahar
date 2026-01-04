import { useRef, useState } from 'react'
import { useTranslations } from '../../App.js'

interface MobileFabProps {
  isHomeView: boolean
  onTapHome: () => void
  onTapDetail: () => void
  onDropInbox?: () => void
  currentLabel?: string
  currentIcon?: string
  onDropCurrent?: () => void
}

export default function MobileFab({
  isHomeView,
  onTapHome,
  onTapDetail,
  onDropInbox,
  currentLabel,
  currentIcon,
  onDropCurrent,
}: MobileFabProps) {
  const { t } = useTranslations()
  const [isDragging, setIsDragging] = useState(false)
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const [activeTarget, setActiveTarget] = useState<'inbox' | 'cancel' | 'current' | null>(null)
  const dragStateRef = useRef<{
    startX: number
    startY: number
    offsetX: number
    offsetY: number
    active: boolean
  } | null>(null)
  const suppressClickRef = useRef(false)
  const inboxTargetRef = useRef<HTMLDivElement | null>(null)
  const currentTargetRef = useRef<HTMLDivElement | null>(null)
  const cancelTargetRef = useRef<HTMLDivElement | null>(null)

  const handleTap = () => {
    if (isHomeView) {
      onTapHome()
    } else {
      onTapDetail()
    }
  }

  const resolveTarget = (x: number, y: number) => {
    const inbox = inboxTargetRef.current?.getBoundingClientRect()
    const current = currentTargetRef.current?.getBoundingClientRect()
    const cancel = cancelTargetRef.current?.getBoundingClientRect()
    const inInbox =
      inbox && x >= inbox.left && x <= inbox.right && y >= inbox.top && y <= inbox.bottom
    const inCurrent =
      current && x >= current.left && x <= current.right && y >= current.top && y <= current.bottom
    const inCancel =
      cancel && x >= cancel.left && x <= cancel.right && y >= cancel.top && y <= cancel.bottom
    if (inCancel) return 'cancel'
    if (inCurrent) return 'current'
    if (inInbox) return 'inbox'
    return null
  }

  const cleanupDrag = () => {
    setIsDragging(false)
    setDragPosition(null)
    setActiveTarget(null)
    dragStateRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragStateRef.current) return
    const state = dragStateRef.current
    const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY)
    if (!state.active) {
      if (distance < 6) return
      state.active = true
      suppressClickRef.current = true
      setIsDragging(true)
    }
    setDragPosition({
      x: event.clientX - state.offsetX,
      y: event.clientY - state.offsetY,
    })
    const target = resolveTarget(event.clientX, event.clientY)
    setActiveTarget(target)
  }

  const handlePointerUp = (event: PointerEvent) => {
    if (!dragStateRef.current) {
      cleanupDrag()
      return
    }
    const state = dragStateRef.current
    if (!state.active) {
      cleanupDrag()
      return
    }
    const target = resolveTarget(event.clientX, event.clientY)
    if (target === 'cancel') {
      cleanupDrag()
      return
    }
    if (target === 'current' && onDropCurrent) {
      onDropCurrent()
      cleanupDrag()
      return
    }
    if (target === 'inbox' && onDropInbox) {
      onDropInbox()
    } else {
      handleTap()
    }
    cleanupDrag()
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      active: false,
    }
    suppressClickRef.current = false
    setDragPosition({ x: rect.left, y: rect.top })
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    handleTap()
  }

  return (
    <>
      {isDragging && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute bottom-24 left-6 flex flex-col items-center gap-2">
            <div
              ref={inboxTargetRef}
              className={`h-12 w-12 rounded-full border flex items-center justify-center text-lg ${
                activeTarget === 'inbox'
                  ? 'border-[var(--color-action-500)] bg-[var(--color-accent-100)] text-[var(--color-action-500)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              📥
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{t('view.inbox')}</span>
          </div>
          {currentLabel && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div
                ref={currentTargetRef}
                className={`h-12 w-12 rounded-full border flex items-center justify-center text-lg ${
                  activeTarget === 'current'
                    ? 'border-[var(--color-action-500)] bg-[var(--color-accent-100)] text-[var(--color-action-500)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                }`}
              >
                {currentIcon || '📍'}
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">{currentLabel}</span>
            </div>
          )}
          <div className="absolute bottom-24 right-6 flex flex-col items-center gap-2">
            <div
              ref={cancelTargetRef}
              className={`h-12 w-12 rounded-full border flex items-center justify-center text-lg ${
                activeTarget === 'cancel'
                  ? 'border-[var(--color-danger-500)] bg-[var(--color-danger-100)] text-[var(--color-danger-500)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)]'
              }`}
            >
              ✕
            </div>
            <span className="text-xs text-[var(--color-text-muted)]">{t('actions.cancel')}</span>
          </div>
        </div>
      )}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        className={`fixed h-14 w-14 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-3xl flex items-center justify-center transition ${
          isDragging ? 'z-50 shadow-lg touch-none' : 'bottom-8 right-6 z-30'
        }`}
        style={
          isDragging && dragPosition
            ? { left: dragPosition.x, top: dragPosition.y }
            : undefined
        }
        aria-label="Crear tarea"
      >
        +
      </button>
    </>
  )
}
