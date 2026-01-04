import type { Area, Project } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface MobileHeaderProps {
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
  isFocusMode: boolean
  onToggleFocus: () => void
}

export default function MobileHeader({
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
  isFocusMode,
  onToggleFocus,
}: MobileHeaderProps) {
  const { t } = useTranslations()
  return (
    <header className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl text-[var(--on-surface)]"
          aria-label={t('actions.back')}
        >
          ←
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleFocus}
            aria-pressed={isFocusMode}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-[var(--radius-card)] border transition-colors ${isFocusMode
              ? 'bg-[var(--color-primary-600)] text-[var(--on-primary)] border-[var(--color-primary-600)]'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
            aria-label={t('actions.focusMode')}
          >
            🎯
          </button>
          <button
            type="button"
            onClick={onToggleSelect}
            aria-pressed={isSelecting}
            className={`min-h-[44px] px-3 py-1 rounded-[var(--radius-card)] border text-sm font-semibold transition-colors ${isSelecting
              ? 'bg-[var(--color-primary-600)] text-[var(--on-primary)] border-[var(--color-primary-600)]'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
          >
            {isSelecting ? t('multiSelect.done') : t('multiSelect.select')}
          </button>
        </div>
      </div>
      <div className="relative">
        <div className="flex-1 text-center mb-4">
          <p className="az-meta text-[var(--color-text-muted)]">
            {isProjectView ? t('mobile.project') : selectedArea ? t('mobile.area') : isSearchView ? t('view.search') : t('mobile.view')}
          </p>
          <p className="az-h1 text-[var(--on-surface)]">
            {isProjectView
              ? mobileProject?.name || t('mobile.project')
              : selectedArea
                ? selectedArea.name
                : quickViewLabel}
          </p>
          <p className={`az-body text-[var(--color-text-muted)] ${isProjectView ? '' : 'capitalize'}`}>
            {isProjectView
              ? `${filteredTaskCount} ${t('mobile.projectTasks')}`
              : selectedArea
                ? `${projectsInArea} ${t('mobile.areaProjects')}`
                : isSearchView
                  ? t('view.desc.search')
                  : friendlyToday || t('mobile.today')}
          </p>
        </div>
        {(isProjectView || selectedArea) && (
          <div className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 space-y-2">
            {isProjectView ? (
              <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                <span>{t('mobile.pending')}: {filteredTaskCount - completedCount}</span>
                <span>
                  {completedCount}/{filteredTaskCount} {t('mobile.completed')}
                </span>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('mobile.area')}</p>
                <p className="text-lg font-semibold text-[var(--on-surface)]">
                  {completedCount}/{filteredTaskCount} {t('mobile.completed')}
                </p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {projectsInArea} {t('mobile.areaProjects')}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
