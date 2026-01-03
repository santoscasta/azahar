import type { ReactNode } from 'react'

interface MobileTaskBoardProps {
  taskList: ReactNode
  canShowMore: boolean
  onShowMore: () => void
}

export default function MobileTaskBoard({ taskList, canShowMore, onShowMore }: MobileTaskBoardProps) {
  return (
    <div className="space-y-4">
      {taskList}
      {canShowMore && (
        <button
          type="button"
          onClick={onShowMore}
          className="w-full min-h-[44px] px-4 py-3 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]"
        >
          Mostrar más
        </button>
      )}
    </div>
  )
}
