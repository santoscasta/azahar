import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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
  deleteLabel,
  addTaskLabel,
  removeTaskLabel,
  getAreas,
  addArea,
  getProjectHeadings,
  addProjectHeading,
  updateProjectHeading,
  deleteProjectHeading,
} from '../lib/supabase.js'
import type { Task, TaskLabelSummary, Label, Area, Project, ProjectHeading } from '../lib/supabase.js'
import {
  buildQuickViewStats,
  filterTasksByQuickView,
  buildActiveFilters,
  isFilteredView,
  normalizeDate,
  getTaskView,
  type QuickViewId,
  type ActiveFilterDescriptor,
} from './tasksSelectors.js'
import { defaultDueForView, determineViewFromDate } from '../lib/scheduleUtils.js'
import { applyTaskFilters } from '../lib/taskFilters.js'
import { useTaskCreation } from '../hooks/useTaskCreation.js'
import { useProjectCreation } from '../hooks/useProjectCreation.js'
import { useAreaCreation } from '../hooks/useAreaCreation.js'
import { MobileCreationSheet } from '../components/mobile/MobileCreationSheet.js'
import { MobileDraftCard } from '../components/mobile/MobileDraftCard.js'
import { MobileScheduleSheet } from '../components/mobile/MobileScheduleSheet.js'
import { buildMobileTaskPayload } from '../lib/mobileDraftUtils.js'
import DesktopSidebar from '../components/sidebar/DesktopSidebar.js'
import MobileHome from '../components/mobile/MobileHome.js'
import MobileHeader from '../components/mobile/MobileHeader.js'
import NewAreaModal from '../components/tasks/NewAreaModal.js'
import NewProjectModal from '../components/tasks/NewProjectModal.js'
import QuickHeadingForm from '../components/tasks/QuickHeadingForm.js'
import ActiveFilterChips from '../components/tasks/ActiveFilterChips.js'
import ErrorBanner from '../components/tasks/ErrorBanner.js'
import TaskCreationModal from '../components/tasks/TaskCreationModal.js'
import DatePickerOverlay from '../components/tasks/DatePickerOverlay.js'
import LabelSheet from '../components/tasks/LabelSheet.js'
import TaskList from '../components/tasks/TaskList.js'
import DesktopSearch from '../components/tasks/DesktopSearch.js'
import QuickViewBoard from '../components/tasks/boards/QuickViewBoard.js'
import AreaBoard from '../components/tasks/boards/AreaBoard.js'
import ProjectBoard from '../components/tasks/boards/ProjectBoard.js'
import MobileOverview from '../components/mobile/MobileOverview.js'

export default function TasksPage() {
  const {
    taskDraft,
    updateTaskDraft,
    setTaskLabels,
    resetTaskDraft,
    isTaskModalOpen,
    openTaskModal,
    closeTaskModal,
    mobileDraftTask,
    updateMobileDraft,
  } = useTaskCreation()
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
  const {
    projectDraft,
    setProjectName,
    setProjectAreaId,
    showProjectModal,
    openProjectModal,
    closeProjectModal,
    resetProjectDraft,
  } = useProjectCreation()
  const {
    areaNameDraft,
    setAreaNameDraft,
    showAreaModal,
    openAreaModal,
    closeAreaModal,
  } = useAreaCreation()
  const [inlineLabelName, setInlineLabelName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [activeQuickView, setActiveQuickView] = useState<QuickViewId>('inbox')
  const [selectedTaskForLabel, setSelectedTaskForLabel] = useState<string | null>(null)
  const [newHeadingName, setNewHeadingName] = useState('')
  const [headingEditingId, setHeadingEditingId] = useState<string | null>(null)
  const [headingEditingName, setHeadingEditingName] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileHome, setShowMobileHome] = useState(true)
  const [mobileProjectFocusId, setMobileProjectFocusId] = useState<string | null>(null)
  const [mobileTaskLimit, setMobileTaskLimit] = useState(6)
  const [datePickerTarget, setDatePickerTarget] = useState<'new' | 'edit' | 'draft' | null>(null)
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date())
  const [activeProjectFilterChip, setActiveProjectFilterChip] = useState<'all' | 'important' | string>('all')
  const [showNewListMenu, setShowNewListMenu] = useState(false)
  const [showQuickHeadingForm, setShowQuickHeadingForm] = useState(false)
  const [showMobileCreationSheet, setShowMobileCreationSheet] = useState(false)
  const [mobileDraftProject, setMobileDraftProject] = useState<{ name: string; areaId: string | null } | null>(null)
  const [mobileDraftArea, setMobileDraftArea] = useState<{ name: string } | null>(null)
  const [labelSheetTarget, setLabelSheetTarget] = useState<'draft-task' | null>(null)
  const [labelSheetSelection, setLabelSheetSelection] = useState<string[]>([])
  const [labelSheetInput, setLabelSheetInput] = useState('')
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
  const searchBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const mobileDraftTaskTitleRef = useRef<HTMLInputElement | null>(null)
  const mobileDraftProjectRef = useRef<HTMLInputElement | null>(null)
  const mobileDraftAreaRef = useRef<HTMLInputElement | null>(null)
  const assignMobileDraftAreaInput = useCallback((node: HTMLInputElement | null) => {
    mobileDraftAreaRef.current = node
  }, [])
  const assignMobileDraftProjectInput = useCallback((node: HTMLInputElement | null) => {
    mobileDraftProjectRef.current = node
  }, [])
  const closeLabelSheet = () => {
    setLabelSheetTarget(null)
    setLabelSheetSelection([])
    setLabelSheetInput('')
  }
  const closeMobileCreationSheet = (preserveDrafts = false) => {
    setShowMobileCreationSheet(false)
    if (!preserveDrafts) {
      setMobileDraftProject(null)
      setMobileDraftArea(null)
    }
  }
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Consulta para obtener tareas con búsqueda y filtros
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const result = await searchTasks()
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

  const { data: projectHeadings = [] } = useQuery<ProjectHeading[]>({
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
      if (matches) {
        setShowMobileHome(true)
      } else {
        setShowMobileHome(false)
        setShowMobileCreationSheet(false)
        updateMobileDraft(() => null)
        setMobileDraftProject(null)
        setMobileDraftArea(null)
      }
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

  useEffect(() => {
    if (mobileDraftTaskTitleRef.current && isMobile && mobileDraftTask) {
      mobileDraftTaskTitleRef.current.focus()
    }
  }, [mobileDraftTask, isMobile])

  useEffect(() => {
    if (mobileDraftProjectRef.current && mobileDraftProject) {
      mobileDraftProjectRef.current.focus()
    }
  }, [mobileDraftProject])

  useEffect(() => {
    if (mobileDraftAreaRef.current && mobileDraftArea) {
      mobileDraftAreaRef.current.focus()
    }
  }, [mobileDraftArea])

  const todayISO = useMemo(() => {
    const now = new Date()
    const month = `${now.getMonth() + 1}`.padStart(2, '0')
    const day = `${now.getDate()}`.padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  }, [])
  const tasksFilteredByQueryAndLabels = useMemo(
    () =>
      applyTaskFilters(tasks, {
        query: searchQuery,
        labelIds: selectedLabelIds.length > 0 ? selectedLabelIds : undefined,
      }),
    [tasks, searchQuery, selectedLabelIds]
  )
  const contextFilteredTasks = useMemo(
    () =>
      applyTaskFilters(tasksFilteredByQueryAndLabels, {
        projectId: selectedProjectId,
        areaId: selectedAreaId,
      }),
    [tasksFilteredByQueryAndLabels, selectedProjectId, selectedAreaId]
  )
  const quickViewStats = useMemo(
    () => buildQuickViewStats(tasksFilteredByQueryAndLabels, todayISO),
    [tasksFilteredByQueryAndLabels, todayISO]
  )
  const quickViewTasks = useMemo(
    () => filterTasksByQuickView(tasksFilteredByQueryAndLabels, activeQuickView, todayISO),
    [tasksFilteredByQueryAndLabels, activeQuickView, todayISO]
  )
  const filteredTasks = useMemo(() => {
    if (selectedProjectId || selectedAreaId) {
      return contextFilteredTasks
    }
    return quickViewTasks
  }, [contextFilteredTasks, quickViewTasks, selectedProjectId, selectedAreaId])
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
    tasksFilteredByQueryAndLabels.forEach(task => {
      if (!isTaskOverdue(task)) {
        return
      }
      const view = getTaskView(task, todayISO)
      base[view] += 1
    })
    return base
  }, [tasksFilteredByQueryAndLabels, todayISO])
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach(project => map.set(project.id, project))
    return map
  }, [projects])
  const projectStats = useMemo(() => {
    const stats = new Map<string, { total: number; overdue: number }>()
    tasksFilteredByQueryAndLabels.forEach(task => {
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
  }, [tasksFilteredByQueryAndLabels, todayISO])
  const areaStats = useMemo(() => {
    const stats = new Map<string, { total: number; overdue: number }>()
    tasksFilteredByQueryAndLabels.forEach(task => {
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
  }, [tasksFilteredByQueryAndLabels, todayISO, projectMap])

  const tomorrowISO = useMemo(() => {
    const todayDate = new Date(todayISO)
    const tomorrow = new Date(todayDate)
    tomorrow.setDate(todayDate.getDate() + 1)
    const month = `${tomorrow.getMonth() + 1}`.padStart(2, '0')
    const day = `${tomorrow.getDate()}`.padStart(2, '0')
    return `${tomorrow.getFullYear()}-${month}-${day}`
  }, [todayISO])
  const applyViewPreset = (view: QuickViewId) => {
    updateTaskDraft('view', view)
    switch (view) {
      case 'today':
        updateTaskDraft('due_at', todayISO)
        updateTaskDraft('status', 'open')
        break
      case 'upcoming': {
        const currentDue = taskDraft.due_at
        const nextDue = currentDue && currentDue > todayISO ? currentDue : tomorrowISO
        updateTaskDraft('due_at', nextDue)
        updateTaskDraft('status', 'open')
        break
      }
      case 'anytime':
        updateTaskDraft('due_at', '')
        updateTaskDraft('status', 'open')
        break
      case 'someday':
        updateTaskDraft('due_at', '')
        updateTaskDraft('status', 'snoozed')
        break
      default:
        updateTaskDraft('due_at', '')
        updateTaskDraft('status', 'open')
    }
  }

  const toggleNewTaskLabel = (labelId: string) => {
    setTaskLabels(prev => (prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]))
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

  const handleMobileAreaNameChange = (value: string) => {
    setMobileDraftArea(prev => (prev ? { ...prev, name: value } : { name: value }))
  }

  const handleMobileAreaNameBlur = (value: string) => {
    if (!value.trim()) {
      setMobileDraftArea({ name: 'Nueva área' })
    }
  }

  const handleCancelMobileAreaDraft = () => setMobileDraftArea(null)

  const handleMobileProjectNameChange = (value: string) => {
    setMobileDraftProject(prev => (prev ? { ...prev, name: value } : { name: value, areaId: null }))
  }

  const handleMobileProjectNameBlur = (value: string) => {
    if (!value.trim()) {
      setMobileDraftProject(prev => (prev ? { ...prev, name: 'Nuevo proyecto' } : prev))
    }
  }

  const handleCancelMobileProjectDraft = () => setMobileDraftProject(null)

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

  const handleRemoveFilter = (filter: ActiveFilterDescriptor) => {
    if (filter.type === 'project') {
      setSelectedProjectId(null)
    } else if (filter.type === 'area') {
      setSelectedAreaId(null)
    } else {
      setSelectedLabelIds(prev => prev.filter(id => id !== filter.referenceId))
    }
  }

  const handleLabelSheetToggle = (labelId: string) => {
    setLabelSheetSelection(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    )
  }

  const handleLabelSheetSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!labelSheetInput.trim()) {
      return
    }
    addLabelMutation.mutate(labelSheetInput.trim(), {
      onSuccess: (result) => {
        const createdLabel = result.label
        if (result.success && createdLabel) {
          setLabelSheetSelection(prev => [...prev, createdLabel.id])
          setLabelSheetInput('')
        } else if (!result.success && result.error) {
          setError(result.error)
        }
      },
    })
  }

  const handleLabelSheetConfirm = () => {
    if (labelSheetTarget === 'draft-task' && mobileDraftTask) {
      updateMobileDraft(prev => (prev ? { ...prev, labelIds: labelSheetSelection } : prev))
    }
    closeLabelSheet()
  }

  const editingState = {
    id: editingId,
    title: editingTitle,
    notes: editingNotes,
    priority: editingPriority,
    dueAt: editingDueAt,
    projectId: editingProjectId,
    areaId: editingAreaId,
    headingId: editingHeadingId,
  }

  const editingHandlers = {
    setTitle: setEditingTitle,
    setNotes: setEditingNotes,
    setPriority: setEditingPriority,
    setAreaId: setEditingAreaId,
    setProjectId: setEditingProjectId,
    setHeadingId: setEditingHeadingId,
  }

  const renderTaskList = (
    variant: 'desktop' | 'mobile',
    tasks: Task[],
    options: {
      showEmptyState?: boolean
      showLoadingState?: boolean
      renderDraftCard?: () => ReactNode
      showDraftCard?: boolean
    } = {}
  ) => (
    <TaskList
      variant={variant}
      tasks={tasks}
      isLoading={isLoading}
      showEmptyState={options.showEmptyState}
      showLoadingState={options.showLoadingState}
      filteredViewActive={filteredViewActive}
      projects={projects}
      areas={areas}
      headings={projectHeadings}
      labels={labels}
      editingState={editingState}
      editingHandlers={editingHandlers}
      onStartEdit={handleEditTask}
      onSaveEdit={handleSaveEdit}
      onCancelEdit={handleCancelEdit}
      onToggleTask={(taskId) => toggleTaskMutation.mutate(taskId)}
      togglePending={toggleTaskMutation.isPending}
      onDeleteTask={(taskId) => deleteTaskMutation.mutate(taskId)}
      deletePending={deleteTaskMutation.isPending}
      selectedTaskForLabel={selectedTaskForLabel}
      onToggleLabelPicker={handleToggleLabelPicker}
      onAddLabel={handleAddLabelToTask}
      onRemoveLabel={handleRemoveLabelFromTask}
      onOpenEditDatePicker={() => openDatePicker('edit')}
      formatDateLabel={formatDateForLabel}
      renderDraftCard={options.renderDraftCard}
      showDraftCard={options.showDraftCard}
    />
  )

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

  const toggleNewListMenu = () => setShowNewListMenu(prev => !prev)

  const handleCreateProjectFromSidebar = () => {
    openProjectModal()
    setShowNewListMenu(false)
  }

  const handleCreateAreaFromSidebar = () => {
    openAreaModal()
    setShowNewListMenu(false)
  }




  const renderTaskModal = () => (
    <TaskCreationModal
      open={isTaskModalOpen}
      isMobile={isMobile}
      draft={taskDraft}
      projects={projects}
      areas={areas}
      headings={projectHeadings}
      labels={labels}
      creationViewOptions={creationViewOptions}
      dueDateLabel={formatDateForLabel(taskDraft.due_at)}
      savingTask={addTaskMutation.isPending}
      savingLabel={addInlineLabelMutation.isPending}
      onClose={handleCloseTaskModal}
      onSubmit={handleAddTask}
      onUpdateDraft={updateTaskDraft}
      onApplyViewPreset={applyViewPreset}
      onRequestDueDate={() => openDatePicker('new')}
      onToggleLabel={toggleNewTaskLabel}
      inlineLabelName={inlineLabelName}
      onInlineLabelNameChange={setInlineLabelName}
      onCreateInlineLabel={handleInlineLabelCreate}
    />
  )
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

  const selectedProject = selectedProjectId ? projects.find(project => project.id === selectedProjectId) ?? null : null
  const selectedArea = selectedAreaId ? areas.find(area => area.id === selectedAreaId) ?? null : null
  const activeTaskCount = filteredTasks.filter(task => task.status !== 'done').length
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
  const mobileProject = mobileProjectFocusId ? projects.find(project => project.id === mobileProjectFocusId) ?? null : null
  const selectedAreaProjectCount = selectedArea ? projects.filter(project => project.area_id === selectedArea.id).length : 0
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
    if (isMobile) {
      setShowMobileHome(true)
    }
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

  const openDatePicker = (target: 'new' | 'edit' | 'draft') => {
    const rawValue =
      target === 'new' ? taskDraft.due_at : target === 'edit' ? editingDueAt : mobileDraftTask?.due_at || ''
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
      updateTaskDraft('due_at', normalized)
      const nextView = determineViewFromDate(normalized, todayISO, taskDraft.view)
      updateTaskDraft('view', nextView)
      updateTaskDraft('status', nextView === 'anytime' ? 'open' : nextView === 'someday' ? 'snoozed' : 'open')
    } else if (datePickerTarget === 'edit') {
      setEditingDueAt(normalized)
    } else if (datePickerTarget === 'draft') {
      updateMobileDraft(prev => (prev ? { ...prev, due_at: normalized || null } : prev))
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



  

  const renderTaskBody = (
    variant: 'desktop' | 'mobile',
    taskSource?: Task[],
    showEmptyState = true,
    options: { showLoadingState?: boolean; renderDraftCard?: () => ReactNode; showDraftCard?: boolean } = {}
  ) => {
    const tasks = taskSource ?? (variant === 'mobile' ? visibleMobileTasks : filteredTasks)
    const showLoadingState = options.showLoadingState ?? !taskSource
    return renderTaskList(variant, tasks, {
      showEmptyState,
      showLoadingState,
      renderDraftCard: options.renderDraftCard,
      showDraftCard: options.showDraftCard,
    })
  }

  const renderDesktopSearch = () => (
    <DesktopSearch
      searchQuery={searchQuery}
      suggestions={suggestionResults}
      projects={projects}
      showSuggestions={showSuggestionPanel}
      onQueryChange={setSearchQuery}
      onFocus={handleSearchFocus}
      onBlur={handleSearchBlur}
      onClear={handleClearSearch}
      onSelectSuggestion={handleSuggestionSelect}
    />
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
          onChange={(event) => setSearchQuery(event.target.value)}
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
        ? `${selectedAreaProjectCount} proyecto(s) · ${areaTaskSummary?.total || 0} tareas`
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
      <QuickViewBoard
        quickViewLabel={quickViewLabels[activeQuickView]}
        quickViewDescription={quickViewDescriptions[activeQuickView]}
        completedCount={completedCount}
        totalCount={filteredTasks.length}
        groups={quickViewGroups}
        onSelectArea={(areaId) => handleSelectArea(areaId)}
        onSelectProject={handleSelectProject}
        renderTaskList={(tasks) => renderTaskBody('desktop', tasks, false)}
      />
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
      <ProjectBoard
        project={selectedProject}
        headings={headingsForProject}
        tasksByHeading={tasksByHeading}
        unassignedTasks={unassignedTasks}
        completedCount={completedCount}
        totalCount={visibleProjectTasks.length}
        headingEditingId={headingEditingId}
        headingEditingName={headingEditingName}
        onStartEditHeading={handleStartEditHeading}
        onChangeHeadingName={setHeadingEditingName}
        onSaveHeadingName={handleSaveHeadingEdit}
        onCancelHeadingEdit={handleCancelHeadingEdit}
        onDeleteHeading={handleDeleteHeading}
        onSelectArea={(areaId) => handleSelectArea(areaId)}
        renderTaskList={(tasks, opts) => renderTaskBody('desktop', tasks, opts?.showEmptyState ?? false)}
        renderHeadingForm={() => (
          <div className="rounded-2xl border border-slate-100 p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">Secciones</p>
              <form onSubmit={handleAddHeading} className="flex gap-2">
                <input
                  type="text"
                  value={newHeadingName}
                  onChange={(event) => setNewHeadingName(event.target.value)}
                  placeholder="Nombre de la sección"
                  className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
                />
                <button
                  type="submit"
                  disabled={addHeadingMutation.isPending}
                  className="az-btn-primary px-4 py-2 text-sm"
                >
                  {addHeadingMutation.isPending ? 'Guardando...' : 'Crear'}
                </button>
              </form>
            </div>
          </div>
        )}
      />
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
      <AreaBoard
        areaName={selectedArea.name}
        projectCount={projectsInArea.length}
        completedCount={completedCount}
        totalCount={filteredTasks.length}
        projects={projectsInArea}
        tasksByProject={tasksByProject}
        looseTasks={looseTasks}
        onSelectProject={handleSelectProject}
        renderTaskList={(tasks) => renderTaskBody('desktop', tasks, false)}
      />
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
    <MobileHeader
      onBack={handleMobileBack}
      isProjectView={isMobileProjectView}
      selectedArea={selectedArea}
      mobileProject={mobileProject}
      quickViewLabel={currentQuickView.label}
      friendlyToday={friendlyToday}
      filteredTaskCount={filteredTasks.length}
      completedCount={completedCount}
      projectsInArea={selectedAreaProjectCount}
    />
  )



  const renderMobileCreationSheet = () => (
    <MobileCreationSheet
      isOpen={isMobile && showMobileCreationSheet}
      onClose={closeMobileCreationSheet}
      onCreateTask={() => startMobileTaskDraft('inbox', { areaId: null, projectId: null, stayHome: true })}
      onCreateProject={() => {
        setMobileDraftProject({ name: 'Nuevo proyecto', areaId: null })
        setShowMobileHome(true)
      }}
      onCreateArea={() => {
        setMobileDraftArea({ name: 'Nueva área' })
        setShowMobileHome(true)
      }}
    />
  )

  const renderScheduleSheet = () => (
    <MobileScheduleSheet
      open={scheduleSheetOpen && !!mobileDraftTask}
      view={mobileDraftTask?.view || 'inbox'}
      onClose={() => setScheduleSheetOpen(false)}
      onSelect={(view) => {
        updateMobileDraft(prev =>
          prev
            ? {
                ...prev,
                view,
                due_at: defaultDueForView(view, todayISO, tomorrowISO),
              }
            : prev
        )
      }}
    />
  )

  const renderLabelSheet = () => (
    <LabelSheet
      open={!!labelSheetTarget}
      labels={labels}
      selection={labelSheetSelection}
      inputValue={labelSheetInput}
      isSaving={addLabelMutation.isPending}
      onClose={closeLabelSheet}
      onToggle={handleLabelSheetToggle}
      onDelete={(labelId) => deleteLabelMutation.mutate(labelId)}
      onInputChange={setLabelSheetInput}
      onSubmit={handleLabelSheetSubmit}
      onConfirm={handleLabelSheetConfirm}
    />
  )


  const renderMobileDraftTaskCard = () => (
    mobileDraftTask ? (
      <MobileDraftCard
        draft={mobileDraftTask}
        labels={labels}
        scheduleLabel={quickViewLabels[mobileDraftTask.view]}
        onTitleChange={(value) => updateMobileDraft(prev => (prev ? { ...prev, title: value } : prev))}
        onNotesChange={(value) => updateMobileDraft(prev => (prev ? { ...prev, notes: value } : prev))}
        onSchedulePress={() => setScheduleSheetOpen(true)}
        onLabelsPress={() => {
          setLabelSheetSelection(mobileDraftTask.labelIds)
          setLabelSheetTarget('draft-task')
        }}
        onDatePress={() => openDatePicker('draft')}
        onCancel={handleCancelMobileDraftTask}
        onSave={handleSaveMobileDraftTask}
        saving={addTaskMutation.isPending}
      />
    ) : null
  )

  const renderMobileTaskBoard = () => (
    <div className="space-y-4">
      {renderTaskBody('mobile', undefined, true, {
        showLoadingState: true,
        renderDraftCard: renderMobileDraftTaskCard,
        showDraftCard: !!mobileDraftTask,
      })}
      {canShowMoreMobileTasks && (
        <button
          type="button"
          onClick={handleShowMoreMobileTasks}
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600"
        >
          Mostrar más
        </button>
      )}
    </div>
  )

  const renderMobileFab = () => {
    const isHomeFab = isMobile && showMobileHome
    return (
    <button
      type="button"
      onClick={() => {
        if (isHomeFab) {
          setShowMobileCreationSheet(true)
        } else {
          startMobileTaskDraft(activeQuickView)
        }
      }}
      className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-[var(--color-primary-600)] text-white text-3xl shadow-2xl flex items-center justify-center"
      aria-label="Crear tarea"
    >
      +
    </button>
    )
  }

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

  const currentDatePickerValue =
    datePickerTarget === 'new'
      ? taskDraft.due_at
      : datePickerTarget === 'edit'
        ? editingDueAt
        : datePickerTarget === 'draft' && mobileDraftTask?.due_at
          ? mobileDraftTask.due_at
          : ''

  const renderDatePickerOverlay = () => (
    <DatePickerOverlay
      open={!!datePickerTarget}
      mode={datePickerTarget || 'new'}
      month={datePickerMonth}
      todayISO={todayISO}
      tomorrowISO={tomorrowISO}
      selectedDate={currentDatePickerValue}
      selectedDateLabel={currentDatePickerValue ? formatDateForLabel(currentDatePickerValue) : 'Sin fecha'}
      onClose={closeDatePicker}
      onMonthChange={handleDatePickerMonthChange}
      onSelectDate={applyPickedDate}
    />
  )

  // Mutación para agregar tarea
  const addTaskMutation = useMutation({
    mutationFn: async (args: {
      title: string
      notes?: string
      priority?: number
      due_at?: string | null
      status?: 'open' | 'done' | 'snoozed'
      project_id?: string | null
      area_id?: string | null
      heading_id?: string | null
      labelIds?: string[]
    }) => {
      const result = await addTask(
        args.title,
        args.notes || undefined,
        args.priority ?? 0,
        args.due_at || undefined,
        args.status ?? 'open',
        args.project_id ?? null,
        args.area_id ?? null,
        args.heading_id ?? null
      )
      if (!result.success || !result.task) {
        throw new Error(result.error || 'Error al crear tarea')
      }
      if (args.labelIds && args.labelIds.length > 0) {
        const responses = await Promise.all(args.labelIds.map(labelId => addTaskLabel(result.task!.id, labelId)))
        const failed = responses.find(response => !response.success)
        if (failed) {
          throw new Error(failed.error || 'Algunas etiquetas no se pudieron asignar')
        }
      }
      return result.task
    },
    onSuccess: () => {
      setError('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err: Error) => {
      setError(err.message || 'Error inesperado al crear tarea')
    },
  })

  const addLabelMutation = useMutation({
    mutationFn: (name: string) => addLabel(name),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        queryClient.invalidateQueries({ queryKey: ['labels'] })
      } else {
        setError(result.error || 'Error al crear etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al crear etiqueta')
    },
  })

  const deleteLabelMutation = useMutation({
    mutationFn: (labelId: string) => deleteLabel(labelId),
    onSuccess: (result, labelId) => {
      if (result.success) {
        setError('')
        setSelectedLabelIds(prev => prev.filter(id => id !== labelId))
        updateMobileDraft(prev =>
          prev ? { ...prev, labelIds: prev.labelIds.filter(id => id !== labelId) } : prev
        )
        queryClient.invalidateQueries({ queryKey: ['labels'] })
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al eliminar etiqueta')
      }
    },
    onError: () => {
      setError('Error inesperado al eliminar etiqueta')
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
        setAreaNameDraft('')
        closeAreaModal()
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
        resetProjectDraft()
        closeProjectModal()
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
        setTaskLabels(prev => (prev.includes(createdLabel.id) ? prev : [...prev, createdLabel.id]))
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

  const startMobileTaskDraft = (
    view: QuickViewId,
    overrides?: { areaId?: string | null; projectId?: string | null; stayHome?: boolean }
  ) => {
    const targetProjectId = overrides?.projectId ?? selectedProjectId ?? null
    const appliedAreaId =
      overrides?.areaId ??
      selectedAreaId ??
      (targetProjectId ? projects.find(project => project.id === targetProjectId)?.area_id || null : null)
    if (!overrides?.stayHome) {
      setShowMobileHome(false)
    }
    updateMobileDraft(() => ({
      title: 'Nueva tarea',
      notes: '',
      view,
      areaId: appliedAreaId || null,
      projectId: targetProjectId || null,
      due_at: defaultDueForView(view, todayISO, tomorrowISO),
      labelIds: [],
    }))
  }

  const handleCancelMobileDraftTask = () => {
    updateMobileDraft(() => null)
    setShowMobileCreationSheet(false)
    setShowMobileHome(true)
  }

  const handleSaveMobileDraftTask = () => {
    if (!mobileDraftTask) {
      return
    }
    if (!mobileDraftTask.title.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    addTaskMutation.mutate(
      buildMobileTaskPayload(mobileDraftTask),
      {
        onSuccess: () => {
          updateMobileDraft(() => null)
          setShowMobileCreationSheet(false)
          setShowMobileHome(true)
        },
      }
    )
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDraft.title.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    addTaskMutation.mutate({
      title: taskDraft.title,
      notes: taskDraft.notes,
      priority: taskDraft.priority,
      due_at: taskDraft.due_at,
      status: taskDraft.status,
      project_id: taskDraft.projectId,
      area_id: taskDraft.areaId,
      heading_id: taskDraft.headingId,
      labelIds: taskDraft.labelIds,
    }, {
      onSuccess: () => {
        resetTaskDraft()
        closeTaskModal()
      },
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
    if (!projectDraft.name.trim()) {
      setError('El nombre del proyecto no puede estar vacío')
      return
    }
    addProjectMutation.mutate({
      name: projectDraft.name.trim(),
      areaId: projectDraft.areaId,
    })
  }

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault()
    if (!areaNameDraft.trim()) {
      setError('El nombre del área no puede estar vacío')
      return
    }
    addAreaMutation.mutate(areaNameDraft.trim())
  }

  const handleSaveMobileDraftArea = () => {
    if (!mobileDraftArea) {
      return
    }
    if (!mobileDraftArea.name.trim()) {
      setMobileDraftArea({ name: 'Nueva área' })
      return
    }
    addAreaMutation.mutate(mobileDraftArea.name.trim(), {
      onSuccess: (result) => {
        if (result.success) {
          setMobileDraftArea(null)
          setShowMobileCreationSheet(false)
          setShowMobileHome(true)
        }
      },
    })
  }

  const handleSaveMobileDraftProject = () => {
    if (!mobileDraftProject) {
      return
    }
    if (!mobileDraftProject.name.trim()) {
      setMobileDraftProject(prev => (prev ? { ...prev, name: 'Nuevo proyecto' } : null))
      return
    }
    addProjectMutation.mutate(
      {
        name: mobileDraftProject.name.trim(),
        areaId: mobileDraftProject.areaId,
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            setMobileDraftProject(null)
            setShowMobileCreationSheet(false)
            setShowMobileHome(true)
          }
        },
      }
    )
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
    updateTaskDraft('projectId', selectedProjectId || null)
    if (selectedProjectId) {
      const project = projects.find(project => project.id === selectedProjectId)
      updateTaskDraft('areaId', project?.area_id || null)
    } else if (selectedAreaId) {
      updateTaskDraft('areaId', selectedAreaId)
    } else {
      updateTaskDraft('areaId', null)
    }
    updateTaskDraft('headingId', null)
    setTaskLabels([])
    applyViewPreset(defaultView)
    openTaskModal()
  }

  const handleCloseTaskModal = () => {
    closeTaskModal()
    resetTaskDraft()
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
        <div className="max-w-md mx-auto px-4 py-6">
          <MobileOverview
            showDraftCard={!!mobileDraftTask}
            renderDraftCard={renderMobileDraftTaskCard}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchFocus={handleMobileHomeSearchFocus}
            quickLists={quickLists}
            quickViewStats={quickViewStats}
            onSelectQuickView={handleSelectQuickView}
            areas={areas}
            areaDraft={mobileDraftArea}
            areaInputRef={assignMobileDraftAreaInput}
            onAreaDraftChange={handleMobileAreaNameChange}
            onAreaDraftBlur={handleMobileAreaNameBlur}
            onCancelAreaDraft={handleCancelMobileAreaDraft}
            onSaveAreaDraft={handleSaveMobileDraftArea}
            onSelectArea={handleOpenMobileArea}
            projects={projects}
            projectDraft={mobileDraftProject}
            projectInputRef={assignMobileDraftProjectInput}
            onProjectDraftChange={handleMobileProjectNameChange}
            onProjectDraftBlur={handleMobileProjectNameBlur}
            onCancelProjectDraft={handleCancelMobileProjectDraft}
            onSaveProjectDraft={handleSaveMobileDraftProject}
            onSelectProject={handleOpenMobileProject}
            onOpenCreationSheet={() => setShowMobileCreationSheet(true)}
          />
        </div>
        {renderTaskModal()}
        {renderMobileCreationSheet()}
        {renderScheduleSheet()}
        {renderLabelSheet()}
        {renderDatePickerOverlay()}
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {isMobile ? (
        <>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <MobileHome
              renderSearch={renderMobileSearch}
              renderHeader={renderMobileHeader}
              renderFilters={() => (
                <ActiveFilterChips
                  filters={activeFilters}
                  compact={isMobileDetail}
                  onRemove={handleRemoveFilter}
                />
              )}
              renderError={() => <ErrorBanner message={error} />}
              renderTaskBoard={renderMobileTaskBoard}
              renderDraftCard={renderMobileDraftTaskCard}
              showDraft={showMobileHome && !!mobileDraftTask}
            />
          </div>
          {renderMobileFab()}
        </>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 py-10 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
              <div className="hidden lg:block">
                <DesktopSidebar
                  filteredTaskCount={activeTaskCount}
                  completedCount={completedCount}
                  quickLists={quickLists}
                  quickViewStats={quickViewStats}
                  quickViewOverdueStats={quickViewOverdueStats}
                  projects={projects}
                  areas={areas}
                  projectStats={projectStats}
                  areaStats={areaStats}
                  selectedProjectId={selectedProjectId}
                  selectedAreaId={selectedAreaId}
                  activeQuickView={activeQuickView}
                  showNewListMenu={showNewListMenu}
                  onSelectQuickView={handleSelectQuickView}
                  onSelectArea={handleSelectArea}
                  onSelectProject={handleSelectProject}
                  onToggleNewListMenu={toggleNewListMenu}
                  onCreateProject={handleCreateProjectFromSidebar}
                  onCreateArea={handleCreateAreaFromSidebar}
                  onLogout={handleLogout}
                />
              </div>
              <section className="space-y-6">
                {renderDesktopSearch()}
                {renderDesktopHeader()}
                <ActiveFilterChips
                  filters={activeFilters}
                  compact={false}
                  onRemove={handleRemoveFilter}
                />
                <ErrorBanner message={error} />
                {renderDesktopTaskBoard()}
              </section>
            </div>
          </div>
          {renderDesktopDock()}
        </>
      )}
      {renderTaskModal()}
      <NewAreaModal
        open={showAreaModal}
        areaName={areaNameDraft}
        isSaving={addAreaMutation.isPending}
        onClose={closeAreaModal}
        onSubmit={handleAddArea}
        onNameChange={(value) => setAreaNameDraft(value)}
      />
      <NewProjectModal
        open={showProjectModal}
        projectName={projectDraft.name}
        selectedAreaId={projectDraft.areaId}
        areas={areas}
        isSaving={addProjectMutation.isPending}
        onClose={closeProjectModal}
        onSubmit={handleAddProject}
        onNameChange={(value) => setProjectName(value)}
        onAreaChange={(value) => setProjectAreaId(value)}
      />
      <QuickHeadingForm
        open={showQuickHeadingForm}
        headingName={newHeadingName}
        hasProjectSelected={!!selectedProjectId}
        isSaving={addHeadingMutation.isPending}
        onClose={() => setShowQuickHeadingForm(false)}
        onSubmit={handleAddHeading}
        onNameChange={(value) => setNewHeadingName(value)}
      />
      {renderMobileCreationSheet()}
      {renderScheduleSheet()}
      {renderLabelSheet()}
      {renderDatePickerOverlay()}
    </main>
  )


}

// Componente auxiliar para mostrar etiquetas de una tarea
