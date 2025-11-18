import type { RefObject } from 'react'

interface MobileSearchBarProps {
  value: string
  inputRef: RefObject<HTMLInputElement>
  onFocus: () => void
  onBlur: () => void
  onChange: (value: string) => void
  onClear: () => void
}

export default function MobileSearchBar({
  value,
  inputRef,
  onFocus,
  onBlur,
  onChange,
  onClear,
}: MobileSearchBarProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow px-4 py-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar tareas..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
