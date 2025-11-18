import type { Area, Project } from '../../lib/supabase.js'

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
}: MobileHeaderProps) {
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
            {isProjectView ? 'Proyecto' : selectedArea ? 'Área' : 'Vista'}
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
              ? `${filteredTaskCount} tarea${filteredTaskCount === 1 ? '' : 's'} en este proyecto`
              : selectedArea
                ? `${projectsInArea} proyecto(s)`
                : friendlyToday}
          </p>
        </div>
        <button className="text-2xl text-slate-400 pr-1" aria-label="Más opciones">
          ⋯
        </button>
      </div>
      <div className="rounded-3xl bg-white border border-slate-100 shadow px-5 py-4 space-y-2">
        {isProjectView ? (
          <>
            <p className="text-sm text-slate-600">
              Añade notas o info clave para mantener el proyecto alineado.
            </p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Pendientes: {filteredTaskCount - completedCount}</span>
              <span>
                {completedCount}/{filteredTaskCount} completadas
              </span>
            </div>
          </>
        ) : selectedArea ? (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">Área activa</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTaskCount} completadas
            </p>
            <p className="text-sm text-slate-500">
              {projectsInArea} proyecto(s) asociados
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">En esta vista</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTaskCount} completadas
            </p>
            <p className="text-sm text-slate-500">
              {mobileProject ? `Proyecto activo: ${mobileProject.name}` : 'Sin proyecto destacado'}
            </p>
          </>
        )}
      </div>
    </header>
  )
}
