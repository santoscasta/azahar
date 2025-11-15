import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  searchTasks,
  addTask,
  signOut,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getProjects,
  addProject,
  getLabels,
  addLabel,
  addTaskLabel,
  removeTaskLabel,
  getAreas,
  addArea,
  getProjectHeadings,
  addProjectHeading,
  updateProjectHeading,
  deleteProjectHeading,
} from '../lib/supabase'
import type { Task, TaskLabelSummary, Label, Area, Project } from '../lib/supabase'
import {
  buildQuickViewStats,
  filterTasksByQuickView,
  buildActiveFilters,
  isFilteredView,
  normalizeDate,
  getTaskView,
  type QuickViewId,
} from './tasksSelectors'

export default function TasksPage() {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskNotes, setNewTaskNotes] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<0 | 1 | 2 | 3>(0)
  const [newTaskDueAt, setNewTaskDueAt] = useState('')
  const [newTaskProjectId, setNewTaskProjectId] = useState<string | null>(null)
  const [newTaskAreaId, setNewTaskAreaId] = useState<string | null>(null)
  const [newTaskHeadingId, setNewTaskHeadingId] = useState<string | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<'open' | 'done' | 'snoozed'>('open')
  const [newTaskLabelIds, setNewTaskLabelIds] = useState<string[]>([])
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [editingPriority, setEditingPriority] = useState<0 | 1 | 2 | 3>(0)
  const [editingDueAt, setEditingDueAt] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const [editingHeadingId, setEditingHeadingId] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectAreaId, setNewProjectAreaId] = useState<string | null>(null)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')
  const [showNewArea, setShowNewArea] = useState(false)
  const [inlineLabelName, setInlineLabelName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [activeQuickView, setActiveQuickView] = useState<QuickViewId>('inbox')
  const [selectedTaskForLabel, setSelectedTaskForLabel] = useState<string | null>(null)
  const [newHeadingName, setNewHeadingName] = useState('')
  const [headingEditingId, setHeadingEditingId] = useState<string | null>(null)
  const [headingEditingName, setHeadingEditingName] = useState('')
  const [newTaskView, setNewTaskView] = useState<QuickViewId>('inbox')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileHome, setShowMobileHome] = useState(true)
  const [mobileProjectFocusId, setMobileProjectFocusId] = useState<string | null>(null)
  const [mobileTaskLimit, setMobileTaskLimit] = useState(6)
  const [datePickerTarget, setDatePickerTarget] = useState<'new' | 'edit' | null>(null)
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date())
  const [activeProjectFilterChip, setActiveProjectFilterChip] = useState<'all' | 'important' | string>('all')
  const [showNewListMenu, setShowNewListMenu] = useState(false)
  const [showQuickHeadingForm, setShowQuickHeadingForm] = useState(false)
  const searchBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Consulta para obtener tareas con búsqueda y filtros
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: [
      'tasks',
      { projectId: selectedProjectId, areaId: selectedAreaId, labelIds: selectedLabelIds, q: searchQuery },
    ],
    queryFn: async () => {
      const result = await searchTasks(
        searchQuery || undefined,
        selectedProjectId || undefined,
        selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
        selectedAreaId || undefined
      )
      if (!result.success) {
        setError(result.error || 'Error al cargar tareas')
        return []
      }
      return result.tasks || []
    },
  })

  // Consulta para obtener proyectos
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await getProjects()
      if (!result.success) {
        return []
      }
      return result.projects || []
    },
  })

  // Consulta para obtener etiquetas
  const { data: labels = [] } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const result = await getLabels()
      if (!result.success) {
        return []
      }
      return result.labels || []
    },
  })

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => {
      const result = await getAreas()
      if (!result.success) {
        return []
      }
      return result.areas || []
    },
  })

  const { data: projectHeadings = [] } = useQuery({
    queryKey: ['project-headings'],
    queryFn: async () => {
      const result = await getProjectHeadings()
      if (!result.success) {
        return []
      }
      return result.headings || []
    },
  })

  useEffect(() => {
    return () => {
      if (searchBlurTimeout.current) {
        clearTimeout(searchBlurTimeout.current)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateMatches = (matches: boolean) => {
      setIsMobile(matches)
      setShowMobileHome(matches)
    }
    updateMatches(mediaQuery.matches)
    const listener = (event: MediaQueryListEvent) => {
      updateMatches(event.matches)
    }
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', listener)
      return () => mediaQuery.removeEventListener('change', listener)
    }
    mediaQuery.addListener(listener)
    return () => mediaQuery.removeListener(listener)
  }, [])

  const todayISO = useMemo(() => {
    const now = new Date()
    const month = `${now.getMonth() + 1}`.padStart(2, '0')
    const day = `${now.getDate()}`.padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  }, [])
  const quickViewStats = useMemo(() => buildQuickViewStats(tasks, todayISO), [tasks, todayISO])
  const filteredTasks = useMemo(
    () => filterTasksByQuickView(tasks, activeQuickView, todayISO),
    [tasks, activeQuickView, todayISO]
  )
  const isTaskOverdue = (task: Task) => {
    if (task.status !== 'open' || !task.due_at) {
      return false
    }
    const normalized = normalizeDate(task.due_at)
    return !!normalized && normalized < todayISO
  }
  const quickViewOverdueStats = useMemo(() => {
    const base: Record<QuickViewId, number> = {
      inbox: 0,
      today: 0,
      upcoming: 0,
      anytime: 0,
      someday: 0,
      logbook: 0,
    }
    tasks.forEach(task => {
      if (!isTaskOverdue(task)) {
        return
      }
      const view = getTaskView(task, todayISO)
      base[view] += 1
    })
    return base
  }, [tasks, todayISO])
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach(project => map.set(project.id, project))
    return map
  }, [projects])
  const projectStats = useMemo(() => {
    const stats = new Map<string, { total: number; overdue: number }>()
    tasks.forEach(task => {
      if (!task.project_id || task.status === 'done') {
        return
      }
      const entry = stats.get(task.project_id) || { total: 0, overdue: 0 }
      entry.total += 1
      if (isTaskOverdue(task)) {
        entry.overdue += 1
      }
      stats.set(task.project_id, entry)
    })
    return stats
  }, [tasks, todayISO])
  const areaStats = useMemo(() => {
    const stats = new Map<string, { total: number; overdue: number }>()
    tasks.forEach(task => {
      if (task.status === 'done') {
        return
      }
      const relatedArea = task.area_id || (task.project_id ? projectMap.get(task.project_id)?.area_id || null : null)
      if (!relatedArea) {
        return
      }
      const entry = stats.get(relatedArea) || { total: 0, overdue: 0 }
      entry.total += 1
      if (isTaskOverdue(task)) {
        entry.overdue += 1
      }
      stats.set(relatedArea, entry)
    })
    return stats
  }, [tasks, todayISO, projectMap])

  const tomorrowISO = useMemo(() => {
    const todayDate = new Date(todayISO)
    const tomorrow = new Date(todayDate)
    tomorrow.setDate(todayDate.getDate() + 1)
    const month = `${tomorrow.getMonth() + 1}`.padStart(2, '0')
    const day = `${tomorrow.getDate()}`.padStart(2, '0')
    return `${tomorrow.getFullYear()}-${month}-${day}`
  }, [todayISO])

  const determineViewFromDate = (value: string | null, fallback: QuickViewId = 'inbox'): QuickViewId => {
    if (!value) {
      return fallback === 'someday' ? 'someday' : 'anytime'
    }
    if (value <= todayISO) {
      return 'today'
    }
    return 'upcoming'
  }

  const applyViewPreset = (view: QuickViewId) => {
    setNewTaskView(view)
    switch (view) {
      case 'today':
        setNewTaskDueAt(todayISO)
        setNewTaskStatus('open')
        break
      case 'upcoming':
        setNewTaskDueAt(prev => {
          if (prev && prev > todayISO) {
            return prev
          }
          return tomorrowISO
        })
        setNewTaskStatus('open')
        break
      case 'anytime':
        setNewTaskDueAt('')
        setNewTaskStatus('open')
        break
      case 'someday':
        setNewTaskDueAt('')
        setNewTaskStatus('snoozed')
        break
      default:
        setNewTaskDueAt('')
        setNewTaskStatus('open')
    }
  }

  const toggleNewTaskLabel = (labelId: string) => {
    setNewTaskLabelIds(prev => (prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]))
  }

  const handleOpenMobileProject = (projectId: string) => {
    handleSelectProject(projectId)
    setMobileProjectFocusId(projectId)
    setShowMobileHome(false)
  }

  const handleOpenMobileArea = (areaId: string) => {
    handleSelectArea(areaId)
    setMobileProjectFocusId(null)
    setShowMobileHome(false)
  }

  const handleInlineLabelCreate = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }
    if (!inlineLabelName.trim()) {
      setError('El nombre de la etiqueta no puede estar vacío')
      return
    }
    addInlineLabelMutation.mutate(inlineLabelName.trim())
  }

  const quickLists = [
    { id: 'inbox', label: 'Inbox', icon: '📥', accent: 'text-slate-700' },
    { id: 'today', label: 'Today', icon: '⭐', accent: 'text-amber-500' },
    { id: 'upcoming', label: 'Upcoming', icon: '📆', accent: 'text-sky-500' },
    { id: 'anytime', label: 'Anytime', icon: '🌤️', accent: 'text-emerald-600' },
    { id: 'someday', label: 'Someday', icon: '📦', accent: 'text-violet-500' },
    { id: 'logbook', label: 'Logbook', icon: '✅', accent: 'text-slate-400' },
  ] as const
  const creationViewOptions = quickLists.filter(list => list.id !== 'logbook')
  const currentQuickView = quickLists.find(list => list.id === activeQuickView) || quickLists[0]

  const handleSelectQuickView = (view: QuickViewId) => {
    setActiveQuickView(view)
    setSelectedProjectId(null)
    setSelectedAreaId(null)
    setActiveProjectFilterChip('all')
    setShowNewListMenu(false)
    setMobileProjectFocusId(null)
    if (isMobile) {
      setShowMobileHome(false)
    }
  }

  const renderDesktopSidebar = () => {
    const standaloneProjects = projects.filter(project => !project.area_id)
    const renderCount = (total?: number, overdue?: number) => {
      if (!total && !overdue) {
        return null
      }
      return (
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          {total ? <span className="text-slate-400">{total}</span> : null}
          {overdue ? <span className="text-rose-500">{overdue}</span> : null}
        </div>
      )
    }

    return (
      <aside className="rounded-[32px] border border-slate-100 bg-white shadow-2xl flex flex-col h-full">
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Azahar</p>
            <p className="text-xl font-semibold text-slate-900">Workspace</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
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
                {filteredTasks.filter(task => task.status !== 'done').length} tareas
              </p>
            </div>
            <span className="text-sm text-slate-400">
              {completedCount}/{filteredTasks.length}
            </span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-8 mt-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-2">Focus</p>
            <ul className="space-y-1">
              {quickLists.map(view => {
                const viewId = view.id as QuickViewId
                const total = quickViewStats[viewId]
                const overdue = quickViewOverdueStats[viewId]
                const isActive = !selectedProjectId && !selectedAreaId && activeQuickView === viewId
                return (
                  <li key={view.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectQuickView(viewId)}
                      className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium transition ${
                        isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`text-base ${view.accent}`}>{view.icon}</span>
                        {view.label}
                      </span>
                      {renderCount(total, overdue)}
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
                      onClick={() => handleSelectArea(area.id)}
                      className={`w-full flex items-center justify-between text-sm font-semibold ${
                        isActiveArea ? 'text-slate-900' : 'text-slate-600'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        {area.name}
                      </span>
                      {renderCount(stats?.total, stats?.overdue)}
                    </button>
                    <div className="mt-1 ml-7 space-y-1">
                      {areaProjects.map(project => {
                        const projectStat = projectStats.get(project.id)
                        const isActiveProject = selectedProjectId === project.id
                        return (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleSelectProject(project.id)}
                            className={`w-full flex items-center justify-between text-xs rounded-xl px-2 py-1 ${
                              isActiveProject ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <span>{project.name}</span>
                            {renderCount(projectStat?.total, projectStat?.overdue)}
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
                      onClick={() => handleSelectProject(project.id)}
                      className={`w-full flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-medium ${
                        isActive ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                        {project.name}
                      </span>
                      {renderCount(stats?.total, stats?.overdue)}
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
            onClick={() => setShowNewListMenu(prev => !prev)}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 text-white py-2 text-sm font-semibold shadow-lg"
          >
            +
            <span>Nueva lista</span>
          </button>
          {showNewListMenu && (
            <div className="absolute left-6 right-6 bottom-20 bg-slate-900 text-slate-100 rounded-3xl p-4 space-y-4 shadow-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(true)
                  setShowNewListMenu(false)
                }}
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
                onClick={() => {
                  setShowNewArea(true)
                  setShowNewListMenu(false)
                }}
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


  const renderMobileHome = () => (
    <div className="space-y-6 pb-28">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onFocus={handleMobileHomeSearchFocus}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Búsqueda rápida"
          className="w-full pl-10 pr-3 py-3 rounded-3xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 divide-y">
        {quickLists.map(view => (
          <button
            key={`mobile-${view.id}`}
            onClick={() => handleSelectQuickView(view.id)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="text-2xl">{view.icon}</span>
              <span className="text-base font-medium text-slate-700">{view.label}</span>
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              {quickViewStats[view.id] > 0 && <span className="text-sm">{quickViewStats[view.id]}</span>}
              <span>›</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>Áreas</span>
        </div>
        <div className="space-y-2">
          {areas.slice(0, 4).map(area => (
            <button
              key={`mobile-area-${area.id}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl border border-transparent hover:border-slate-200"
              onClick={() => handleOpenMobileArea(area.id)}
            >
              <span className="text-sm text-slate-700">{area.name}</span>
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
          <span>Proyectos</span>
          <button onClick={() => setShowNewProject(true)} className="text-sm font-semibold text-slate-500">
            + Nuevo
          </button>
        </div>
        <div className="space-y-2">
          {projects.slice(0, 4).map(project => (
            <button
              key={`mobile-project-${project.id}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl border border-transparent hover:border-slate-200"
              onClick={() => handleOpenMobileProject(project.id)}
            >
              <span className="text-sm text-slate-700">{project.name}</span>
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-slate-400 px-2">
        <button className="text-sm flex items-center gap-2">
          ⚙ <span>Ajustes</span>
        </button>
        <button className="text-sm flex items-center gap-2">
          ❓<span>Ayuda</span>
        </button>
      </div>

      <button
        onClick={handleOpenTaskModal}
        className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-blue-500 text-white text-3xl shadow-2xl flex items-center justify-center"
      >
        +
      </button>
    </div>
  )

  const renderTaskModal = () => {
    if (!isTaskModalOpen) return null
    const wrapperClasses = isMobile
      ? 'fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm overflow-y-auto'
      : 'fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4'
    const cardClasses = isMobile
      ? 'az-card w-full min-h-full rounded-none border-0 shadow-none'
      : 'az-card max-w-xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto'
    return (
      <div className={wrapperClasses}>
        <div className={cardClasses}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-primary-500)' }}>
                Nueva tarea
              </p>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-primary-700)' }}>
                Detalles
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseTaskModal}
              className="text-slate-400 hover:text-slate-600 text-xl"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddTask} className="p-6 space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-primary-500)' }}>
                Vista destino
              </p>
              <div className="flex flex-wrap gap-2">
                {creationViewOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={newTaskView === option.id}
                    onClick={() => applyViewPreset(option.id)}
                    className="px-3 py-2 rounded-2xl border flex items-center gap-2 text-sm font-medium transition"
                    style={
                      newTaskView === option.id
                        ? {
                            background: 'var(--color-primary-600)',
                            color: 'var(--on-primary)',
                            borderColor: 'var(--color-primary-600)',
                          }
                        : {
                            color: 'var(--color-primary-600)',
                            borderColor: 'var(--color-primary-100)',
                          }
                    }
                  >
                    <span>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                Título
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Escribe el título de la tarea..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Área
                </label>
                <select
                  value={newTaskAreaId || ''}
                  onChange={(e) => {
                    const value = e.target.value || null
                    setNewTaskAreaId(value)
                    if (value && newTaskProjectId) {
                      const project = projects.find(project => project.id === newTaskProjectId)
                      if (project?.area_id !== value) {
                        setNewTaskProjectId(null)
                        setNewTaskHeadingId(null)
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="">Sin área</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Proyecto
                </label>
                <select
                  value={newTaskProjectId || ''}
                  onChange={(e) => {
                    const value = e.target.value || null
                    setNewTaskProjectId(value)
                    if (value) {
                      const project = projects.find(project => project.id === value)
                      setNewTaskAreaId(project?.area_id || null)
                    }
                    setNewTaskHeadingId(null)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="">Sin proyecto</option>
                  {(newTaskAreaId ? projects.filter(project => project.area_id === newTaskAreaId) : projects).map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {newTaskProjectId && (
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Sección
                </label>
                <select
                  value={newTaskHeadingId || ''}
                  onChange={(e) => setNewTaskHeadingId(e.target.value || null)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="">Sin sección</option>
                  {projectHeadings
                    .filter(heading => heading.project_id === newTaskProjectId)
                    .map(heading => (
                      <option key={heading.id} value={heading.id}>
                        {heading.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Prioridad
                </label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(Number(e.target.value) as 0 | 1 | 2 | 3)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                >
                  <option value="0">Sin prioridad</option>
                  <option value="1">🟢 Baja</option>
                  <option value="2">🟡 Media</option>
                  <option value="3">🔴 Alta</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Vencimiento
                </label>
                <button
                  type="button"
                  onClick={() => openDatePicker('new')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-600 hover:border-slate-400"
                >
                  {formatDateForLabel(newTaskDueAt)}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                Notas
              </label>
              <textarea
                value={newTaskNotes}
                onChange={(e) => setNewTaskNotes(e.target.value)}
                placeholder="Añade contexto o pasos..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                  Etiquetas
                </label>
                {labels.length > 0 && (
                  <span className="text-xs text-slate-400">
                    Márcalas para aplicarlas a la tarea
                  </span>
                )}
              </div>
              {labels.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Aún no tienes etiquetas. Crea la primera aquí abajo.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => {
                    const isSelected = newTaskLabelIds.includes(label.id)
                    return (
                      <button
                        key={`new-task-label-${label.id}`}
                        type="button"
                        onClick={() => toggleNewTaskLabel(label.id)}
                        className={`az-pill transition ${
                          isSelected
                            ? 'bg-[var(--color-accent-500)] text-white'
                            : ''
                        }`}
                        style={
                          isSelected
                            ? {
                                border: '1px solid var(--color-accent-500)',
                                boxShadow: '0 5px 15px rgba(47, 125, 87, 0.25)',
                              }
                            : undefined
                        }
                      >
                        {isSelected ? '✓ ' : ''}
                        #{label.name}
                      </button>
                    )
                  })}
                </div>
              )}
              <form onSubmit={handleInlineLabelCreate} className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  value={inlineLabelName}
                  onChange={(e) => setInlineLabelName(e.target.value)}
                  placeholder="Ej. Diseño, Personal..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
                  disabled={addInlineLabelMutation.isPending}
                />
                <button
                  type="submit"
                  disabled={addInlineLabelMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'var(--color-accent-500)' }}
                >
                  {addInlineLabelMutation.isPending ? 'Añadiendo...' : 'Crear etiqueta'}
                </button>
              </form>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={handleCloseTaskModal} className="az-btn-secondary px-4 py-2 text-sm">
                Cancelar
              </button>
              <button type="submit" disabled={addTaskMutation.isPending} className="az-btn-primary px-6 py-2 text-sm">
                {addTaskMutation.isPending ? 'Creando...' : 'Guardar tarea'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  const quickViewLabels: Record<typeof quickLists[number]['id'], string> = {
    inbox: 'Inbox',
    today: 'Today',
    upcoming: 'Upcoming',
    anytime: 'Anytime',
    someday: 'Someday',
    logbook: 'Logbook',
  }
  const quickViewDescriptions: Record<QuickViewId, string> = {
    inbox: 'Capture loose ideas and tasks that still need a home.',
    today: 'Focus on everything due today plus anything that slipped through.',
    upcoming: 'See what is planned for the next days and weeks.',
    anytime: 'Tasks without a date live here until you schedule them.',
    someday: 'A parking lot for ideas you want to revisit later.',
    logbook: 'A record of everything you have finished.',
  }

  const selectedProject = selectedProjectId ? projects.find(project => project.id === selectedProjectId) : null
  const selectedArea = selectedAreaId ? areas.find(area => area.id === selectedAreaId) : null
  const completedCount = filteredTasks.filter(task => task.status === 'done').length
  const activeFilters = useMemo(
    () => buildActiveFilters(selectedProjectId, projects, selectedLabelIds, labels, selectedAreaId, areas),
    [selectedProjectId, projects, selectedLabelIds, labels, selectedAreaId, areas]
  )
  const filteredViewActive = isFilteredView(
    activeQuickView,
    searchQuery,
    selectedProjectId,
    selectedLabelIds,
    selectedAreaId
  )

  const friendlyToday = useMemo(() => {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [])

  const isMobileDetail = isMobile && !showMobileHome
  const mobileProject = mobileProjectFocusId ? projects.find(project => project.id === mobileProjectFocusId) : null
  const isMobileProjectView = isMobileDetail && !!mobileProject
  const visibleMobileTasks = isMobileDetail ? filteredTasks.slice(0, mobileTaskLimit) : filteredTasks
  const canShowMoreMobileTasks = isMobileDetail && mobileTaskLimit < filteredTasks.length
  const quickViewGroups = useMemo(() => {
    if (selectedProjectId || selectedAreaId) {
      return []
    }
    const groups = new Map<
      string,
      {
        areaId: string | null
        area: Area | null
        projects: Map<string, { project: Project | null; tasks: Task[] }>
        standalone: Task[]
      }
    >()

    filteredTasks.forEach(task => {
      const areaKey = task.area_id || 'none'
      if (!groups.has(areaKey)) {
        groups.set(areaKey, {
          areaId: task.area_id || null,
          area: task.area_id ? areas.find(area => area.id === task.area_id) || null : null,
          projects: new Map(),
          standalone: [],
        })
      }
      const group = groups.get(areaKey)!
      if (task.project_id) {
        if (!group.projects.has(task.project_id)) {
          const project = projects.find(project => project.id === task.project_id) || null
          group.projects.set(task.project_id, { project, tasks: [] })
        }
        group.projects.get(task.project_id)!.tasks.push(task)
      } else {
        group.standalone.push(task)
      }
    })

    return Array.from(groups.values())
  }, [filteredTasks, selectedProjectId, selectedAreaId, areas, projects])
  const projectChipOptions = useMemo(() => {
    if (!selectedProject) {
      return []
    }
    const labelMap = new Map<string, TaskLabelSummary>()
    filteredTasks.forEach(task => {
      (task.labels || []).forEach(label => {
        if (!labelMap.has(label.id)) {
          labelMap.set(label.id, label)
        }
      })
    })
    return Array.from(labelMap.values())
  }, [filteredTasks, selectedProject])
  const visibleProjectTasks = useMemo(() => {
    if (!selectedProject) {
      return filteredTasks
    }
    if (activeProjectFilterChip === 'important') {
      return filteredTasks.filter(task => (task.priority || 0) >= 2)
    }
    return filteredTasks
  }, [filteredTasks, selectedProject, activeProjectFilterChip])

  useEffect(() => {
    if (isMobileDetail) {
      setMobileTaskLimit(6)
    }
  }, [isMobileDetail, activeQuickView, selectedProjectId, selectedLabelIds, searchQuery])

  useEffect(() => {
    if (isMobileDetail && isSearchFocused && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [isMobileDetail, isSearchFocused])
  useEffect(() => {
    if (selectedLabelIds.length === 0) {
      if (activeProjectFilterChip !== 'all' && activeProjectFilterChip !== 'important') {
        setActiveProjectFilterChip('all')
      }
      return
    }
    const first = selectedLabelIds[0]
    if (activeProjectFilterChip !== first) {
      setActiveProjectFilterChip(first)
    }
  }, [selectedLabelIds, activeProjectFilterChip])
  useEffect(() => {
    if (showQuickHeadingForm && !selectedProjectId) {
      setShowQuickHeadingForm(false)
    }
    if (!showQuickHeadingForm) {
      setNewHeadingName('')
    }
  }, [selectedProjectId, showQuickHeadingForm])

  const suggestionResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }
    const query = searchQuery.toLowerCase()
    return tasks
      .filter(task => {
        const titleMatch = task.title.toLowerCase().includes(query)
        const notesMatch = task.notes ? task.notes.toLowerCase().includes(query) : false
        return titleMatch || notesMatch
      })
      .slice(0, 6)
  }, [searchQuery, tasks])

  const showSuggestionPanel = isSearchFocused && searchQuery.trim().length > 0

  const handleSearchFocus = () => {
    if (searchBlurTimeout.current) {
      clearTimeout(searchBlurTimeout.current)
      searchBlurTimeout.current = null
    }
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    searchBlurTimeout.current = setTimeout(() => {
      setIsSearchFocused(false)
    }, 120)
  }

  const handleMobileHomeSearchFocus = () => {
    setShowMobileHome(false)
    handleSearchFocus()
  }

  const handleSuggestionSelect = (task: Task) => {
    setSearchQuery(task.title)
    setActiveQuickView('inbox')
    setSelectedProjectId(task.project_id || null)
    setSelectedAreaId(task.area_id || null)
    setSelectedLabelIds([])
    setIsSearchFocused(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  const formatDateForLabel = (value: string) => {
    if (!value) {
      return 'Sin fecha'
    }
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Sin fecha'
    }
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const openDatePicker = (target: 'new' | 'edit') => {
    const rawValue = target === 'new' ? newTaskDueAt : editingDueAt
    if (rawValue) {
      const [year, month, day] = rawValue.split('-').map(Number)
      if (year && month) {
        setDatePickerMonth(new Date(year, month - 1, day || 1))
      } else {
        setDatePickerMonth(new Date())
      }
    } else {
      setDatePickerMonth(new Date())
    }
    setDatePickerTarget(target)
  }

  const closeDatePicker = () => {
    setDatePickerTarget(null)
  }

  const applyPickedDate = (value: string | null) => {
    const normalized = value || ''
    if (datePickerTarget === 'new') {
      setNewTaskDueAt(normalized)
      const nextView = determineViewFromDate(normalized, newTaskView)
      setNewTaskView(nextView)
      setNewTaskStatus(nextView === 'anytime' ? 'snoozed' : 'open')
    } else if (datePickerTarget === 'edit') {
      setEditingDueAt(normalized)
    }
    setDatePickerTarget(null)
  }

  const handleDatePickerMonthChange = (offset: number) => {
    setDatePickerMonth(prev => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + offset)
      return next
    })
  }


  const renderNewAreaModal = () => {
    if (!showNewArea) {
      return null
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Nueva área</p>
              <p className="text-2xl font-semibold text-slate-900">Organiza tus espacios</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewArea(false)
                setNewAreaName('')
              }}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddArea} className="space-y-3">
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="Nombre del área"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewArea(false)
                  setNewAreaName('')
                }}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={addAreaMutation.isPending}
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
              >
                {addAreaMutation.isPending ? 'Guardando...' : 'Crear área'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }
  const renderNewProjectModal = () => {
    if (!showNewProject) {
      return null
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Nuevo proyecto</p>
              <p className="text-2xl font-semibold text-slate-900">Da forma a un objetivo</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowNewProject(false)
                setNewProjectName('')
                setNewProjectAreaId(null)
              }}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddProject} className="space-y-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nombre del proyecto"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
            <select
              value={newProjectAreaId || ''}
              onChange={(e) => setNewProjectAreaId(e.target.value || null)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            >
              <option value="">Sin área</option>
              {areas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewProject(false)
                  setNewProjectName('')
                  setNewProjectAreaId(null)
                }}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={addProjectMutation.isPending}
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
              >
                {addProjectMutation.isPending ? 'Guardando...' : 'Crear proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const renderQuickHeadingForm = () => {
    if (!showQuickHeadingForm) {
      return null
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={() => setShowQuickHeadingForm(false)}>
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Nueva sección</p>
              <p className="text-2xl font-semibold text-slate-900">Agrupa tus tareas</p>
            </div>
            <button
              type="button"
              onClick={() => setShowQuickHeadingForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddHeading} className="space-y-3">
            <input
              type="text"
              value={newHeadingName}
              onChange={(e) => setNewHeadingName(e.target.value)}
              placeholder="Nombre de la sección"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickHeadingForm(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedProjectId || addHeadingMutation.isPending}
                className="px-5 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg disabled:opacity-60"
              >
                {addHeadingMutation.isPending ? 'Guardando...' : 'Crear sección'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const renderActiveFilterChips = () => {
    if (activeFilters.length === 0) {
      return null
    }
    return (
      <div className={`flex flex-wrap gap-2 ${isMobileDetail ? 'px-1' : ''}`}>
        {activeFilters.map(filter => (
          <span key={filter.key} className="az-pill">
            {filter.label}
            <button
              type="button"
              onClick={() => {
                if (filter.type === 'project') {
                  setSelectedProjectId(null)
                } else if (filter.type === 'area') {
                  setSelectedAreaId(null)
                } else {
                  setSelectedLabelIds(prev => prev.filter(id => id !== filter.referenceId))
                }
              }}
              className="text-xs font-bold"
              style={{ color: 'var(--color-primary-600)' }}
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    )
  }

  const renderErrorBanner = () => {
    if (!error) {
      return null
    }
    return (
      <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
        {error}
      </div>
    )
  }

  const renderTaskBody = (variant: 'desktop' | 'mobile', taskSource?: Task[], showEmptyState = true) => {
    const defaultTasks = variant === 'mobile' ? visibleMobileTasks : filteredTasks
    const tasksToRender = taskSource ?? defaultTasks
    const loadingClass = variant === 'mobile' ? 'p-6 text-center text-slate-500' : 'p-10 text-center text-slate-500'
    if (isLoading && showEmptyState && !taskSource) {
      return <div className={loadingClass}>Cargando tareas...</div>
    }
    if (tasksToRender.length === 0) {
      if (!showEmptyState) {
        return null
      }
      return (
        <div className={loadingClass}>
          {filteredViewActive
            ? 'No hay tareas que coincidan con tu vista actual.'
            : 'No hay tareas todavía. ¡Crea la primera!'}
        </div>
      )
    }

    return (
      <>
        <ul className={variant === 'mobile' ? 'flex flex-col gap-4' : 'divide-y divide-slate-100'}>
          {tasksToRender.map(task => {
            const taskProject = projects.find(p => p.id === task.project_id)
            const taskArea = task.area_id ? areas.find(area => area.id === task.area_id) : null
            const taskHeading = task.heading_id ? projectHeadings.find(heading => heading.id === task.heading_id) : null
            const baseLiClass =
              variant === 'mobile'
                ? 'p-4 rounded-3xl border border-slate-100 bg-white shadow-sm'
                : 'px-6 py-5'
            const titleClass = variant === 'mobile' ? 'text-lg font-semibold' : 'font-semibold text-base'
            const metaClass =
              variant === 'mobile'
                ? 'flex flex-wrap items-center gap-2 text-sm'
                : 'flex flex-wrap items-center gap-3'
            const checkboxClass =
              variant === 'mobile'
                ? `mt-1 h-7 w-7 rounded-2xl border-2 flex items-center justify-center transition ${
                    task.status === 'done'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 text-transparent'
                  }`
                : `mt-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                    task.status === 'done'
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-slate-300 hover:border-emerald-500'
                  }`

            return (
              <li key={task.id} className={baseLiClass}>
                {editingId === task.id ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      placeholder="Título"
                      autoFocus
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                    />
                    <textarea
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Notas..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none resize-none"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={editingAreaId || ''}
                        onChange={(e) => {
                          const value = e.target.value || null
                          setEditingAreaId(value)
                          if (value && editingProjectId) {
                            const project = projects.find(p => p.id === editingProjectId)
                            if (project?.area_id !== value) {
                              setEditingProjectId(null)
                              setEditingHeadingId(null)
                            }
                          }
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                      >
                        <option value="">Sin área</option>
                        {areas.map(area => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editingProjectId || ''}
                        onChange={(e) => {
                          const value = e.target.value || null
                          setEditingProjectId(value)
                          if (value) {
                            const project = projects.find(project => project.id === value)
                            setEditingAreaId(project?.area_id || null)
                          }
                          setEditingHeadingId(null)
                        }}
                        className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                      >
                        <option value="">Sin proyecto</option>
                        {(editingAreaId ? projects.filter(project => project.area_id === editingAreaId) : projects).map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {editingProjectId && (
                      <select
                        value={editingHeadingId || ''}
                        onChange={(e) => setEditingHeadingId(e.target.value || null)}
                        className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                      >
                        <option value="">Sin sección</option>
                        {projectHeadings
                          .filter(heading => heading.project_id === editingProjectId)
                          .map(heading => (
                            <option key={heading.id} value={heading.id}>
                              {heading.name}
                            </option>
                          ))}
                      </select>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={editingPriority}
                        onChange={(e) => setEditingPriority(Number(e.target.value) as 0 | 1 | 2 | 3)}
                        className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                      >
                        <option value="0">Sin prioridad</option>
                        <option value="1">🟢 Baja</option>
                        <option value="2">🟡 Media</option>
                        <option value="3">🔴 Alta</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => openDatePicker('edit')}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-left text-sm font-medium text-slate-600 hover:border-slate-400"
                      >
                        {formatDateForLabel(editingDueAt)}
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updateTaskMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        {updateTaskMutation.isPending ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:border-slate-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTaskMutation.mutate(task.id)}
                        disabled={toggleTaskMutation.isPending}
                        className={`${checkboxClass} disabled:opacity-50`}
                        aria-label={task.status === 'done' ? 'Marcar como pendiente' : 'Marcar como completada'}
                      >
                        {task.status === 'done' && (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`${metaClass} ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          <p className={titleClass}>{task.title}</p>
                          {taskProject && (
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                              {taskProject.name}
                            </span>
                          )}
                          {!taskProject && taskArea && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Área: {taskArea.name}
                            </span>
                          )}
                          {taskHeading && (
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
                              {taskHeading.name}
                            </span>
                          )}
                          {task.priority && task.priority > 0 && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full border font-medium ${
                                task.priority === 1
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                  : task.priority === 2
                                    ? 'bg-amber-50 border-amber-100 text-amber-600'
                                    : 'bg-rose-50 border-rose-100 text-rose-600'
                              }`}
                            >
                              {task.priority === 1 ? 'Baja' : task.priority === 2 ? 'Media' : 'Alta'}
                            </span>
                          )}
                          {task.due_at && (
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              📅 {new Date(task.due_at).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                        {task.notes && <p className="mt-2 text-sm text-slate-500">{task.notes}</p>}
                        {task.labels && task.labels.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {task.labels.map(label => (
                              <span key={label.id} className="az-pill">
                                {label.name}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 text-xs text-slate-400">
                          Creada el{' '}
                          {new Date(task.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleLabelPicker(task.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                            selectedTaskForLabel === task.id
                              ? 'border-slate-900 text-slate-900'
                              : 'border-slate-200 text-slate-500 hover:border-slate-400'
                          }`}
                        >
                          Etiquetas
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-500 hover:border-slate-400"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          disabled={deleteTaskMutation.isPending}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-rose-200 text-rose-600 hover:border-rose-400 disabled:opacity-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    {labels.length > 0 && (
                      <TaskLabels
                        taskId={task.id}
                        labels={labels}
                        assignedLabels={task.labels || []}
                        onAddLabel={handleAddLabelToTask}
                        onRemoveLabel={handleRemoveLabelFromTask}
                        isOpen={selectedTaskForLabel === task.id}
                        compact={variant === 'mobile'}
                      />
                    )}
                  </>
                )}
              </li>
            )
          })}
        </ul>
        {variant === 'mobile' && canShowMoreMobileTasks && (
          <button
            type="button"
            onClick={handleShowMoreMobileTasks}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600"
          >
            Mostrar más
          </button>
        )}
      </>
    )
  }

  const renderDesktopSearch = () => (
    <div className="relative">
      <div className="az-card az-card--flat p-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, notas o proyecto..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {showSuggestionPanel && (
        <div className="absolute left-0 right-0 mt-3 z-30 drop-shadow-2xl">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
              Coincidencias ({suggestionResults.length})
            </div>
            {suggestionResults.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                Sigue escribiendo para encontrar tareas que coincidan con "{searchQuery}"
              </div>
            ) : (
              <ul className="max-h-72 overflow-auto">
                {suggestionResults.map(task => {
                  const taskProject = projects.find(project => project.id === task.project_id)
                  return (
                    <li key={`suggestion-${task.id}`}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionSelect(task)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{task.title}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-0.5">
                              {taskProject && <span>📁 {taskProject.name}</span>}
                              {task.due_at && (
                                <span>
                                  📅 {new Date(task.due_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              {task.notes && <span className="truncate max-w-[200px]">{task.notes}</span>}
                            </div>
                          </div>
                          {task.priority > 0 && (
                            <span className="text-xs text-slate-500">
                              {task.priority === 1 ? 'Baja' : task.priority === 2 ? 'Media' : 'Alta'}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
                <li>
                  <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-500">
                    Presiona Enter para buscar "{searchQuery}"
                  </div>
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderMobileSearch = () => (
    <div className="bg-white rounded-3xl border border-slate-100 shadow px-4 py-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        <input
          ref={mobileSearchInputRef}
          type="text"
          value={searchQuery}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tareas..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )

  const renderDesktopHeader = () => {
    const contextLabel = selectedProject ? 'Proyecto' : selectedArea ? 'Área' : 'Vista'
    const contextTitle = selectedProject ? selectedProject.name : selectedArea ? selectedArea.name : currentQuickView.label
    const areaTaskSummary = selectedArea ? areaStats.get(selectedArea.id) : null
    const contextDescription = selectedProject
      ? selectedArea
        ? `Ubicado en ${selectedArea.name}`
        : 'Sin área asignada'
      : selectedArea
        ? `${projects.filter(project => project.area_id === selectedArea.id).length} proyecto(s) · ${areaTaskSummary?.total || 0} tareas`
        : quickViewDescriptions[activeQuickView]
    const pendingCount = selectedProject
      ? visibleProjectTasks.filter(task => task.status !== 'done').length
      : filteredTasks.filter(task => task.status !== 'done').length
    const overdueCount = selectedProject
      ? visibleProjectTasks.filter(task => isTaskOverdue(task)).length
      : filteredTasks.filter(task => isTaskOverdue(task)).length
    const chipItems = [
      { id: 'all', label: 'All' },
      { id: 'important', label: 'Important' },
      ...projectChipOptions.map(label => ({ id: label.id, label: label.name })),
    ]

    return (
      <header className="rounded-[32px] border border-slate-100 bg-white shadow px-8 py-6 space-y-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{contextLabel}</p>
            <h1 className="text-3xl font-semibold text-slate-900">{contextTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{contextDescription}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Pendientes</p>
            <p className="text-2xl font-semibold text-slate-900">{pendingCount}</p>
            {overdueCount > 0 && <p className="text-xs text-rose-500">{overdueCount} vencida(s)</p>}
          </div>
        </div>
        {selectedProject && (
          <div className="flex flex-wrap gap-2">
            {chipItems.map(chip => {
              const isActive = activeProjectFilterChip === chip.id
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleProjectChipSelect(chip.id as 'all' | 'important' | string)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                    isActive ? 'bg-slate-900 text-white border-slate-900 shadow' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {chip.label}
                </button>
              )
            })}
          </div>
        )}
      </header>
    )
  }


  const renderQuickViewBoard = () => {
    if (isLoading && filteredTasks.length === 0) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-slate-500">Cargando tareas...</div>
        </div>
      )
    }
    if (filteredTasks.length === 0) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-slate-500">
            {filteredViewActive ? 'No hay tareas que coincidan con tu vista actual.' : 'No hay tareas todavía. ¡Crea la primera!'}
          </div>
        </div>
      )
    }
    return (
      <div className="az-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--color-primary-500)' }}>
              Vista
            </p>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-primary-700)' }}>
              {quickViewLabels[activeQuickView]}
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            {completedCount} / {filteredTasks.length} completadas
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {quickViewGroups.map(group => (
            <section key={group.areaId || 'sin-area'} className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Área</p>
                  <p className="text-base font-semibold text-slate-800">{group.area?.name || 'Sin área'}</p>
                </div>
                {group.areaId && (
                  <button type="button" onClick={() => handleSelectArea(group.areaId!)} className="az-btn-secondary px-3 py-1 text-xs">
                    Ver área
                  </button>
                )}
              </div>
              {Array.from(group.projects.values()).map(projectGroup => (
                <div key={projectGroup.project?.id || 'proyecto-independiente'} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
                      <p className="text-sm font-semibold text-slate-800">{projectGroup.project?.name || 'Sin proyecto'}</p>
                    </div>
                    {projectGroup.project && (
                      <button
                        type="button"
                        onClick={() => handleSelectProject(projectGroup.project!.id)}
                        className="az-btn-secondary px-3 py-1 text-xs"
                      >
                        Abrir
                      </button>
                    )}
                  </div>
                  {renderTaskBody('desktop', projectGroup.tasks, false)}
                </div>
              ))}
              {group.standalone.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Tareas sin proyecto</p>
                  {renderTaskBody('desktop', group.standalone, false)}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    )
  }

  const renderProjectBoard = () => {
    if (!selectedProject) {
      return null
    }
    const headingsForProject = projectHeadings.filter(heading => heading.project_id === selectedProject.id)
    const tasksByHeading = new Map<string, Task[]>()
    visibleProjectTasks.forEach(task => {
      const key = task.heading_id || 'unassigned'
      if (!tasksByHeading.has(key)) {
        tasksByHeading.set(key, [])
      }
      tasksByHeading.get(key)!.push(task)
    })
    const unassignedTasks = tasksByHeading.get('unassigned') || []

    return (
      <div className="az-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
            <h2 className="text-lg font-semibold text-slate-800">{selectedProject.name}</h2>
            {selectedArea && <p className="text-sm text-slate-500">Área: {selectedArea.name}</p>}
          </div>
          <span className="text-sm text-slate-500">
            {completedCount} / {visibleProjectTasks.length} completadas
          </span>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Secciones</p>
              <form onSubmit={handleAddHeading} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newHeadingName}
                  onChange={(e) => setNewHeadingName(e.target.value)}
                  placeholder="Nueva sección"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
                <button type="submit" className="az-btn-secondary px-3 py-1 text-xs" disabled={addHeadingMutation.isPending}>
                  {addHeadingMutation.isPending ? '...' : 'Añadir'}
                </button>
              </form>
            </div>
            <div className="space-y-2">
              {headingsForProject.length === 0 && <p className="text-sm text-slate-500">Aún no hay secciones para este proyecto.</p>}
              {headingsForProject.map(heading => (
                <div
                  key={heading.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border border-white bg-white"
                >
                  {headingEditingId === heading.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSaveHeadingEdit()
                      }}
                      className="flex-1 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={headingEditingName}
                        onChange={(e) => setHeadingEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      />
                      <button type="submit" className="az-btn-primary px-3 py-1 text-xs" disabled={updateHeadingMutation.isPending}>
                        Guardar
                      </button>
                      <button type="button" onClick={handleCancelHeadingEdit} className="az-btn-secondary px-3 py-1 text-xs">
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{heading.name}</p>
                        <p className="text-xs text-slate-400">
                          {(tasksByHeading.get(heading.id)?.length || 0)} tarea
                          {tasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditHeading(heading.id, heading.name)}
                          className="p-1 rounded-full text-xs text-slate-500 hover:text-slate-800"
                          title="Renombrar"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteHeading(heading.id)}
                          className="p-1 rounded-full text-xs text-rose-500 hover:text-rose-700"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          {headingsForProject.map(heading => (
            <section key={heading.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Sección</p>
                  <p className="text-base font-semibold text-slate-800">{heading.name}</p>
                  <p className="text-xs text-slate-400">
                    {(tasksByHeading.get(heading.id)?.length || 0)} tarea
                    {tasksByHeading.get(heading.id)?.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              {renderTaskBody('desktop', tasksByHeading.get(heading.id) || [], false)}
            </section>
          ))}
          {unassignedTasks.length > 0 && (
            <section className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Tareas sin sección</p>
              {renderTaskBody('desktop', unassignedTasks, false)}
            </section>
          )}
        </div>
      </div>
    )
  }

  const renderAreaBoard = () => {
    if (!selectedArea) {
      return null
    }
    const projectsInArea = projects.filter(project => project.area_id === selectedArea.id)
    const tasksByProject = new Map<string, Task[]>()
    filteredTasks.forEach(task => {
      const key = task.project_id || 'loose'
      if (!tasksByProject.has(key)) {
        tasksByProject.set(key, [])
      }
      tasksByProject.get(key)!.push(task)
    })
    const looseTasks = tasksByProject.get('loose') || []

    return (
      <div className="az-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Área</p>
            <h2 className="text-lg font-semibold text-slate-800">{selectedArea.name}</h2>
            <p className="text-sm text-slate-500">
              {projectsInArea.length} proyecto{projectsInArea.length === 1 ? '' : 's'}
            </p>
          </div>
          <span className="text-sm text-slate-500">
            {completedCount} / {filteredTasks.length} completadas
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {projectsInArea.map(project => (
            <section key={project.id} className="px-6 py-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Proyecto</p>
                  <p className="text-base font-semibold text-slate-800">{project.name}</p>
                </div>
                <button type="button" onClick={() => handleSelectProject(project.id)} className="az-btn-secondary px-3 py-1 text-xs">
                  Abrir
                </button>
              </div>
              {renderTaskBody('desktop', tasksByProject.get(project.id) || [], false)}
            </section>
          ))}
          {looseTasks.length > 0 && (
            <section className="px-6 py-5 space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">Tareas sin proyecto</p>
              {renderTaskBody('desktop', looseTasks, false)}
            </section>
          )}
        </div>
      </div>
    )
  }

  const renderDesktopTaskBoard = () => {
    if (selectedProject) {
      return renderProjectBoard()
    }
    if (selectedArea) {
      return renderAreaBoard()
    }
    return renderQuickViewBoard()
  }

  const renderMobileHeader = () => (
    <header className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={handleMobileBack}
          className="text-2xl text-slate-500 pl-1"
          aria-label="Volver"
        >
          ←
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {isMobileProjectView ? 'Proyecto' : selectedArea ? 'Área' : 'Vista'}
          </p>
          <p className="text-2xl font-semibold text-slate-800">
            {isMobileProjectView
              ? mobileProject?.name || 'Proyecto'
              : selectedArea
                ? selectedArea.name
                : currentQuickView.label}
          </p>
          <p className={`text-sm text-slate-500 ${isMobileProjectView ? '' : 'capitalize'}`}>
            {isMobileProjectView
              ? `${filteredTasks.length} tarea${filteredTasks.length === 1 ? '' : 's'} en este proyecto`
              : selectedArea
                ? `${projects.filter(project => project.area_id === selectedArea.id).length} proyecto(s)`
                : friendlyToday}
          </p>
        </div>
        <button className="text-2xl text-slate-400 pr-1" aria-label="Más opciones">
          ⋯
        </button>
      </div>
      <div className="rounded-3xl bg-white border border-slate-100 shadow px-5 py-4 space-y-2">
        {isMobileProjectView ? (
          <>
            <p className="text-sm text-slate-600">
              Añade notas o info clave para mantener el proyecto alineado.
            </p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Pendientes: {filteredTasks.filter(task => task.status !== 'done').length}</span>
              <span>
                {completedCount}/{filteredTasks.length} completadas
              </span>
            </div>
          </>
        ) : selectedArea ? (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">Área activa</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTasks.length} completadas
            </p>
            <p className="text-sm text-slate-500">
              {projects.filter(project => project.area_id === selectedArea.id).length} proyecto(s) asociados
            </p>
          </>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-slate-400">En esta vista</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedCount}/{filteredTasks.length} completadas
            </p>
            <p className="text-sm text-slate-500">
              {selectedProject ? `Proyecto activo: ${selectedProject.name}` : 'Sin proyecto destacado'}
            </p>
          </>
        )}
      </div>
    </header>
  )

  const renderMobileTaskBoard = () => (
    <div className="space-y-4">
      {renderTaskBody('mobile')}
    </div>
  )

  const renderMobileFab = () => (
    <button
      type="button"
      onClick={handleOpenTaskModal}
      className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-[var(--color-primary-600)] text-white text-3xl shadow-2xl flex items-center justify-center"
      aria-label="Crear tarea"
    >
      +
    </button>
  )

  const renderDesktopDock = () => (
    <div className="hidden lg:flex fixed inset-x-0 bottom-6 justify-center pointer-events-none">
      <div className="az-dock px-6 py-3 flex items-center gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={handleOpenTaskModal}
          className="h-12 w-12 rounded-full bg-[var(--color-primary-600)] text-white text-2xl shadow-xl flex items-center justify-center"
          aria-label="Crear tarea"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => setShowQuickHeadingForm(true)}
          disabled={!selectedProjectId}
          className="h-12 w-12 rounded-full border border-slate-200 text-xl text-slate-600 hover:border-slate-300 disabled:opacity-40"
          aria-label="Nueva sección"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={() => openDatePicker('new')}
          className="h-12 w-12 rounded-full border border-slate-200 text-lg text-slate-600 hover:border-slate-300"
          aria-label="Elegir fecha"
        >
          📅
        </button>
      </div>
    </div>
  )

  const renderDatePickerOverlay = () => {
    if (!datePickerTarget) {
      return null
    }

    const selectedValue = datePickerTarget === 'new' ? newTaskDueAt : editingDueAt
    const monthLabel = datePickerMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

    const buildCalendarDays = () => {
      const firstDay = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth(), 1)
      const startOffset = (firstDay.getDay() + 6) % 7
      const cursor = new Date(firstDay)
      cursor.setDate(firstDay.getDate() - startOffset)
      const days = []
      for (let i = 0; i < 42; i++) {
        const current = new Date(cursor)
        current.setDate(cursor.getDate() + i)
        const iso = current.toISOString().slice(0, 10)
        days.push({
          iso,
          label: current.getDate(),
          inMonth: current.getMonth() === datePickerMonth.getMonth(),
          isToday: iso === todayISO,
          isSelected: selectedValue ? iso === selectedValue : false,
        })
      }
      return days
    }

    const weekendDate = new Date(todayISO)
    const dayOfWeek = weekendDate.getDay()
    const daysUntilWeekend = dayOfWeek === 6 ? 0 : 6 - dayOfWeek
    weekendDate.setDate(weekendDate.getDate() + daysUntilWeekend)
    const weekendISO = weekendDate.toISOString().slice(0, 10)
    const nextWeekDate = new Date(todayISO)
    nextWeekDate.setDate(nextWeekDate.getDate() + 7)
    const nextWeekISO = nextWeekDate.toISOString().slice(0, 10)

    const quickOptions = [
      { id: 'today', label: 'Hoy', value: todayISO },
      { id: 'tomorrow', label: 'Mañana', value: tomorrowISO },
      { id: 'weekend', label: 'Este fin', value: weekendISO },
      { id: 'nextweek', label: 'Próxima semana', value: nextWeekISO },
      { id: 'clear', label: 'Sin fecha', value: '' },
    ]

    const calendarDays = buildCalendarDays()

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        onClick={closeDatePicker}
      >
        <div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {datePickerTarget === 'new' ? 'Fecha para nueva tarea' : 'Actualizar vencimiento'}
              </p>
              <p className="text-lg font-semibold text-slate-800 capitalize">{monthLabel}</p>
            </div>
            <button
              type="button"
              onClick={closeDatePicker}
              className="text-slate-400 hover:text-slate-600 text-xl"
              aria-label="Cerrar selector de fecha"
            >
              ✕
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {quickOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => applyPickedDate(option.value || null)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    selectedValue === option.value
                      ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-[var(--color-primary-100)]'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDatePickerMonthChange(-1)}
                className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-slate-400"
                aria-label="Mes anterior"
              >
                ←
              </button>
              <span className="text-sm font-semibold text-slate-600 capitalize">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={() => handleDatePickerMonthChange(1)}
                className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-slate-400"
                aria-label="Mes siguiente"
              >
                →
              </button>
            </div>
            <div>
              <div className="grid grid-cols-7 text-center text-xs uppercase text-slate-400 tracking-wide mb-2">
                {weekdays.map(day => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map(day => (
                  <button
                    key={day.iso}
                    type="button"
                    onClick={() => applyPickedDate(day.iso)}
                    className={`py-2 rounded-2xl text-sm font-semibold transition ${
                      day.isSelected
                        ? 'bg-[var(--color-primary-600)] text-white'
                        : day.isToday
                          ? 'border border-[var(--color-primary-200)] text-[var(--color-primary-600)]'
                          : day.inMonth
                            ? 'text-slate-700 hover:bg-slate-100'
                            : 'text-slate-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {selectedValue ? `Seleccionada: ${formatDateForLabel(selectedValue)}` : 'Sin fecha asignada'}
              </span>
              <button
                type="button"
                onClick={() => applyPickedDate('')}
                className="text-[var(--color-primary-600)] font-semibold"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mutación para agregar tarea
  const addTaskMutation = useMutation({
    mutationFn: (args: {
      title: string
      notes: string
      priority: number
      due_at: string
      status: 'open' | 'done' | 'snoozed'
      project_id: string | null
      area_id: string | null
      heading_id: string | null
    }) =>
      addTask(
        args.title,
        args.notes || undefined,
        args.priority,
        args.due_at || undefined,
        args.status,
        args.project_id,
        args.area_id,
        args.heading_id
      ),
    onSuccess: async (result) => {
      if (result.success) {
        const labelsToAssign = [...newTaskLabelIds]
        setNewTaskTitle('')
        setNewTaskNotes('')
        setNewTaskPriority(0)
        setNewTaskDueAt('')
        setNewTaskStatus('open')
        setNewTaskProjectId(null)
        setNewTaskAreaId(null)
        setNewTaskHeadingId(null)
        setNewTaskLabelIds([])
        setNewTaskView('inbox')
        setError('')
        setIsTaskModalOpen(false)
        if (result.task && labelsToAssign.length > 0) {
          const responses = await Promise.all(labelsToAssign.map(labelId => addTaskLabel(result.task!.id, labelId)))
          const failed = responses.find(response => !response.success)
          if (failed) {
            setError(failed.error || 'Algunas etiquetas no se pudieron asignar')
          }
        }
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al crear tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al crear tarea')
    },
  })

  // Mutación para actualizar tarea
  const updateTaskMutation = useMutation({
    mutationFn: (taskId: string) =>
      updateTask(taskId, {
        title: editingTitle,
        notes: editingNotes,
        priority: editingPriority,
        due_at: editingDueAt || null,
        project_id: editingProjectId || null,
        area_id: editingAreaId || null,
        heading_id: editingHeadingId || null,
      }),
    onSuccess: (result) => {
      if (result.success) {
        setEditingId(null)
        setEditingTitle('')
        setEditingNotes('')
        setEditingPriority(0)
        setEditingDueAt('')
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al actualizar tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al actualizar tarea')
    },
  })

  // Mutación para cambiar estado de tarea
  const toggleTaskMutation = useMutation({
    mutationFn: (taskId: string) => toggleTaskStatus(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al cambiar estado')
      }
    },
    onError: () => {
      setError('Error inesperado al cambiar estado')
    },
  })

  // Mutación para eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al eliminar tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al eliminar tarea')
    },
  })

  // Mutaciones para áreas
  const addAreaMutation = useMutation({
    mutationFn: (name: string) => addArea(name),
    onSuccess: (result) => {
      if (result.success) {
        setNewAreaName('')
        setShowNewArea(false)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['areas'] })
      } else {
        setError(result.error || 'Error al crear área')
      }
    },
    onError: () => {
      setError('Error inesperado al crear área')
    },
  })

  // Mutación para agregar proyecto
  const addProjectMutation = useMutation({
    mutationFn: ({ name, areaId }: { name: string; areaId: string | null }) => addProject(name, '#3b82f6', areaId),
    onSuccess: (result) => {
      if (result.success) {
        setNewProjectName('')
        setNewProjectAreaId(null)
        setShowNewProject(false)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['projects'] })
      } else {
        setError(result.error || 'Error al crear proyecto')
      }
    },
    onError: () => {
      setError('Error inesperado al crear proyecto')
    },
  })

  // Mutaciones para headings
  const addHeadingMutation = useMutation({
    mutationFn: ({ projectId, name }: { projectId: string; name: string }) => addProjectHeading(projectId, name),
    onSuccess: (result) => {
      if (result.success) {
        setNewHeadingName('')
        setShowQuickHeadingForm(false)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['project-headings'] })
      } else {
        setError(result.error || 'Error al crear sección')
      }
    },
    onError: () => {
      setError('Error inesperado al crear sección')
    },
  })

  const updateHeadingMutation = useMutation({
    mutationFn: ({ headingId, name }: { headingId: string; name: string }) =>
      updateProjectHeading(headingId, { name: name.trim() }),
    onSuccess: (result) => {
      if (result.success) {
        setHeadingEditingId(null)
        setHeadingEditingName('')
        setError('')
        queryClient.invalidateQueries({ queryKey: ['project-headings'] })
      } else {
        setError(result.error || 'Error al actualizar sección')
      }
    },
    onError: () => {
      setError('Error inesperado al actualizar sección')
    },
  })

  const deleteHeadingMutation = useMutation({
    mutationFn: (headingId: string) => deleteProjectHeading(headingId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['project-headings'] })
      } else {
        setError(result.error || 'Error al eliminar sección')
      }
    },
    onError: () => {
      setError('Error inesperado al eliminar sección')
    },
  })

  const addInlineLabelMutation = useMutation({
    mutationFn: (name: string) => addLabel(name),
    onSuccess: (result) => {
      if (result.success && result.label) {
        const createdLabel = result.label
        setError('')
        setInlineLabelName('')
        setNewTaskLabelIds(prev => (prev.includes(createdLabel.id) ? prev : [...prev, createdLabel.id]))
        queryClient.setQueryData<Label[]>(['labels'], (prev) => {
          if (!prev) {
            return [createdLabel]
          }
          const exists = prev.some(label => label.id === createdLabel.id)
          return exists ? prev : [...prev, createdLabel]
        })
        queryClient.invalidateQueries({ queryKey: ['labels'] })
      } else {
        setError(result.error || 'Error al crear etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al crear etiqueta')
    },
  })

  // Mutación para asignar etiqueta a tarea
  const addTaskLabelMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      addTaskLabel(taskId, labelId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al asignar etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al asignar etiqueta')
    },
  })

  // Mutación para remover etiqueta de tarea
  const removeTaskLabelMutation = useMutation({
    mutationFn: ({ taskId, labelId }: { taskId: string; labelId: string }) =>
      removeTaskLabel(taskId, labelId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al remover etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al remover etiqueta')
    },
  })

  const handleProjectChipSelect = (chipId: 'all' | 'important' | string) => {
    if (chipId === 'all') {
      setSelectedLabelIds([])
      setActiveProjectFilterChip('all')
      return
    }
    if (chipId === 'important') {
      setSelectedLabelIds([])
      setActiveProjectFilterChip('important')
      return
    }
    setSelectedLabelIds([chipId])
    setActiveProjectFilterChip(chipId)
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    addTaskMutation.mutate({
      title: newTaskTitle,
      notes: newTaskNotes,
      priority: newTaskPriority,
      due_at: newTaskDueAt,
      status: newTaskStatus,
      project_id: newTaskProjectId,
      area_id: newTaskAreaId,
      heading_id: newTaskHeadingId,
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
    setEditingNotes(task.notes || '')
    setEditingPriority((task.priority || 0) as 0 | 1 | 2 | 3)
    setEditingDueAt(task.due_at ? task.due_at.split('T')[0] : '')
    setEditingProjectId(task.project_id || null)
     setEditingAreaId(task.area_id || null)
     setEditingHeadingId(task.heading_id || null)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTitle.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    if (editingId) {
      updateTaskMutation.mutate(editingId)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
    setEditingNotes('')
    setEditingPriority(0)
    setEditingDueAt('')
    setEditingProjectId(null)
    setEditingAreaId(null)
    setEditingHeadingId(null)
  }

  const handleSelectProject = (projectId: string) => {
    if (selectedProjectId === projectId) {
      setSelectedProjectId(null)
      setSelectedAreaId(null)
    } else {
      setSelectedProjectId(projectId)
      const project = projects.find(project => project.id === projectId)
      setSelectedAreaId(project?.area_id || null)
    }
    setActiveQuickView('inbox')
    setActiveProjectFilterChip('all')
    setShowNewListMenu(false)
  }

  const handleSelectArea = (areaId: string) => {
    if (selectedAreaId === areaId) {
      setSelectedAreaId(null)
    } else {
      setSelectedAreaId(areaId)
      setSelectedProjectId(null)
    }
    setActiveQuickView('inbox')
    setActiveProjectFilterChip('all')
    setShowNewListMenu(false)
  }

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) {
      setError('El nombre del proyecto no puede estar vacío')
      return
    }
    addProjectMutation.mutate({
      name: newProjectName.trim(),
      areaId: newProjectAreaId,
    })
  }

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAreaName.trim()) {
      setError('El nombre del área no puede estar vacío')
      return
    }
    addAreaMutation.mutate(newAreaName.trim())
  }

  const handleAddHeading = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Selecciona un proyecto para crear una sección')
      return
    }
    if (!newHeadingName.trim()) {
      setError('El nombre de la sección no puede estar vacío')
      return
    }
    addHeadingMutation.mutate({ projectId: selectedProjectId, name: newHeadingName.trim() })
  }

  const handleStartEditHeading = (headingId: string, name: string) => {
    setHeadingEditingId(headingId)
    setHeadingEditingName(name)
  }

  const handleCancelHeadingEdit = () => {
    setHeadingEditingId(null)
    setHeadingEditingName('')
  }

  const handleSaveHeadingEdit = () => {
    if (!headingEditingId) {
      return
    }
    if (!headingEditingName.trim()) {
      setError('El nombre de la sección no puede estar vacío')
      return
    }
    updateHeadingMutation.mutate({ headingId: headingEditingId, name: headingEditingName.trim() })
  }

  const handleDeleteHeading = (headingId: string) => {
    if (typeof window !== 'undefined') {
      if (!confirm('¿Eliminar esta sección? Las tareas conservarán el heading asignado.')) {
        return
      }
    }
    deleteHeadingMutation.mutate(headingId)
  }

  const handleToggleLabelPicker = (taskId: string) => {
    setSelectedTaskForLabel(prev => (prev === taskId ? null : taskId))
  }

  const handleAddLabelToTask = (taskId: string, labelId: string) => {
    addTaskLabelMutation.mutate({ taskId, labelId })
  }

  const handleRemoveLabelFromTask = (taskId: string, labelId: string) => {
    removeTaskLabelMutation.mutate({ taskId, labelId })
  }

  const handleShowMoreMobileTasks = () => {
    setMobileTaskLimit(prev => Math.min(prev + 5, filteredTasks.length))
  }

  const handleMobileBack = () => {
    if (mobileProjectFocusId) {
      setMobileProjectFocusId(null)
      setSelectedProjectId(null)
    }
    setSelectedAreaId(null)
    setShowMobileHome(true)
    setIsSearchFocused(false)
  }

  const handleOpenTaskModal = () => {
    const defaultView = activeQuickView === 'logbook' ? 'inbox' : activeQuickView
    setNewTaskProjectId(selectedProjectId)
    if (selectedProjectId) {
      const project = projects.find(project => project.id === selectedProjectId)
      setNewTaskAreaId(project?.area_id || null)
    } else if (selectedAreaId) {
      setNewTaskAreaId(selectedAreaId)
    } else {
      setNewTaskAreaId(null)
    }
    setNewTaskHeadingId(null)
    setNewTaskLabelIds([])
    applyViewPreset(defaultView)
    setIsTaskModalOpen(true)
  }

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false)
    setNewTaskLabelIds([])
  }

  const handleLogout = async () => {
    const result = await signOut()
    if (result.success) {
      navigate('/login')
    }
  }


  if (isMobile && showMobileHome) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="max-w-md mx-auto px-4 py-6">{renderMobileHome()}</div>
        {renderTaskModal()}
        {renderDatePickerOverlay()}
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {isMobile ? (
        <>
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
            {renderMobileSearch()}
            {renderMobileHeader()}
            {renderActiveFilterChips()}
            {renderErrorBanner()}
            {renderMobileTaskBoard()}
          </div>
          {renderMobileFab()}
        </>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 py-10 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
              <div className="hidden lg:block">{renderDesktopSidebar()}</div>
              <section className="space-y-6">
                {renderDesktopSearch()}
                {renderDesktopHeader()}
                {renderActiveFilterChips()}
                {renderErrorBanner()}
                {renderDesktopTaskBoard()}
              </section>
            </div>
          </div>
          {renderDesktopDock()}
        </>
      )}
      {renderTaskModal()}
      {renderNewAreaModal()}
      {renderNewProjectModal()}
      {renderQuickHeadingForm()}
      {renderDatePickerOverlay()}
    </main>
  )


}

// Componente auxiliar para mostrar etiquetas de una tarea
function TaskLabels({
  taskId,
  labels,
  assignedLabels,
  isOpen,
  onAddLabel,
  onRemoveLabel,
  compact = false,
}: {
  taskId: string
  labels: Label[]
  assignedLabels: TaskLabelSummary[]
  isOpen: boolean
  onAddLabel: (taskId: string, labelId: string) => void
  onRemoveLabel: (taskId: string, labelId: string) => void
  compact?: boolean
}) {
  if (!isOpen) {
    return null
  }

  const assignedIds = new Set(assignedLabels.map(label => label.id))

  return (
    <div
      className={`${compact ? 'mt-3' : 'ml-9 mt-3'} p-3 rounded-2xl space-y-3`}
      style={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid var(--color-primary-100)' }}
    >
      <div>
        <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-2">Etiquetas asignadas</p>
        {assignedLabels.length === 0 ? (
          <p className="text-xs text-pink-700">La tarea aún no tiene etiquetas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
              {assignedLabels.map(label => (
                <span key={label.id} className="az-pill">
                  {label.name}
                  <button
                    type="button"
                    onClick={() => onRemoveLabel(taskId, label.id)}
                    style={{ color: 'var(--color-primary-600)' }}
                  >
                    ✕
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-pink-800 uppercase tracking-wide mb-2">Agregar etiquetas</p>
        <div className="flex flex-wrap gap-2">
          {labels.map(label => {
            const isAssigned = assignedIds.has(label.id)
            return (
              <button
                key={label.id}
                onClick={() => onAddLabel(taskId, label.id)}
                disabled={isAssigned}
                className="az-pill"
                style={{
                  backgroundColor: isAssigned ? 'var(--color-primary-100)' : 'var(--color-surface)',
                  opacity: isAssigned ? 0.5 : 1,
                  border: '1px solid var(--color-primary-100)',
                  cursor: isAssigned ? 'not-allowed' : 'pointer',
                }}
              >
                {isAssigned ? 'Asignada' : `+ ${label.name}`}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
