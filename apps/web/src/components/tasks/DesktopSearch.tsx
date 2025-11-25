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
      <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#736B63]">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por título, notas o proyecto..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-[var(--color-primary-100)] border border-[var(--color-border)] text-sm text-[#2D2520] placeholder-[#C4BDB5] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4BDB5] hover:text-[#736B63]"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-3 z-30">
          <div className="bg-white rounded-3xl border border-[var(--color-border)] overflow-hidden shadow-[0_16px_30px_rgba(45,37,32,0.12)]">
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-[#736B63] border-b border-[var(--color-border)] bg-[#FFFCF7]">
              Coincidencias ({suggestions.length})
            </div>
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[#736B63]">
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
                        <p className="text-sm font-medium text-[#2D2520]">{task.title}</p>
                        <p className="text-xs text-[#736B63]">
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
