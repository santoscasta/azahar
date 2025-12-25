import type { RefObject } from 'react'

interface MobileSearchBarProps {
  value: string
  inputRef: RefObject<HTMLInputElement>
  onFocus: () => void
  onBlur: () => void
  onChange: (value: string) => void
  onClear: () => void
  onClick?: () => void
}

export default function MobileSearchBar({
  value,
  inputRef,
  onFocus,
  onBlur,
  onChange,
  onClear,
  onClick,
}: MobileSearchBarProps) {
  return (
    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow px-4 py-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={onFocus}
          onClick={onClick}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar tareas..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface)]"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] hover:text-[var(--color-primary-700)]"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
