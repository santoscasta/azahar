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
      <div className="az-card az-card--flat p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por título, notas o proyecto..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />
          {searchQuery && (
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
      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-3 z-30 drop-shadow-2xl">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
              Coincidencias ({suggestions.length})
            </div>
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
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
                        className="w-full px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <p className="text-sm font-medium text-slate-800">{task.title}</p>
                        <p className="text-xs text-slate-400">
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
