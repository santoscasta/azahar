import type { ActiveFilterDescriptor } from '../../pages/tasksSelectors.js'
import { getSoftLabelStyle } from '../../lib/colorUtils.js'

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
        <span
          key={filter.key}
          className="az-pill"
          style={filter.type === 'label' ? getSoftLabelStyle(filter.color) : undefined}
        >
          {filter.label}
          <button
            type="button"
            onClick={() => onRemove(filter)}
            className="text-xs font-bold"
            style={{ color: 'var(--color-primary-600)' }}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  )
}
