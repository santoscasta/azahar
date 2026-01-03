import { useState } from 'react'
import type { DragEvent } from 'react'

interface ChecklistSheetProps {
  open: boolean
  items: Array<{ id: string; text: string; completed: boolean }>
  onClose: () => void
  onToggle: (itemId: string) => void
  onAdd: (text: string) => void
  onUpdate: (itemId: string, text: string) => void
  onRemove: (itemId: string) => void
  onReorder: (orderedIds: string[]) => void
}

export default function ChecklistSheet({
  open,
  items,
  onClose,
  onToggle,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: ChecklistSheetProps) {
  const [inputValue, setInputValue] = useState('')
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  if (!open) {
    return null
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAdd(inputValue)
    setInputValue('')
  }

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

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, itemId: string) => {
    setDraggingItemId(itemId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', itemId)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>, itemId: string) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDragOverItemId(itemId)
  }

  const handleDragLeave = (itemId: string) => {
    if (dragOverItemId === itemId) {
      setDragOverItemId(null)
    }
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>, itemId: string) => {
    event.preventDefault()
    const sourceId = draggingItemId || event.dataTransfer.getData('text/plain')
    setDraggingItemId(null)
    setDragOverItemId(null)
    if (!sourceId) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY > rect.top + rect.height / 2
    const ids = items.map(item => item.id)
    const reordered = buildReorderedIds(ids, sourceId, itemId, insertAfter)
    if (reordered.join('|') !== ids.join('|')) {
      onReorder(reordered)
    }
  }

  const handleDragEnd = () => {
    setDraggingItemId(null)
    setDragOverItemId(null)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-6 px-4" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-container)] p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-[var(--on-surface)]">Checklist</span>
            <button type="button" onClick={onClose} className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl">
              ✕
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {items.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">Aún no hay elementos.</p>}
            {items.map(item => (
              <div
                key={item.id}
                onDragOver={(event) => handleDragOver(event, item.id)}
                onDragLeave={() => handleDragLeave(item.id)}
                onDrop={(event) => handleDrop(event, item.id)}
                className={`flex items-center gap-3 rounded-[var(--radius-container)] border border-[var(--color-border)] px-3 py-2 ${
                  dragOverItemId === item.id ? 'ring-1 ring-[var(--color-primary-200)]' : ''
                } ${draggingItemId === item.id ? 'opacity-60' : ''}`}
              >
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  onDragEnd={handleDragEnd}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing"
                  aria-label="Reordenar"
                >
                  ≡
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <span
                    className={`h-6 w-6 rounded-full border flex items-center justify-center text-sm ${
                      item.completed
                        ? 'bg-[var(--color-action-500)] border-[var(--color-action-500)] text-[var(--on-primary)]'
                        : 'border-[var(--color-border)] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(event) => onUpdate(item.id, event.target.value)}
                  className="flex-1 border-none bg-transparent text-sm text-[var(--on-surface)] outline-none"
                />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
                aria-label="Eliminar elemento"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Nueva tarea"
              className="flex-1 rounded-[var(--radius-container)] border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] bg-[var(--color-surface-elevated)] outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
            />
          <button
            type="submit"
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-60"
            disabled={!inputValue.trim()}
          >
            Añadir
          </button>
        </form>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold"
          >
            Listo
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
