import { useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import type { Area, Project, Task } from '../../lib/supabase.js'
import type { QuickViewId } from '../../pages/tasksSelectors.js'
import searchIcon from '../../assets/icons/search.svg'
import AreaIcon from '../icons/AreaIcon.js'
import ProjectIcon from '../icons/ProjectIcon.js'
import { useTranslations } from '../../App.js'
import MobileQuickFindSuggestions from './MobileQuickFindSuggestions.js'

interface DraftArea {
  name: string
}

interface DraftProject {
  name: string
  areaId: string | null
}

interface QuickListItem {
  id: QuickViewId
  label: string
  icon: string
}

interface MobileOverviewProps {
  showDraftCard: boolean
  renderDraftCard?: () => ReactNode
  searchQuery: string
  searchInputRef?: RefObject<HTMLInputElement>
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  showSuggestions: boolean
  suggestions: Task[]
  onSelectSuggestion: (task: Task) => void
  quickLists: readonly QuickListItem[]
  quickViewStats: Record<QuickViewId, number>
  onSelectQuickView: (view: QuickViewId) => void
  areas: Area[]
  areaDraft: DraftArea | null
  areaInputRef?: (element: HTMLInputElement | null) => void
  onAreaDraftChange: (value: string) => void
  onAreaDraftBlur: (value: string) => void
  onCancelAreaDraft: () => void
  onSaveAreaDraft: () => void
  onSelectArea: (areaId: string) => void
  projects: Project[]
  projectDraft: DraftProject | null
  projectInputRef?: (element: HTMLInputElement | null) => void
  onProjectDraftChange: (value: string) => void
  onProjectDraftBlur: (value: string) => void
  onCancelProjectDraft: () => void
  onSaveProjectDraft: () => void
  onSelectProject: (projectId: string) => void
  onOpenSettings: () => void
  onOpenHelp: () => void
}

export function MobileOverview({
  showDraftCard,
  renderDraftCard,
  searchQuery,
  searchInputRef,
  onSearchChange,
  onSearchFocus,
  showSuggestions,
  suggestions,
  onSelectSuggestion,
  quickLists,
  quickViewStats,
  onSelectQuickView,
  areas,
  areaDraft,
  areaInputRef,
  onAreaDraftChange,
  onAreaDraftBlur,
  onCancelAreaDraft,
  onSaveAreaDraft,
  onSelectArea,
  projects,
  projectDraft,
  projectInputRef,
  onProjectDraftChange,
  onProjectDraftBlur,
  onCancelProjectDraft,
  onSaveProjectDraft,
  onSelectProject,
  onOpenSettings,
  onOpenHelp,
}: MobileOverviewProps) {
  const { t } = useTranslations()
  const [showAllAreas, setShowAllAreas] = useState(false)
  const [expandedProjectGroups, setExpandedProjectGroups] = useState<Record<string, boolean>>({})
  const visibleAreas = showAllAreas ? areas : areas.slice(0, 4)
  const projectsByArea = areas.map(area => ({
    id: area.id,
    name: area.name,
    projects: projects.filter(project => project.area_id === area.id),
  }))
  const unassignedProjects = projects.filter(project => !project.area_id)

  const toggleProjectGroup = (groupId: string) => {
    setExpandedProjectGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }
  return (
    <div className="space-y-6 pb-28">
      {showDraftCard && renderDraftCard ? renderDraftCard() : null}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]">
          <img src={searchIcon} alt="" className="h-4 w-4" />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onFocus={onSearchFocus}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('mobile.search.placeholder')}
          className="w-full min-h-[44px] pl-10 pr-14 py-3 rounded-[var(--radius-container)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface)]"
        />
        {showSuggestions && (
          <MobileQuickFindSuggestions
            query={searchQuery}
            suggestions={suggestions}
            projects={projects}
            onSelect={onSelectSuggestion}
          />
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="min-h-[44px] flex-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--on-surface)] flex items-center justify-center gap-2"
        >
          ⚙ <span>{t('settings.title')}</span>
        </button>
        <button
          type="button"
          onClick={onOpenHelp}
          className="min-h-[44px] flex-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-semibold text-[var(--color-text-muted)] flex items-center justify-center gap-2"
        >
          ❓ <span>{t('sidebar.help')}</span>
        </button>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] divide-y divide-[var(--color-divider)]">
        {quickLists.map(view => (
          <button
            key={`mobile-${view.id}`}
            onClick={() => onSelectQuickView(view.id)}
            className="w-full min-h-[52px] flex items-center justify-between px-4 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="h-11 w-11 rounded-[var(--radius-card)] bg-[var(--color-primary-100)] flex items-center justify-center">
                <img src={view.icon} alt="" className="h-6 w-6" />
              </span>
              <span className="text-base font-medium text-[var(--on-surface)]">{view.label}</span>
            </span>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              {quickViewStats[view.id] > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-2 text-[11px] font-semibold text-[var(--color-accent-500)]">
                  {quickViewStats[view.id]}
                </span>
              )}
              <span className="text-[var(--on-surface)]">›</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] p-4 space-y-3">
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-2">
            <AreaIcon className="h-4 w-4" />
            <span className="sr-only">{t('sidebar.areas')}</span>
          </span>
          {areas.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllAreas(prev => !prev)}
              className="min-h-[44px] px-3 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] text-xs text-[var(--color-text-muted)]"
            >
              {showAllAreas ? t('actions.hide') : t('actions.showAll')}
            </button>
          )}
        </div>
        {areaDraft && (
          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3 space-y-2">
            <input
              ref={areaInputRef}
              type="text"
              value={areaDraft.name}
              onChange={(event) => onAreaDraftChange(event.target.value)}
              onBlur={(event) => onAreaDraftBlur(event.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-container)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none bg-[var(--color-surface)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelAreaDraft}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-xs text-[var(--on-surface)]"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={onSaveAreaDraft}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-xs"
              >
                {t('actions.ok')}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {visibleAreas.map(area => (
            <button
              key={`mobile-area-${area.id}`}
              className="w-full min-h-[48px] flex items-center justify-between px-3 py-2 rounded-[var(--radius-card)] border border-transparent hover:border-[var(--color-border)]"
              onClick={() => onSelectArea(area.id)}
            >
              <span className="flex items-center gap-2 text-sm text-[var(--on-surface)]">
                <AreaIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                {area.name}
              </span>
              <span className="text-[var(--color-text-muted)]">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] p-4 space-y-3">
        <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-2">
            <ProjectIcon className="h-4 w-4" />
            <span className="sr-only">{t('sidebar.projects')}</span>
          </span>
        </div>
        {projectDraft && (
          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] p-3 space-y-2">
            <input
              ref={projectInputRef}
              type="text"
              value={projectDraft.name}
              onChange={(event) => onProjectDraftChange(event.target.value)}
              onBlur={(event) => onProjectDraftBlur(event.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-container)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] outline-none bg-[var(--color-surface)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelProjectDraft}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-xs text-[var(--on-surface)]"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={onSaveProjectDraft}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-xs"
              >
                {t('actions.ok')}
              </button>
            </div>
          </div>
        )}
        <div className="space-y-3">
          {projectsByArea
            .filter(group => group.projects.length > 0)
            .map(group => {
              const isExpanded = expandedProjectGroups[group.id] ?? false
              return (
                <div key={`projects-${group.id}`} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleProjectGroup(group.id)}
                    aria-expanded={isExpanded}
                    className="w-full min-h-[44px] flex items-center justify-between px-2 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--on-surface)]"
                  >
                    <span>{group.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{group.projects.length}</span>
                  </button>
                  {isExpanded && (
                    <div className="space-y-2 pl-2">
                      {group.projects.map(project => (
                        <button
                          key={`mobile-project-${project.id}`}
                          className="w-full min-h-[48px] flex items-center justify-between px-3 py-2 rounded-[var(--radius-card)] border border-transparent hover:border-[var(--color-border)]"
                          onClick={() => onSelectProject(project.id)}
                        >
                          <span className="flex items-center gap-2 text-sm text-[var(--on-surface)]">
                            <ProjectIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                            {project.name}
                          </span>
                          <span className="text-[var(--color-text-muted)]">›</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          {unassignedProjects.length > 0 && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => toggleProjectGroup('none')}
                aria-expanded={expandedProjectGroups.none ?? false}
                className="w-full min-h-[44px] flex items-center justify-between px-2 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--on-surface)]"
              >
                <span>{t('project.new.area.none')}</span>
                <span className="text-xs text-[var(--color-text-muted)]">{unassignedProjects.length}</span>
              </button>
              {(expandedProjectGroups.none ?? false) && (
                <div className="space-y-2 pl-2">
                  {unassignedProjects.map(project => (
                    <button
                      key={`mobile-project-${project.id}`}
                      className="w-full min-h-[48px] flex items-center justify-between px-3 py-2 rounded-[var(--radius-card)] border border-transparent hover:border-[var(--color-border)]"
                      onClick={() => onSelectProject(project.id)}
                    >
                      <span className="flex items-center gap-2 text-sm text-[var(--on-surface)]">
                        <ProjectIcon className="h-4 w-4 text-[var(--color-text-muted)]" />
                        {project.name}
                      </span>
                      <span className="text-[var(--color-text-muted)]">›</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default MobileOverview
