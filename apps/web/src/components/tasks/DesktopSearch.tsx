import type { RefObject } from 'react'
import type { Task, Project } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface DesktopSearchProps {
  searchQuery: string
  suggestions: Task[]
  projects: Project[]
  showSuggestions: boolean
  inputRef?: RefObject<HTMLInputElement>
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
  inputRef,
  onQueryChange,
  onFocus,
  onBlur,
  onClear,
  onSelectSuggestion,
}: DesktopSearchProps) {
  const { t } = useTranslations()
  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 ">
        <span className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-primary-100)] text-lg text-[var(--on-surface)]">
          🔍
        </span>
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            ref={inputRef}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full rounded-[var(--radius-card)] border border-transparent bg-transparent px-3 py-2 text-sm font-medium text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:border-[var(--color-primary-600)] focus:ring-1 focus:ring-[var(--color-primary-200)] outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={onClear}
              className="absolute right-0 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-text-muted)]"
              aria-label={t('search.clear')}
            >
              ✕
            </button>
          )}
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] px-3 py-1 text-[11px] font-semibold text-[var(--color-text-muted)] bg-[var(--color-surface-elevated)]">
          <span className="text-xs">⌘</span>
          <span>K</span>
        </span>
      </div>
      {showSuggestions && (
        <div className="absolute left-0 right-0 mt-3 z-30">
          <div className="bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] overflow-hidden ">
            <div className="px-4 py-2 text-xs font-semibold text-[var(--color-text-muted)] border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              {t('search.suggestions.title')} ({suggestions.length})
            </div>
            {suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                {t('search.suggestions.empty')} "{searchQuery}"
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
                          {project ? `${t('search.suggestions.project')}: ${project.name}` : t('search.suggestions.noProject')}
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
