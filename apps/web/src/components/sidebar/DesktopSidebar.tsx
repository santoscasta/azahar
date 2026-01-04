import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Droppable } from '@hello-pangea/dnd'
import type { QuickViewId } from '../../pages/tasksSelectors.js'
import type { Project, Area } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'
import { buildAreaTargetId, buildProjectTargetId, buildQuickViewTargetId } from '../../lib/dndIds.js'
import settingsIcon from '../../assets/icons/settings.svg'
import helpIcon from '../../assets/icons/help.svg'
import AreaIcon from '../icons/AreaIcon.js'
import ProjectIcon from '../icons/ProjectIcon.js'
import SearchIcon from '../icons/SearchIcon.js'
import AzaharLogo from './AzaharLogo.js'

interface StatsMap extends Map<string, { total: number; overdue: number }> { }

interface QuickListItem {
  id: QuickViewId
  label: string
  icon: string
  accent: string
}

interface ProjectReorderPayload {
  sourceAreaId: string | null
  targetAreaId: string | null
  orderedProjectIds: string[]
  movedProjectId: string
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
  onOpenQuickFind?: () => void
  onOpenSettings: () => void
  onOpenHelp: () => void
  onReorderProjects: (payload: ProjectReorderPayload) => void
  taskDrop?: {
    canDropTask: (taskId: string) => boolean
    onDropQuickView: (taskId: string, viewId: QuickViewId) => void
    onDropArea: (taskId: string, areaId: string) => void
    onDropProject: (taskId: string, projectId: string) => void
  }
  search?: {
    searchQuery: string
    suggestions: any[]
    projects: Project[]
    showSuggestions: boolean
    inputRef: any
    onQueryChange: (q: string) => void
    onFocus: () => void
    onBlur: () => void
    onClear: () => void
    onSelectSuggestion: (s: any) => void
  }
}

function CountPill({ total, overdue }: { total?: number; overdue?: number }) {
  if (!total && !overdue) return null
  const badgeClass =
    'inline-flex items-center justify-center h-5 min-w-[20px] rounded-[var(--radius-chip)] px-2 text-[11px] font-semibold border border-[var(--color-border)] bg-[var(--color-surface-elevated)]'
  return (
    <div className="flex items-center gap-1">
      {overdue ? (
        <span className={`${badgeClass} text-[var(--color-done-500)]`}>
          {overdue}
        </span>
      ) : null}
      {total ? (
        <span className={`${badgeClass} text-[var(--color-text-muted)]`}>
          {total}
        </span>
      ) : null}
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
  onOpenQuickFind,
  onOpenSettings,
  onOpenHelp,
  onReorderProjects,
}: DesktopSidebarProps) {
  const { t } = useTranslations()
  const standaloneProjects = projects.filter(project => !project.area_id)
  const [draggingProjectId, setDraggingProjectId] = useState<string | null>(null)
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null)
  const [dragOverAreaId, setDragOverAreaId] = useState<string | null>(null)
  const dragStateRef = useRef<'idle' | 'dragging' | 'justDropped'>('idle')
  const draggingProjectRef = useRef<{ id: string; areaId: string | null } | null>(null)

  const handleProjectClick = (projectId: string) => {
    if (dragStateRef.current !== 'idle') {
      return
    }
    onSelectProject(projectId)
  }

  const handleAreaClick = (areaId: string) => {
    if (dragStateRef.current !== 'idle') {
      return
    }
    onSelectArea(areaId)
  }

  const resetDragState = () => {
    draggingProjectRef.current = null
    setDraggingProjectId(null)
    setDragOverProjectId(null)
    setDragOverAreaId(null)
    dragStateRef.current = 'justDropped'
    setTimeout(() => {
      dragStateRef.current = 'idle'
    }, 0)
  }

  const handleProjectDragStart = (
    event: DragEvent<HTMLButtonElement>,
    projectId: string,
    areaId: string | null
  ) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', projectId)
    dragStateRef.current = 'dragging'
    draggingProjectRef.current = { id: projectId, areaId }
    setDraggingProjectId(projectId)
    setDragOverProjectId(null)
    setDragOverAreaId(null)
  }

  const handleProjectDragEnd = () => {
    resetDragState()
  }

  const handleProjectDragOver = (
    event: DragEvent<HTMLButtonElement>,
    projectId: string
  ) => {
    const dragging = draggingProjectRef.current
    if (!dragging) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dragOverAreaId) {
      setDragOverAreaId(null)
    }
    if (dragOverProjectId !== projectId) {
      setDragOverProjectId(projectId)
    }
  }

  const handleAreaDragOver = (event: DragEvent<HTMLButtonElement>, areaId: string) => {
    const dragging = draggingProjectRef.current
    if (!dragging) {
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (dragOverProjectId) {
      setDragOverProjectId(null)
    }
    if (dragOverAreaId !== areaId) {
      setDragOverAreaId(areaId)
    }
  }

  const handleAreaDrop = (event: DragEvent<HTMLButtonElement>, areaId: string) => {
    event.preventDefault()
    const dragging = draggingProjectRef.current
    if (!dragging) {
      resetDragState()
      return
    }
    const groupProjects = projects.filter(project => project.area_id === areaId)
    const groupIds = groupProjects.map(project => project.id)
    const orderedIds = groupIds.includes(dragging.id)
      ? [...groupIds.filter(id => id !== dragging.id), dragging.id]
      : [...groupIds, dragging.id]
    onReorderProjects({
      sourceAreaId: dragging.areaId,
      targetAreaId: areaId,
      orderedProjectIds: orderedIds,
      movedProjectId: dragging.id,
    })
    resetDragState()
  }

  const buildReorderedIds = (ids: string[], sourceId: string, targetId: string, insertAfter: boolean) => {
    if (sourceId === targetId) {
      return ids
    }
    const trimmed = ids.filter(id => id !== sourceId)
    const targetIndex = trimmed.indexOf(targetId)
    if (targetIndex === -1) {
      return ids
    }
    const insertIndex = insertAfter ? targetIndex + 1 : targetIndex
    return [...trimmed.slice(0, insertIndex), sourceId, ...trimmed.slice(insertIndex)]
  }

  const isSameOrder = (nextOrder: string[], currentOrder: string[]) =>
    nextOrder.length === currentOrder.length && nextOrder.every((id, index) => id === currentOrder[index])

  const handleProjectDrop = (
    event: DragEvent<HTMLButtonElement>,
    targetProjectId: string,
    areaId: string | null
  ) => {
    event.preventDefault()
    const dragging = draggingProjectRef.current
    if (!dragging) {
      resetDragState()
      return
    }
    const sourceId = dragging.id
    const groupProjects = areaId
      ? projects.filter(project => project.area_id === areaId)
      : standaloneProjects
    const groupIds = groupProjects.map(project => project.id)
    const baseIds = groupIds.includes(sourceId) ? groupIds : [...groupIds, sourceId]
    const rect = event.currentTarget.getBoundingClientRect()
    const insertAfter = event.clientY > rect.top + rect.height / 2
    const reordered = buildReorderedIds(baseIds, sourceId, targetProjectId, insertAfter)
    if (dragging.areaId !== areaId || !isSameOrder(reordered, groupIds)) {
      onReorderProjects({
        sourceAreaId: dragging.areaId,
        targetAreaId: areaId,
        orderedProjectIds: reordered,
        movedProjectId: sourceId,
      })
    }
    resetDragState()
  }

  return (
    <aside className="rounded-[var(--radius-container)] border border-[var(--color-border)] bg-[var(--color-surface)]  flex flex-col h-full text-[var(--on-surface)]">
      <div className="px-6 pt-6 pb-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AzaharLogo />
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('sidebar.brand')}</p>
            <p className="text-lg font-semibold">{t('sidebar.workspace')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenQuickFind}
          className="h-10 w-10 flex items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)]"
          aria-label={t('search.placeholder')}
        >
          <SearchIcon className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 mt-6">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text-muted)] mb-2">{t('sidebar.focus')}</p>
          <ul className="space-y-1">
            {quickLists.map(view => {
              const total = quickViewStats[view.id]
              const overdue = quickViewOverdueStats[view.id]
              const isActive = !selectedProjectId && !selectedAreaId && activeQuickView === view.id
              return (
                <li key={view.id}>
                  <Droppable droppableId={buildQuickViewTargetId(view.id)} type="TASK">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <button
                          type="button"
                          onClick={() => onSelectQuickView(view.id)}
                          className={`w-full min-h-[48px] flex items-center justify-between rounded-[var(--radius-container)] px-3 py-2 text-sm font-medium transition ${isActive
                            ? 'bg-[var(--color-action-500)] text-[var(--on-primary)] '
                            : 'text-[var(--on-surface)] hover:bg-[var(--color-primary-100)]'
                            } ${snapshot.isDraggingOver ? 'ring-1 ring-[var(--color-primary-200)]' : ''}`}
                        >
                          <span className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-[var(--radius-card)] bg-[var(--color-primary-100)] flex items-center justify-center">
                              <img src={view.icon} alt="" className="h-5 w-5" />
                            </span>
                            {view.label}
                          </span>
                          <CountPill total={total} overdue={overdue} />
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <div className="space-y-3">
            {areas.length === 0 && <p className="text-sm text-[var(--color-text-muted)]">{t('sidebar.emptyAreas')}</p>}
            {areas.map(area => {
              const areaProjects = projects.filter(project => project.area_id === area.id)
              const stats = areaStats.get(area.id)
              const isActiveArea = selectedAreaId === area.id && !selectedProjectId
              return (
                <div key={area.id} className="px-1 py-1">
                  <Droppable droppableId={buildAreaTargetId(area.id)} type="TASK">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <button
                          type="button"
                          onClick={() => handleAreaClick(area.id)}
                          onDragOver={(event) => handleAreaDragOver(event, area.id)}
                          onDrop={(event) => handleAreaDrop(event, area.id)}
                          className={`w-full min-h-[48px] flex items-center justify-between text-sm font-semibold rounded-[var(--radius-card)] px-3 py-2 ${isActiveArea ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)]' : 'text-[var(--on-surface)] hover:bg-[var(--color-primary-100)]'
                            } ${dragOverAreaId === area.id || snapshot.isDraggingOver ? 'ring-1 ring-[var(--color-primary-200)]' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            <AreaIcon className="h-3.5 w-3.5" />
                            {area.name}
                          </span>
                          <CountPill total={stats?.total} overdue={stats?.overdue} />
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <div className="mt-1 ml-7 space-y-1">
                    {areaProjects.map(project => {
                      const projectStat = projectStats.get(project.id)
                      const isActiveProject = selectedProjectId === project.id
                      return (
                        <Droppable key={project.id} droppableId={buildProjectTargetId(project.id)} type="TASK">
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps}>
                              <button
                                type="button"
                                draggable
                                onClick={() => handleProjectClick(project.id)}
                                onDragStart={(event) => handleProjectDragStart(event, project.id, area.id)}
                                onDragEnd={handleProjectDragEnd}
                                onDragOver={(event) => handleProjectDragOver(event, project.id)}
                                onDrop={(event) => handleProjectDrop(event, project.id, area.id)}
                                className={`w-full min-h-[48px] flex items-center justify-between text-sm rounded-[var(--radius-card)] px-3 py-2 ${isActiveProject
                                  ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] '
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--on-surface)]'
                                  } ${draggingProjectId === project.id ? 'opacity-60 cursor-grabbing' : 'cursor-grab'
                                  } ${dragOverProjectId === project.id || snapshot.isDraggingOver
                                    ? 'ring-1 ring-[var(--color-primary-200)]'
                                    : ''
                                  }`}
                              >
                                <span className="flex items-center gap-2">
                                  <ProjectIcon className="h-3 w-3" />
                                  {project.name}
                                </span>
                                <CountPill total={projectStat?.total} overdue={projectStat?.overdue} />
                              </button>
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {standaloneProjects.length > 0 && (
          <div>
            <div className="space-y-1">
              {standaloneProjects.map(project => {
                const stats = projectStats.get(project.id)
                const isActive = selectedProjectId === project.id
                return (
                  <Droppable key={project.id} droppableId={buildProjectTargetId(project.id)} type="TASK">
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}>
                        <button
                          type="button"
                          draggable
                          onClick={() => handleProjectClick(project.id)}
                          onDragStart={(event) => handleProjectDragStart(event, project.id, null)}
                          onDragEnd={handleProjectDragEnd}
                          onDragOver={(event) => handleProjectDragOver(event, project.id)}
                          onDrop={(event) => handleProjectDrop(event, project.id, null)}
                          className={`w-full min-h-[48px] flex items-center justify-between rounded-[var(--radius-container)] px-3 py-2 text-sm font-medium ${isActive
                            ? 'bg-[var(--color-action-500)] text-[var(--on-primary)] '
                            : 'text-[var(--on-surface)] hover:bg-[var(--color-primary-100)]'
                            } ${draggingProjectId === project.id ? 'opacity-60 cursor-grabbing' : 'cursor-grab'
                            } ${dragOverProjectId === project.id || snapshot.isDraggingOver
                              ? 'ring-1 ring-[var(--color-primary-200)]'
                              : ''
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <ProjectIcon className="h-3.5 w-3.5" />
                            {project.name}
                          </span>
                          <CountPill total={stats?.total} overdue={stats?.overdue} />
                        </button>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
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
          className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] py-2 text-sm font-semibold  hover:opacity-90"
        >
          +
          <span>{t('sidebar.newList')}</span>
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          className="h-12 w-12 flex items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)]"
          aria-label={t('sidebar.settings')}
        >
          <img src={settingsIcon} alt="" className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onOpenHelp}
          className="h-12 w-12 flex items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)]"
          aria-label={t('sidebar.help')}
        >
          <img src={helpIcon} alt="" className="h-5 w-5" />
        </button>
        {showNewListMenu && (
          <div className="absolute left-6 right-6 bottom-20 bg-[var(--color-surface-elevated)] text-[var(--on-surface)] rounded-[var(--radius-container)] p-4 space-y-4  border border-[var(--color-border)]">
            <button
              type="button"
              onClick={onCreateProject}
              className="w-full min-h-[44px] text-left flex flex-col gap-1 py-2"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-[var(--color-primary-600)]">🌀</span> {t('sidebar.newProject')}
              </span>
              <span className="text-xs text-[var(--color-text-subtle)]">{t('sidebar.newProject.desc')}</span>
            </button>
            <div className="h-px bg-[var(--color-border)]" />
            <button
              type="button"
              onClick={onCreateArea}
              className="w-full min-h-[44px] text-left flex flex-col gap-1 py-2"
            >
              <span className="text-sm font-semibold flex items-center gap-2">
                <span className="text-[var(--color-accent-600)]">🧩</span> {t('sidebar.newArea')}
              </span>
              <span className="text-xs text-[var(--color-text-subtle)]">{t('sidebar.newArea.desc')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default DesktopSidebar
