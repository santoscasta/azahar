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
          className="w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] text-sm font-semibold text-slate-600"
        >
          Mostrar más
        </button>
      )}
    </div>
  )
}
