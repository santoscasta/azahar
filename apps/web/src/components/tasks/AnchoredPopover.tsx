import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface AnchoredPopoverProps {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  align?: 'start' | 'center' | 'end'
  offset?: number
  className?: string
  children: ReactNode
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export default function AnchoredPopover({
  open,
  anchorEl,
  onClose,
  align = 'start',
  offset = 12,
  className,
  children,
}: AnchoredPopoverProps) {
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [isReady, setIsReady] = useState(false)

  const updatePosition = useCallback(() => {
    if (!anchorEl || !popoverRef.current || typeof window === 'undefined') {
      return
    }
    if (!anchorEl.isConnected) {
      onClose()
      return
    }
    const anchorRect = anchorEl.getBoundingClientRect()
    const popoverRect = popoverRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const margin = 12

    let left = anchorRect.left
    if (align === 'center') {
      left = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2
    } else if (align === 'end') {
      left = anchorRect.right - popoverRect.width
    }
    left = clamp(left, margin, viewportWidth - popoverRect.width - margin)

    let top = anchorRect.bottom + offset
    const fitsBelow = top + popoverRect.height <= viewportHeight - margin
    if (!fitsBelow && anchorRect.top - popoverRect.height - offset > margin) {
      top = anchorRect.top - popoverRect.height - offset
    }

    setPosition({ top, left })
    setIsReady(true)
  }, [anchorEl, align, offset, onClose])

  useEffect(() => {
    if (!open || !anchorEl || typeof window === 'undefined') {
      return
    }
    setIsReady(false)
    const handleReposition = () => updatePosition()
    const frame = window.requestAnimationFrame(handleReposition)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [open, anchorEl, updatePosition])

  useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open || !anchorEl || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50" onMouseDown={onClose}>
      <div
        ref={popoverRef}
        className={className}
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          opacity: isReady ? 1 : 0,
          pointerEvents: isReady ? 'auto' : 'none',
        }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
