import type { ReactNode, RefObject } from 'react'
import type { Area, Project } from '../../lib/supabase.js'
import type { ActiveFilterDescriptor } from '../../pages/tasksSelectors.js'
import MobileHome from './MobileHome.js'
import MobileSearchBar from './MobileSearchBar.js'
import MobileHeader from './MobileHeader.js'
import ActiveFilterChips from '../tasks/ActiveFilterChips.js'
import ErrorBanner from '../tasks/ErrorBanner.js'

interface MobileTasksPaneProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  onSearchBlur: () => void
  onSearchClear: () => void
  searchInputRef: RefObject<HTMLInputElement>
  onBack: () => void
  isProjectView: boolean
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
  renderTaskBoard: () => ReactNode
  renderDraftCard?: () => ReactNode
  showDraft: boolean
  onOpenSettings: () => void
  pendingSync: boolean
  showMobileHomeSettings?: boolean
}

export default function MobileTasksPane({
  searchQuery,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchClear,
  searchInputRef,
  onBack,
  isProjectView,
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
  renderTaskBoard,
  renderDraftCard,
  showDraft,
  onOpenSettings,
  pendingSync,
  showMobileHomeSettings = false,
}: MobileTasksPaneProps) {
  return (
    <MobileHome
      renderSearch={() => (
        <MobileSearchBar
          value={searchQuery}
          inputRef={searchInputRef}
          onFocus={onSearchFocus}
          onClick={showMobileHomeSettings ? onOpenSettings : undefined}
          onBlur={onSearchBlur}
          onChange={onSearchChange}
          onClear={onSearchClear}
        />
      )}
      renderHeader={() => (
        <MobileHeader
          onBack={onBack}
          isProjectView={isProjectView}
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
          <ErrorBanner message={errorMessage} />
          {pendingSync && <ErrorBanner message="Hay cambios pendientes por sincronizar." />}
        </>
      )}
      renderTaskBoard={renderTaskBoard}
      renderDraftCard={renderDraftCard}
      showDraft={showDraft}
      showSettingsInSearch={showMobileHomeSettings}
    />
  )
}
