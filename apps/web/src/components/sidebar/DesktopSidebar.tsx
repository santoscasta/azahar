import type { QuickViewId } from '../../pages/tasksSelectors.js'
import type { Project, Area } from '../../lib/supabase.js'

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
  onLogout: () => void
}

function CountPill({ total, overdue }: { total?: number; overdue?: number }) {
  if (!total && !overdue) return null
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold">
      {total ? <span className="text-slate-400">{total}</span> : null}
      {overdue ? <span className="text-rose-500">{overdue}</span> : null}
    </div>
  )
}

export function DesktopSidebar({
  filteredTaskCount,
  completedCount,
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
  onLogout,
}: DesktopSidebarProps) {
  const standaloneProjects = projects.filter(project => !project.area_id)

  return (
    <aside className="rounded-[32px] border border-slate-100 bg-white shadow-2xl flex flex-col h-full">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Azahar</p>
          <p className="text-xl font-semibold text-slate-900">Workspace</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-500 hover:border-slate-300"
        >
          Salir
        </button>
      </div>
      <div className="px-5">
        <div className="rounded-2xl border border-slate-100 p-3 flex items-center justify-between bg-slate-50">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">En progreso</p>
            <p className="text-lg font-semibold text-slate-800">
              {filteredTaskCount} tareas
            </p>
          </div>
          <span className="text-sm text-slate-400">
            {completedCount}/{filteredTaskCount}
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 mt-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Focus</p>
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
                      isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`text-base ${view.accent}`}>{view.icon}</span>
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
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Áreas</p>
          <div className="space-y-3">
            {areas.length === 0 && <p className="text-sm text-slate-400">Crea tu primera área para organizarte.</p>}
            {areas.map(area => {
              const areaProjects = projects.filter(project => project.area_id === area.id)
              const stats = areaStats.get(area.id)
              const isActiveArea = selectedAreaId === area.id && !selectedProjectId
              return (
                <div key={area.id} className="rounded-2xl border border-slate-100 px-3 py-2 bg-slate-50/60">
                  <button
                    type="button"
                    onClick={() => onSelectArea(area.id)}
                    className={`w-full flex items-center justify-between text-sm font-semibold ${
                      isActiveArea ? 'text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
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
                            isActiveProject ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          <span>{project.name}</span>
                          <CountPill total={projectStat?.total} overdue={projectStat?.overdue} />
                        </button>
                      )
                    })}
                    {areaProjects.length === 0 && (
                      <p className="text-xs text-slate-400">Sin proyectos todavía</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {standaloneProjects.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Proyectos</p>
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
                      isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
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
      <div className="relative px-6 py-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onToggleNewListMenu}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-2 text-sm font-semibold shadow-lg"
        >
          +
          <span>Nueva lista</span>
        </button>
        {showNewListMenu && (
          <div className="absolute left-6 right-6 bottom-20 bg-slate-900 text-slate-100 rounded-3xl p-4 space-y-4 shadow-2xl">
            <button
              type="button"
              onClick={onCreateProject}
              className="w-full text-left flex flex-col gap-1"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-blue-300">🌀</span> Nuevo proyecto
              </span>
              <span className="text-xs text-slate-300">Define un objetivo y avanza tarea a tarea.</span>
            </button>
            <div className="h-px bg-slate-700" />
            <button
              type="button"
              onClick={onCreateArea}
              className="w-full text-left flex flex-col gap-1"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-emerald-300">🧩</span> Nueva área
              </span>
              <span className="text-xs text-slate-300">Agrupa proyectos por responsabilidades.</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default DesktopSidebar
