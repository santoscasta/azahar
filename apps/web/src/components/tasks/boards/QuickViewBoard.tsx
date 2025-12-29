import type { Task, Area, Project } from '../../../lib/supabase.js'
import { useTranslations } from '../../../App.js'

export interface QuickViewGroup {
  areaId: string | null
  area: Area | null
  projects: Map<string, { project: Project | null; tasks: Task[] }>
  standalone: Task[]
}

interface QuickViewBoardProps {
  groups: QuickViewGroup[]
  onSelectArea: (areaId: string) => void
  renderTaskList: (
    tasks: Task[]
  ) => React.ReactNode
}

export default function QuickViewBoard({
  groups,
  onSelectArea,
  renderTaskList,
}: QuickViewBoardProps) {
  const { t } = useTranslations()
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 space-y-3">
        {renderTaskList([])}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map(group => (
        <section
          key={group.areaId || 'none'}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-6 space-y-6"
        >
          {group.area && (
            <div>
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('context.label.area')}</p>
              <button
                type="button"
                onClick={() => onSelectArea(group.areaId!)}
                className="min-h-[44px] text-base font-semibold text-[var(--on-surface)] hover:underline text-left"
              >
                {group.area.name}
              </button>
              <p className="text-xs text-[var(--color-text-muted)]">
                {group.projects.size} proyecto{group.projects.size === 1 ? '' : 's'} / {group.standalone.length} tareas sueltas
              </p>
            </div>
          )}
          <div className="space-y-6">
            {Array.from(group.projects.entries()).map(([projectId, { project, tasks }], index) => (
              <div key={projectId || `project-${index}`} className="space-y-3">
                {project?.name ? (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('context.label.project')}</p>
                    <span className="text-sm font-semibold text-[var(--on-surface)]">{project.name}</span>
                  </div>
                ) : null}
                {renderTaskList(tasks)}
              </div>
            ))}
            {group.standalone.length > 0 && (
              <article className="space-y-3">
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('task.loose')}</p>
                {renderTaskList(group.standalone)}
              </article>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
