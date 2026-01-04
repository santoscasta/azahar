import type { ActiveFilterDescriptor } from '../../pages/tasksSelectors.js'

interface ActiveFilterChipsProps {
  filters: ActiveFilterDescriptor[]
  compact?: boolean
  onRemove: (filter: ActiveFilterDescriptor) => void
}

export default function ActiveFilterChips({ filters, compact = false, onRemove }: ActiveFilterChipsProps) {
  if (!filters.length) {
    return null
  }
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? 'px-1' : ''}`}>
      {filters.map(filter => (
        <button
          key={filter.key}
          type="button"
          onClick={() => onRemove(filter)}
          className={`az-pill ${compact ? 'min-h-[44px] px-3 py-2' : ''}`}
        >
          <span>{filter.label}</span>
          <span aria-hidden style={{ color: 'var(--color-primary-600)' }}>✕</span>
        </button>
      ))}
    </div>
  )
}
