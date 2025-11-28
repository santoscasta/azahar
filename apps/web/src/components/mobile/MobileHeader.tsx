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
    <header className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-2xl text-[var(--on-surface)] pl-1"
          aria-label="Volver"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-wide text-[#C4BDB5] dark:text-[#E5E7EF]">
            {isProjectView ? t('mobile.project') : selectedArea ? t('mobile.area') : isSearchView ? t('view.search') : t('mobile.view')}
          </p>
          <p className="text-2xl font-semibold text-[var(--on-surface)]">
            {isProjectView
              ? mobileProject?.name || 'Proyecto'
              : selectedArea
                ? selectedArea.name
                : quickViewLabel}
          </p>
          <p className={`text-sm text-[#736B63] dark:text-[#E5E7EF] ${isProjectView ? '' : 'capitalize'}`}>
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
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-5 py-4 space-y-2">
          {isProjectView ? (
            <div className="flex items-center justify-between text-sm text-[#736B63] dark:text-[#E5E7EF]">
              <span>{t('mobile.pending')}: {filteredTaskCount - completedCount}</span>
              <span>
                {completedCount}/{filteredTaskCount} {t('mobile.completed')}
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-wide text-[#C4BDB5] dark:text-[#E5E7EF]">{t('mobile.area')}</p>
              <p className="text-lg font-semibold text-[var(--on-surface)]">
                {completedCount}/{filteredTaskCount} {t('mobile.completed')}
              </p>
              <p className="text-sm text-[#736B63] dark:text-[#E5E7EF]">
                {projectsInArea} {t('mobile.areaProjects')}
              </p>
            </>
          )}
        </div>
      )}
    </header>
  )
}
