import type { Area, Project } from '../../lib/supabase.js'
import settingsIcon from '../../assets/icons/settings.svg'
import { useTranslations } from '../../App.js'

interface MobileHeaderProps {
  onBack: () => void
  isProjectView: boolean
  selectedArea: Area | null
  mobileProject: Project | null
  quickViewLabel: string
  friendlyToday: string
  filteredTaskCount: number
  completedCount: number
  projectsInArea: number
  onOpenSettings: () => void
}

export default function MobileHeader({
  onBack,
  isProjectView,
  selectedArea,
  mobileProject,
  quickViewLabel,
  friendlyToday,
  filteredTaskCount,
  completedCount,
  projectsInArea,
  onOpenSettings,
}: MobileHeaderProps) {
  const { t } = useTranslations()
  return (
    <header className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-2xl text-slate-500 pl-1"
          aria-label="Volver"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {isProjectView ? t('mobile.project') : selectedArea ? t('mobile.area') : t('mobile.view')}
          </p>
          <p className="text-2xl font-semibold text-slate-800">
            {isProjectView
              ? mobileProject?.name || 'Proyecto'
              : selectedArea
                ? selectedArea.name
                : quickViewLabel}
          </p>
          <p className={`text-sm text-slate-500 ${isProjectView ? '' : 'capitalize'}`}>
            {isProjectView
              ? `${filteredTaskCount} ${t('mobile.projectTasks')}`
              : selectedArea
                ? `${projectsInArea} ${t('mobile.areaProjects')}`
                : friendlyToday || t('mobile.today')}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-full border border-[var(--color-border)] text-sm text-slate-500 hover:bg-[color-mix(in_srgb,var(--color-border)_40%,var(--color-bg)_60%)]"
          aria-label="Ajustes"
        >
          <img src={settingsIcon} alt="" className="h-4 w-4" />
        </button>
      </div>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow px-5 py-4 space-y-2">
        {isProjectView ? (
          <>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{t('mobile.pending')}: {filteredTaskCount - completedCount}</span>
              <span>
                {completedCount}/{filteredTaskCount} {t('mobile.completed')}
              </span>
            </div>
          </>
        ) : selectedArea ? (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">{t('mobile.area')}</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTaskCount} {t('mobile.completed')}
            </p>
            <p className="text-sm text-slate-500">
              {projectsInArea} {t('mobile.areaProjects')}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">En esta vista</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTaskCount} {t('mobile.completed')}
            </p>
          <p className="text-sm text-slate-500">
            {mobileProject ? `${t('mobile.project')}: ${mobileProject.name}` : t('mobile.view')}
          </p>
          </>
        )}
      </div>
    </header>
  )
}
