import type { ReactNode, RefObject } from 'react'
import type { Area, Project, Task } from '../../lib/supabase.js'
import type { ActiveFilterDescriptor } from '../../pages/tasksSelectors.js'
import MobileHome from './MobileHome.js'
import MobileSearchBar from './MobileSearchBar.js'
import MobileHeader from './MobileHeader.js'
import ActiveFilterChips from '../tasks/ActiveFilterChips.js'
import ErrorBanner from '../tasks/ErrorBanner.js'
import StatusBanner from '../tasks/StatusBanner.js'
import MobileQuickFindSuggestions from './MobileQuickFindSuggestions.js'
import { useTranslations } from '../../App.js'

interface MobileTasksPaneProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
  onSearchClear: () => void
  searchInputRef: RefObject<HTMLInputElement>
  showSuggestions: boolean
  suggestions: Task[]
  projects: Project[]
  onSelectSuggestion: (task: Task) => void
  onBack: () => void
  onToggleSelect: () => void
  isSelecting: boolean
  isProjectView: boolean
  isSearchView: boolean
  selectedArea: Area | null
  mobileProject: Project | null
  quickViewLabel: string
  friendlyToday: string
  filteredTaskCount: number
  completedCount: number
  projectsInArea: number
  filters: ActiveFilterDescriptor[]
  compactFilters: boolean
  onRemoveFilter: (filter: ActiveFilterDescriptor) => void
  errorMessage: string
  successMessage: string
  retryLabel?: string
  onRetry?: () => void
  renderTaskBoard: () => ReactNode
  renderDraftCard?: () => ReactNode
  showDraft: boolean
  pendingSync: boolean
}

export default function MobileTasksPane({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchClear,
  searchInputRef,
  showSuggestions,
  suggestions,
  projects,
  onSelectSuggestion,
  onBack,
  onToggleSelect,
  isSelecting,
  isProjectView,
  isSearchView,
  selectedArea,
  mobileProject,
  quickViewLabel,
  friendlyToday,
  filteredTaskCount,
  completedCount,
  projectsInArea,
  filters,
  compactFilters,
  onRemoveFilter,
  errorMessage,
  successMessage,
  retryLabel,
  onRetry,
  renderTaskBoard,
  renderDraftCard,
  showDraft,
  pendingSync,
}: MobileTasksPaneProps) {
  const { t } = useTranslations()
  return (
    <MobileHome
      renderSearch={() => (
        <>
          <MobileSearchBar
            value={searchQuery}
            inputRef={searchInputRef}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onChange={onSearchChange}
            onClear={onSearchClear}
          />
          {showSuggestions && (
            <MobileQuickFindSuggestions
              query={searchQuery}
              suggestions={suggestions}
              projects={projects}
              onSelect={onSelectSuggestion}
            />
          )}
        </>
      )}
      renderHeader={() => (
        <MobileHeader
          onBack={onBack}
          onToggleSelect={onToggleSelect}
          isSelecting={isSelecting}
          isProjectView={isProjectView}
          isSearchView={isSearchView}
          selectedArea={selectedArea}
          mobileProject={mobileProject}
          quickViewLabel={quickViewLabel}
          friendlyToday={friendlyToday}
          filteredTaskCount={filteredTaskCount}
          completedCount={completedCount}
          projectsInArea={projectsInArea}
        />
      )}
      renderFilters={() => (
        <ActiveFilterChips
          filters={filters}
          compact={compactFilters}
          onRemove={onRemoveFilter}
        />
      )}
      renderError={() => (
        <>
          <StatusBanner message={successMessage} />
          <ErrorBanner message={errorMessage} actionLabel={retryLabel} onAction={onRetry} />
          {pendingSync && <ErrorBanner message={t('status.pendingSync')} />}
        </>
      )}
      renderTaskBoard={renderTaskBoard}
      renderDraftCard={renderDraftCard}
      showDraft={showDraft}
    />
  )
}
