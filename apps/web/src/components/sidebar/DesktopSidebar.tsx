import type { QuickViewId } from '../../pages/tasksSelectors.js'
import type { Project, Area } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'
import settingsIcon from '../../assets/icons/settings.svg'
import AzaharLogo from './AzaharLogo.js'

interface StatsMap extends Map<string, { total: number; overdue: number }> {}

interface QuickListItem {
  id: QuickViewId
  label: string
  icon: string
  accent: string
}

export interface DesktopSidebarProps {
  filteredTaskCount: number
  completedCount: number
  quickLists: readonly QuickListItem[]
  quickViewStats: Record<QuickViewId, number>
  quickViewOverdueStats: Record<QuickViewId, number>
  projects: Project[]
  areas: Area[]
  projectStats: StatsMap
  areaStats: StatsMap
  selectedProjectId: string | null
  selectedAreaId: string | null
  activeQuickView: QuickViewId
  showNewListMenu: boolean
  onSelectQuickView: (view: QuickViewId) => void
  onSelectArea: (areaId: string) => void
  onSelectProject: (projectId: string) => void
  onToggleNewListMenu: () => void
  onCreateProject: () => void
  onCreateArea: () => void
  onOpenSettings: () => void
}

function CountPill({ total, overdue }: { total?: number; overdue?: number }) {
  if (!total && !overdue) return null
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold">
      {overdue ? <span className="text-[#FF7A33]">{overdue}</span> : null}
      {total ? <span className="text-[#736B63]">{total}</span> : null}
    </div>
  )
}

export function DesktopSidebar({
  filteredTaskCount: _filteredTaskCount,
  completedCount: _completedCount,
  quickLists,
  quickViewStats,
  quickViewOverdueStats,
  projects,
  areas,
  projectStats,
  areaStats,
  selectedProjectId,
  selectedAreaId,
  activeQuickView,
  showNewListMenu,
  onSelectQuickView,
  onSelectArea,
  onSelectProject,
  onToggleNewListMenu,
  onCreateProject,
  onCreateArea,
  onOpenSettings,
}: DesktopSidebarProps) {
  const { t } = useTranslations()
  const standaloneProjects = projects.filter(project => !project.area_id)

  return (
    <aside className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_50px_rgba(45,37,32,0.06)] flex flex-col h-full text-[#2D2520]">
      <div className="px-5 pt-6 pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AzaharLogo />
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#736B63]">{t('sidebar.brand')}</p>
            <p className="text-lg font-semibold">{t('sidebar.workspace')}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 mt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#736B63] mb-2">{t('sidebar.focus')}</p>
          <ul className="space-y-1">
            {quickLists.map(view => {
              const total = quickViewStats[view.id]
              const overdue = quickViewOverdueStats[view.id]
              const isActive = !selectedProjectId && !selectedAreaId && activeQuickView === view.id
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    onClick={() => onSelectQuickView(view.id)}
                    className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-[var(--color-primary-600)] text-white shadow-md'
                        : 'text-[#2D2520] hover:bg-[var(--color-primary-100)]'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8 rounded-xl bg-[var(--color-primary-100)] flex items-center justify-center">
                        <img src={view.icon} alt="" className="h-5 w-5" />
                      </span>
                      {view.label}
                    </span>
                    <CountPill total={total} overdue={overdue} />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#736B63] mb-2">{t('sidebar.areas')}</p>
          <div className="space-y-3">
            {areas.length === 0 && <p className="text-sm text-[#736B63]">{t('sidebar.emptyAreas')}</p>}
            {areas.map(area => {
              const areaProjects = projects.filter(project => project.area_id === area.id)
              const stats = areaStats.get(area.id)
              const isActiveArea = selectedAreaId === area.id && !selectedProjectId
              return (
                <div key={area.id} className="rounded-2xl border border-[var(--color-border)] px-3 py-2 bg-[color-mix(in_srgb,var(--color-bg)_80%,var(--color-surface)_20%)]">
                  <button
                    type="button"
                    onClick={() => onSelectArea(area.id)}
                    className={`w-full flex items-center justify-between text-sm font-semibold rounded-xl px-2 py-1 ${
                      isActiveArea ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' : 'text-[#2D2520] hover:bg-[var(--color-primary-100)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#8FAA8F]" />
                      {area.name}
                    </span>
                    <CountPill total={stats?.total} overdue={stats?.overdue} />
                  </button>
                  <div className="mt-1 ml-7 space-y-1">
                    {areaProjects.map(project => {
                      const projectStat = projectStats.get(project.id)
                      const isActiveProject = selectedProjectId === project.id
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => onSelectProject(project.id)}
                          className={`w-full flex items-center justify-between text-xs rounded-xl px-2 py-1 ${
                            isActiveProject
                              ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] shadow-inner'
                              : 'text-[#736B63] hover:text-[#2D2520]'
                          }`}
                        >
                          <span>{project.name}</span>
                          <CountPill total={projectStat?.total} overdue={projectStat?.overdue} />
                        </button>
                      )
                    })}
                    {areaProjects.length === 0 && (
                      <p className="text-xs text-[#736B63]">{t('sidebar.noProjects')}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {standaloneProjects.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#736B63] mb-2">{t('sidebar.projects')}</p>
            <div className="space-y-1">
              {standaloneProjects.map(project => {
                const stats = projectStats.get(project.id)
                const isActive = selectedProjectId === project.id
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-[var(--color-primary-600)] text-white shadow-md'
                        : 'text-[#2D2520] hover:bg-[var(--color-primary-100)]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#C4BDB5]" />
                      {project.name}
                    </span>
                    <CountPill total={stats?.total} overdue={stats?.overdue} />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </nav>
      <div className="relative px-6 py-4 border-t border-[var(--color-border)] flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleNewListMenu}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary-600)] text-white py-2 text-sm font-semibold shadow-lg hover:bg-[var(--color-primary-700)]"
        >
          +
          <span>Nueva lista</span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="h-12 w-12 flex items-center justify-center rounded-full border border-[var(--color-border)] text-[#736B63] hover:bg-[var(--color-primary-100)]"
          aria-label={t('sidebar.settings')}
        >
          <img src={settingsIcon} alt="" className="h-5 w-5" />
        </button>
        {showNewListMenu && (
          <div className="absolute left-6 right-6 bottom-20 bg-[#2D2520] text-[#FFFCF7] rounded-3xl p-4 space-y-4 shadow-[0_20px_50px_rgba(45,37,32,0.24)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={onCreateProject}
              className="w-full text-left flex flex-col gap-1"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-blue-300">🌀</span> Nuevo proyecto
              </span>
              <span className="text-xs text-[#C4BDB5]">Define un objetivo y avanza tarea a tarea.</span>
            </button>
            <div className="h-px bg-[#4A4340]" />
            <button
              type="button"
              onClick={onCreateArea}
              className="w-full text-left flex flex-col gap-1"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-emerald-300">🧩</span> Nueva área
              </span>
              <span className="text-xs text-[#C4BDB5]">Agrupa proyectos por responsabilidades.</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default DesktopSidebar
