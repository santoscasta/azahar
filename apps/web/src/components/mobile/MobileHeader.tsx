import type { Area, Project } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface MobileHeaderProps {
  onBack: () => void
  isProjectView: boolean
  isSearchView: boolean
  selectedArea: Area | null
  mobileProject: Project | null
  quickViewLabel: string
  friendlyToday: string
  filteredTaskCount: number
  completedCount: number
  projectsInArea: number
}

export default function MobileHeader({
  onBack,
  isProjectView,
  isSearchView,
  selectedArea,
  mobileProject,
  quickViewLabel,
  friendlyToday,
  filteredTaskCount,
  completedCount,
  projectsInArea,
}: MobileHeaderProps) {
  const { t } = useTranslations()
  return (
    <header className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl text-[var(--on-surface)]"
          aria-label="Volver"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-[var(--color-text-muted)]">
            {isProjectView ? t('mobile.project') : selectedArea ? t('mobile.area') : isSearchView ? t('view.search') : t('mobile.view')}
          </p>
          <p className="text-2xl font-semibold text-[var(--on-surface)]">
            {isProjectView
              ? mobileProject?.name || 'Proyecto'
              : selectedArea
                ? selectedArea.name
                : quickViewLabel}
          </p>
          <p className={`text-sm text-[var(--color-text-muted)] ${isProjectView ? '' : 'capitalize'}`}>
            {isProjectView
              ? `${filteredTaskCount} ${t('mobile.projectTasks')}`
              : selectedArea
                ? `${projectsInArea} ${t('mobile.areaProjects')}`
                : isSearchView
                  ? t('view.desc.search')
                  : friendlyToday || t('mobile.today')}
          </p>
        </div>
      </div>
      {(isProjectView || selectedArea) && (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-6 py-4 space-y-2">
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
    </header>
  )
}
