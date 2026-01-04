import type { Task, Project } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface MobileQuickFindSuggestionsProps {
  query: string
  suggestions: Task[]
  projects: Project[]
  onSelect: (task: Task) => void
}

export default function MobileQuickFindSuggestions({
  query,
  suggestions,
  projects,
  onSelect,
}: MobileQuickFindSuggestionsProps) {
  const { t } = useTranslations()

  if (!query) {
    return null
  }

  return (
    <div className="mt-3 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
        {t('search.suggestions.title')} ({suggestions.length})
      </div>
      {suggestions.length === 0 ? (
        <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
          {t('search.suggestions.empty')} "{query}"
        </div>
      ) : (
        <ul className="max-h-72 overflow-auto">
          {suggestions.map(task => {
            const project = projects.find(project => project.id === task.project_id)
            return (
              <li key={`mobile-suggestion-${task.id}`}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSelect(task)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--color-primary-100)]"
                >
                  <p className="text-sm font-medium text-[var(--on-surface)]">{task.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {project ? `${t('search.suggestions.project')}: ${project.name}` : t('search.suggestions.noProject')}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
