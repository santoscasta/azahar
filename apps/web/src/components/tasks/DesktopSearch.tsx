import type { Task, Project } from '../../lib/supabase.js'

interface DesktopSearchProps {
  searchQuery: string
  suggestions: Task[]
  projects: Project[]
  showSuggestions: boolean
  onQueryChange: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onClear: () => void
  onSelectSuggestion: (task: Task) => void
}

export default function DesktopSearch({
  searchQuery,
  suggestions,
  projects,
  showSuggestions,
  onQueryChange,
  onFocus,
  onBlur,
  onClear,
  onSelectSuggestion,
}: DesktopSearchProps) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-100)] text-lg text-[var(--on-surface)]">
          🔍
        </span>
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por título, notas o proyecto..."
            className="w-full rounded-xl border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary-600)] focus:ring-1 focus:ring-[var(--color-primary-200)] outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClear}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]">
          <span className="text-xs">⌘</span>
          <span>K</span>
        </span>
      </div>
      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-3 z-30">
          <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-md)]">
            <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              Coincidencias ({suggestions.length})
            </div>
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                Sigue escribiendo para encontrar tareas que coincidan con "{searchQuery}"
              </div>
            ) : (
              <ul className="max-h-72 overflow-auto">
                {suggestions.map(task => {
                  const project = projects.find(project => project.id === task.project_id)
                  return (
                    <li key={`suggestion-${task.id}`}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => onSelectSuggestion(task)}
                        className="w-full px-4 py-3 text-left hover:bg-[var(--color-primary-100)]"
                      >
                        <p className="text-sm font-medium text-[var(--on-surface)]">{task.title}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {project ? `Proyecto: ${project.name}` : 'Sin proyecto'}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
