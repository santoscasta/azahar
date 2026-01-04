import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode, DragEvent } from 'react'

import { useQuery, useMutation, useQueryClient, useIsMutating } from '@tanstack/react-query'
import { v4 as uuid } from 'uuid'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../App.js'
import { translate } from '../lib/i18n.js'
import {
  searchTasks,
  addTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
  getProjects,
  addProject,
  updateProject,
  getLabels,
  addLabel,
  deleteLabel,
  addTaskLabel,
  removeTaskLabel,
  toggleChecklistItemCompletion,
  syncTaskChecklist,
  setTaskPinned,
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
  filterTasksForContext,
  buildActiveFilters,
  isFilteredView,
  normalizeDate,
  getTaskView,
  getLabelQuickView,
  type QuickViewId,
  type ActiveFilterDescriptor,
} from './tasksSelectors.js'
import { defaultDueForView, determineViewFromDate } from '../lib/scheduleUtils.js'
import { deserializeChecklistNotes, generateChecklistId } from '../lib/checklistNotes.js'
import { loadSettings, subscribeToSettings, type SettingsState } from '../lib/settingsStore.js'
import { formatISODate, parseISODate } from '../lib/dateUtils.js'
import { useTaskCreation } from '../hooks/useTaskCreation.js'
import { useProjectCreation } from '../hooks/useProjectCreation.js'
import { useAreaCreation } from '../hooks/useAreaCreation.js'
import { MobileCreationSheet } from '../components/mobile/MobileCreationSheet.js'
import { MobileDraftCard } from '../components/mobile/MobileDraftCard.js'
import { MobileScheduleSheet } from '../components/mobile/MobileScheduleSheet.js'
import { buildMobileTaskPayload } from '../lib/mobileDraftUtils.js'
import DesktopSidebar from '../components/sidebar/DesktopSidebar.js'
import MobileTasksPane from '../components/mobile/MobileTasksPane.js'
import MobileBottomBar from '../components/mobile/MobileBottomBar.js'
import MobileFab from '../components/mobile/MobileFab.js'
import MobileTaskEditSheet from '../components/mobile/MobileTaskEditSheet.js'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import {
  parseTaskListId,
  parseHeadingDropId,
} from '../lib/dndIds.js'
import NewAreaModal from '../components/tasks/NewAreaModal.js'
import NewProjectModal from '../components/tasks/NewProjectModal.js'
import QuickHeadingForm from '../components/tasks/QuickHeadingForm.js'
import ActiveFilterChips from '../components/tasks/ActiveFilterChips.js'
import ErrorBanner from '../components/tasks/ErrorBanner.js'
import StatusBanner from '../components/tasks/StatusBanner.js'
import QuickFindOverlay, { type QuickFindResult } from '../components/tasks/QuickFindOverlay.js'
import TaskCreationModal from '../components/tasks/TaskCreationModal.js'
import TaskDatePickerOverlay from '../components/tasks/TaskDatePickerOverlay.js'
import LabelSheet from '../components/tasks/LabelSheet.js'
import TaskList from '../components/tasks/TaskList.js'
import AgendaSummary from '../components/tasks/AgendaSummary.js'
import DesktopContextHeader from '../components/tasks/DesktopContextHeader.js'
import DesktopDock from '../components/tasks/DesktopDock.js'
import MultiSelectActionBar from '../components/tasks/MultiSelectActionBar.js'
import DesktopTaskBoardSwitcher from '../components/tasks/boards/DesktopTaskBoardSwitcher.js'
import MobileOverview from '../components/mobile/MobileOverview.js'
import MobileTaskBoard from '../components/mobile/MobileTaskBoard.js'
import { DesktopDraftCard } from '../components/tasks/DesktopDraftCard.js'
import MoveTaskSheet from '../components/tasks/MoveTaskSheet.js'
import ChecklistSheet from '../components/tasks/ChecklistSheet.js'
import TaskOverflowMenu from '../components/tasks/TaskOverflowMenu.js'
import { useConnectivity } from '../hooks/useConnectivity.js'
import AssistantChat from '../components/assistant/AssistantChat.js'
import inboxIcon from '../assets/icons/inbox.svg'
import todayIcon from '../assets/icons/today.svg'
import upcomingIcon from '../assets/icons/upcoming.svg'
import anytimeIcon from '../assets/icons/anytime.svg'
import waitingIcon from '../assets/icons/waiting.svg'
import somedayIcon from '../assets/icons/someday.svg'
import referenceIcon from '../assets/icons/reference.svg'
import logbookIcon from '../assets/icons/logbook.svg'

type LabelSheetTarget = { kind: 'draft-task' } | { kind: 'task'; taskId: string } | null

const normalizeLabelName = (value: string) => value.trim().toLowerCase()
const precreatedLabelNames = new Set([
  'importante',
  'important',
  'pendiente',
  'pending',
  'oficina',
  'office',
  'casa',
  'home',
  'recado',
  'recados',
  'errand',
  'phone',
  'teléfono',
  'telefono',
  'equipo',
  'team',
  'familia',
  'family',
  'fotografia',
  'fotografía',
  'photography',
  'waiting',
  'en espera',
  'espera',
  'reference',
  'referencia',
])
interface EditingChecklistItem {
  id: string
  text: string
  completed: boolean
  sortOrder: number
  persisted: boolean
}

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
  const { language, t } = useTranslations()
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingNotes, setEditingNotes] = useState('')
  const [editingDueAt, setEditingDueAt] = useState('')
  const [editingDeadlineAt, setEditingDeadlineAt] = useState('')
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null)
  const [editingHeadingId, setEditingHeadingId] = useState<string | null>(null)
  const dndIds = useMemo(() => ({
    quickView: {
      list: (view: QuickViewId) => `tasklist:view:${view}`,
    },
    project: {
      list: (projectId: string, headingId: string | null) => `tasklist:project:${projectId}:heading:${headingId ?? 'none'}`,
    },
    area: {
      list: (areaId: string, projectId: string | null) => `tasklist:area:${areaId}:project:${projectId ?? 'none'}`,
    }
  }), [])
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
  const navigate = useNavigate()
  const handleOpenSettings = useCallback(() => {
    navigate('/settings')
  }, [navigate])
  const handleOpenHelp = useCallback(() => {
    navigate('/help')
  }, [navigate])
  const [inlineLabelName, setInlineLabelName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [isQuickFindOpen, setIsQuickFindOpen] = useState(false)
  const [quickFindQuery, setQuickFindQuery] = useState('')
  const [activeQuickView, setActiveQuickView] = useState<QuickViewId>('inbox')
  const [newHeadingName, setNewHeadingName] = useState('')
  const [headingEditingId, setHeadingEditingId] = useState<string | null>(null)
  const [headingEditingName, setHeadingEditingName] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [forceMobileView, setForceMobileView] = useState(false)
  // Force mobile viewports to use the desktop experience.
  const forceDesktopOnMobile = false
  const useMobileExperience = (isMobile || forceMobileView) && !forceDesktopOnMobile
  const [showMobileHome, setShowMobileHome] = useState(true)
  const [mobileProjectFocusId, setMobileProjectFocusId] = useState<string | null>(null)
  const [mobileTaskLimit, setMobileTaskLimit] = useState(6)
  const [datePickerTarget, setDatePickerTarget] = useState<'new' | 'edit' | 'draft' | null>(null)
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null)
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date())
  const [datePickerIntent, setDatePickerIntent] = useState<'when' | 'deadline'>('when')
  const [activeProjectFilterChip, setActiveProjectFilterChip] = useState<'all' | string>('all')
  const [showNewListMenu, setShowNewListMenu] = useState(false)
  const [showQuickHeadingForm, setShowQuickHeadingForm] = useState(false)
  const [showMobileCreationSheet, setShowMobileCreationSheet] = useState(false)
  const [mobileDraftProject, setMobileDraftProject] = useState<{ name: string; areaId: string | null } | null>(null)
  const [mobileDraftArea, setMobileDraftArea] = useState<{ name: string } | null>(null)
  const [labelSheetTarget, setLabelSheetTarget] = useState<LabelSheetTarget>(null)
  const [labelSheetSelection, setLabelSheetSelection] = useState<string[]>([])
  const [labelSheetInput, setLabelSheetInput] = useState('')
  const [labelSheetAnchor, setLabelSheetAnchor] = useState<HTMLElement | null>(null)
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
  const [moveSheetTaskId, setMoveSheetTaskId] = useState<string | null>(null)
  const [editingChecklist, setEditingChecklist] = useState<EditingChecklistItem[]>([])
  const [isChecklistSheetOpen, setChecklistSheetOpen] = useState(false)
  const [overflowTaskId, setOverflowTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [showCompletedInContext, setShowCompletedInContext] = useState(true)
  const [customViewNames, setCustomViewNames] = useState<Partial<Record<QuickViewId, string>>>({})
  const [showAssistantChat, setShowAssistantChat] = useState(false)
  const [showDesktopDraft, setShowDesktopDraft] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [upcomingDropTargetId, setUpcomingDropTargetId] = useState<string | null>(null)
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null)
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [multiSelectMoveOpen, setMultiSelectMoveOpen] = useState(false)
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null)
  const [batchActionPending, setBatchActionPending] = useState(false)
  const searchBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileHomeSearchInputRef = useRef<HTMLInputElement | null>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null)
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null)
  const seededImportantLabelRef = useRef(false)
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
    setLabelSheetAnchor(null)
  }
  const closeMobileCreationSheet = (preserveDrafts = false) => {
    setShowMobileCreationSheet(false)
    if (!preserveDrafts) {
      setMobileDraftProject(null)
      setMobileDraftArea(null)
    }
  }
  const queryClient = useQueryClient()
  const handleRetryLoad = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['areas'] })
    queryClient.invalidateQueries({ queryKey: ['labels'] })
  }, [queryClient])
  const isOnline = useConnectivity()
  const pendingMutations = useIsMutating({
    predicate: (mutation) => mutation.state.status === 'pending',
  })
  const hasPendingSync = pendingMutations > 0 && !isOnline
  const normalizedSearch = searchQuery.trim()
  const activeLabelIds = useMemo(() => {
    if (!selectedProjectId && !selectedAreaId && activeQuickView === 'upcoming') {
      return []
    }
    return selectedLabelIds.length > 0 ? [selectedLabelIds[0]] : []
  }, [selectedLabelIds, selectedProjectId, selectedAreaId, activeQuickView])
  const assistantEnabled = Boolean(
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_OPENAI_API_KEY
  )

  const pushSuccessMessage = useCallback((message: string) => {
    setSuccessMessage(message)
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
    successTimeoutRef.current = setTimeout(() => {
      setSuccessMessage('')
    }, 3200)
  }, [])

  const getNavigator = () => {
    if (typeof globalThis === 'undefined') {
      return undefined
    }
    return (globalThis as { navigator?: Navigator }).navigator
  }

  const exitMultiSelect = () => {
    setIsMultiSelectMode(false)
    setSelectedTaskIds([])
    setMultiSelectMoveOpen(false)
    setBulkDeleteIds(null)
  }

  const toggleMultiSelectMode = () => {
    if (isMultiSelectMode) {
      exitMultiSelect()
      return
    }
    handleCancelEdit()
    setIsMultiSelectMode(true)
    setSelectedTaskIds([])
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    )
  }

  const highlightTask = useCallback((taskId: string) => {
    setHighlightedTaskId(taskId)
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTaskId(null)
    }, 1800)
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const node = document.getElementById(`task-${taskId}`)
        if (node && typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      })
    }
  }, [])

  // Consulta para obtener tareas con búsqueda y filtros
  const { data: tasksData = [], isLoading } = useQuery({
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
  const tasks = useMemo(() => {
    const deduped: Task[] = []
    const indexById = new Map<string, number>()
    tasksData.forEach(task => {
      const existingIndex = indexById.get(task.id)
      if (existingIndex === undefined) {
        indexById.set(task.id, deduped.length)
        deduped.push(task)
        return
      }
      const existing = deduped[existingIndex]
      const existingUpdated = Date.parse(existing.updated_at || '')
      const nextUpdated = Date.parse(task.updated_at || '')
      if (
        Number.isNaN(existingUpdated) ||
        (!Number.isNaN(nextUpdated) && nextUpdated >= existingUpdated)
      ) {
        deduped[existingIndex] = task
      }
    })
    return deduped
  }, [tasksData])
  const taskById = useMemo(() => {
    const map = new Map<string, Task>()
    tasks.forEach(task => map.set(task.id, task))
    return map
  }, [tasks])
  const selectedTasks = useMemo(() => {
    return selectedTaskIds
      .map(taskId => taskById.get(taskId))
      .filter((task): task is Task => !!task)
  }, [selectedTaskIds, taskById])

  useEffect(() => {
    if (selectedTaskIds.length === 0) {
      return
    }
    setSelectedTaskIds(prev => prev.filter(taskId => taskById.has(taskId)))
  }, [taskById])

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
  const { data: labels = [], isFetched: labelsFetched } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const result = await getLabels()
      if (!result.success) {
        return []
      }
      return result.labels || []
    },
  })
  const labelUsage = useMemo(() => {
    const counts = new Map<string, number>()
    tasks.forEach(task => {
      ; (task.labels || []).forEach(label => {
        counts.set(label.id, (counts.get(label.id) || 0) + 1)
      })
    })
    return counts
  }, [tasks])
  const orderedLabels = useMemo(() => {
    return [...labels].sort((a, b) => {
      const aName = normalizeLabelName(a.name)
      const bName = normalizeLabelName(b.name)
      const aPre = precreatedLabelNames.has(aName)
      const bPre = precreatedLabelNames.has(bName)
      if (aPre !== bPre) {
        return aPre ? 1 : -1
      }
      const aUsage = labelUsage.get(a.id) || 0
      const bUsage = labelUsage.get(b.id) || 0
      if (aUsage !== bUsage) {
        return bUsage - aUsage
      }
      return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    })
  }, [labels, labelUsage])

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
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!assistantEnabled && showAssistantChat) {
      setShowAssistantChat(false)
    }
  }, [assistantEnabled, showAssistantChat])

  useEffect(() => {
    if (showProjectModal) {
      queryClient.invalidateQueries({ queryKey: ['areas'] })
    }
  }, [showProjectModal, queryClient])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateMatches = (matches: boolean) => {
      const shouldUseMobile = (matches || forceMobileView) && !forceDesktopOnMobile
      setIsMobile(matches)
      if (shouldUseMobile) {
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
  }, [forceMobileView])

  useEffect(() => {
    if (mobileDraftTaskTitleRef.current && useMobileExperience && mobileDraftTask) {
      mobileDraftTaskTitleRef.current.focus()
    }
  }, [mobileDraftTask, useMobileExperience])

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
    return formatISODate(new Date())
  }, [])

  useEffect(() => {
    const applySettings = (state: SettingsState) => {
      setShowCompletedInContext(state.showCompletedInContexts)
      setCustomViewNames(state.customViewNames ?? {})
      setForceMobileView(state.forceMobileView)
    }

    applySettings(loadSettings())
    const unsubscribe = subscribeToSettings(applySettings)
    return unsubscribe
  }, [])
  const projectMap = useMemo(() => {
    const map = new Map<string, Project>()
    projects.forEach(project => map.set(project.id, project))
    return map
  }, [projects])
  const headingMap = useMemo(() => {
    const map = new Map<string, ProjectHeading>()
    projectHeadings.forEach(heading => map.set(heading.id, heading))
    return map
  }, [projectHeadings])
  const quickViewStats = useMemo(
    () => buildQuickViewStats(tasks, todayISO),
    [tasks, todayISO]
  )
  const searchResults = useMemo(() => {
    if (!normalizedSearch) {
      return tasks
    }
    const query = normalizedSearch.toLowerCase()
    return tasks.filter(task => {
      try {
        // Safely handle null/undefined values
        const title = String(task.title ?? '').toLowerCase()
        const notes = task.notes ? String(task.notes).toLowerCase() : ''
        const projectName = task.project_id
          ? String(projects.find(project => project.id === task.project_id)?.name ?? '').toLowerCase()
          : ''

        const titleMatch = title.includes(query)
        const notesMatch = notes.includes(query)
        const projectMatch = projectName.includes(query)

        return titleMatch || notesMatch || projectMatch
      } catch (error) {
        console.error('Search filter error', {
          error,
          task,
          normalizedSearch,
        })
        // Return true on error to avoid losing tasks - better to show more than to show nothing
        return true
      }
    })
  }, [normalizedSearch, projects, tasks])
  const isQuickFindActive = isSearchFocused || normalizedSearch.length > 0
  useEffect(() => {
    if (!isMultiSelectMode) {
      return
    }
    exitMultiSelect()
  }, [activeQuickView, selectedProjectId, selectedAreaId, showMobileHome])
  const filteredTasks = useMemo(() => {
    const base = filterTasksForContext(tasks, activeQuickView, todayISO, selectedProjectId, selectedAreaId, projectMap)
    if (activeLabelIds.length === 0) {
      return base
    }
    return base.filter(task => (task.labels || []).some(label => activeLabelIds.includes(label.id)))
  }, [
    tasks,
    activeQuickView,
    todayISO,
    selectedProjectId,
    selectedAreaId,
    projectMap,
    activeLabelIds,
  ])
  const selectedTask = useMemo(() => {
    if (!editingId) {
      return null
    }
    return tasks.find(task => task.id === editingId) || null
  }, [editingId, tasks])
  const isTaskOverdue = (task: Task) => {
    if (task.status !== 'open' || !task.deadline_at) {
      return false
    }
    const normalized = normalizeDate(task.deadline_at)
    return !!normalized && normalized < todayISO
  }
  const quickViewOverdueStats = useMemo(() => {
    const base: Record<QuickViewId, number> = {
      inbox: 0,
      today: 0,
      upcoming: 0,
      anytime: 0,
      waiting: 0,
      someday: 0,
      reference: 0,
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
    const todayDate = parseISODate(todayISO) ?? new Date()
    const tomorrow = new Date(todayDate)
    tomorrow.setDate(todayDate.getDate() + 1)
    return formatISODate(tomorrow)
  }, [todayISO])
  const applyViewPreset = (view: QuickViewId) => {
    updateTaskDraft('view', view)
    applyQuickViewLabels(view)
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
      case 'waiting':
      case 'reference':
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
    const trimmed = inlineLabelName.trim()
    if (!trimmed) {
      setError('El nombre de la etiqueta no puede estar vacío')
      return
    }
    const normalized = normalizeLabelName(trimmed)
    const existing = labels.find(label => normalizeLabelName(label.name) === normalized)
    if (existing) {
      setTaskLabels(prev => (prev.includes(existing.id) ? prev : [...prev, existing.id]))
      setInlineLabelName('')
      return
    }
    addInlineLabelMutation.mutate(trimmed)
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
    const trimmed = labelSheetInput.trim()
    if (!trimmed) {
      return
    }
    const normalized = normalizeLabelName(trimmed)
    const existing = labels.find(label => normalizeLabelName(label.name) === normalized)
    if (existing) {
      setLabelSheetSelection(prev => (prev.includes(existing.id) ? prev : [...prev, existing.id]))
      setLabelSheetInput('')
      return
    }
    addLabelMutation.mutate(trimmed, {
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

  const handleOpenTaskLabelSheet = (task: Task, anchor?: HTMLElement | null) => {
    setLabelSheetSelection(task.labels?.map(label => label.id) ?? [])
    setLabelSheetTarget({ kind: 'task', taskId: task.id })
    setLabelSheetAnchor(anchor ?? null)
  }

  const handleLabelSheetConfirm = () => {
    if (labelSheetTarget?.kind === 'draft-task') {
      if (mobileDraftTask) {
        updateMobileDraft(prev => (prev ? { ...prev, labelIds: labelSheetSelection } : prev))
      } else if (showDesktopDraft) {
        setTaskLabels(labelSheetSelection)
      }
    } else if (labelSheetTarget?.kind === 'task') {
      const targetTask = tasks.find(task => task.id === labelSheetTarget.taskId)
      if (targetTask) {
        const currentLabelIds = new Set((targetTask.labels || []).map(label => label.id))
        const nextLabelIds = new Set(labelSheetSelection)
        labelSheetSelection.forEach(labelId => {
          if (!currentLabelIds.has(labelId)) {
            addTaskLabelMutation.mutate({ taskId: targetTask.id, labelId })
          }
        })
          ; (targetTask.labels || []).forEach(label => {
            if (!nextLabelIds.has(label.id)) {
              removeTaskLabelMutation.mutate({ taskId: targetTask.id, labelId: label.id })
            }
          })
      }
    }
    closeLabelSheet()
  }

  const handleOpenChecklistSheet = (taskId: string, _anchor?: HTMLElement | null) => {
    if (!editingId || editingId !== taskId) {
      return
    }
    setChecklistSheetOpen(true)
  }

  const handleChecklistToggle = (itemId: string) => {
    setEditingChecklist(prev =>
      prev.map(item => (item.id === itemId ? { ...item, completed: !item.completed } : item))
    )
  }

  const handleChecklistUpdate = (itemId: string, text: string) => {
    setEditingChecklist(prev => prev.map(item => (item.id === itemId ? { ...item, text } : item)))
  }

  const handleChecklistRemove = (itemId: string) => {
    setEditingChecklist(prev =>
      prev
        .filter(item => item.id !== itemId)
        .map((item, index) => ({ ...item, sortOrder: index }))
    )
  }

  const handleChecklistAdd = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }
    setEditingChecklist(prev => [
      ...prev,
      {
        id: generateChecklistId(),
        text: trimmed,
        completed: false,
        sortOrder: prev.length,
        persisted: false,
      },
    ])
  }

  const handleChecklistReorder = (orderedIds: string[]) => {
    setEditingChecklist(prev => {
      const itemMap = new Map(prev.map(item => [item.id, item]))
      const reordered: EditingChecklistItem[] = []
      orderedIds.forEach((id, index) => {
        const item = itemMap.get(id)
        if (!item) return
        reordered.push({ ...item, sortOrder: index })
        itemMap.delete(id)
      })
      if (itemMap.size > 0) {
        itemMap.forEach(item => {
          reordered.push({ ...item, sortOrder: reordered.length })
        })
      }
      return reordered
    })
  }

  const handleOpenOverflowMenu = (taskId: string) => {
    if (!editingId || editingId !== taskId) {
      return
    }
    setOverflowTaskId(taskId)
  }

  const handleCloseOverflowMenu = () => {
    setOverflowTaskId(null)
  }

  const handleDuplicateTask = () => {
    if (overflowTask) {
      duplicateTaskMutation.mutate(overflowTask)
    }
  }

  const handleCopyTaskLink = () => {
    if (!overflowTask) {
      return
    }
    const base =
      typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://azahar.app'
    const shareText = `${base}/tasks/${overflowTask.id}`
    const nav = getNavigator()
    if (nav?.clipboard?.writeText) {
      nav.clipboard.writeText(shareText).catch(() => null)
    }
    setOverflowTaskId(null)
  }

  const handleToggleCollapsedChecklist = (_taskId: string, itemId: string, completed: boolean) => {
    toggleChecklistItemMutation.mutate({ itemId, completed: !completed })
  }

  const handleTogglePinnedTask = () => {
    if (!overflowTask) {
      return
    }
    togglePinMutation.mutate({ taskId: overflowTask.id, pinned: !overflowTask.pinned })
  }

  const handleApplyQuickView = (task: Task, view: 'waiting' | 'someday' | 'reference') => {
    const sortKey = `view:${view}` as const
    applyQuickViewMutation.mutate({
      task,
      view,
      sortOrders: buildSortOrdersForKey(task, sortKey),
    })
  }

  const handleArchiveTask = (task: Task) => {
    if (task.status === 'done' || archiveTaskMutation.isPending) {
      return
    }
    archiveTaskMutation.mutate(task.id)
  }

  const handleConvertToProject = (task: Task) => {
    if (task.project_id || convertTaskMutation.isPending) {
      return
    }
    convertTaskMutation.mutate(task)
  }

  const handleOpenMoveSheet = (task: Task, _anchor?: HTMLElement | null) => {
    setMoveSheetTaskId(task.id)
  }

  const handleCloseMoveSheet = () => {
    setMoveSheetTaskId(null)
  }

  const handleRequestDeleteTask = (taskId: string) => {
    const targetTask = tasks.find(task => task.id === taskId)
    setDeleteTarget({ id: taskId, title: targetTask?.title || 'Tarea' })
  }

  const handleCancelDelete = () => {
    setDeleteTarget(null)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) {
      return
    }
    deleteTaskMutation.mutate(deleteTarget.id)
  }

  const handleConfirmMoveDestination = (destination: { areaId: string | null; projectId: string | null }) => {
    if (!moveSheetTaskId) {
      return
    }
    moveTaskMutation.mutate({ taskId: moveSheetTaskId, ...destination })
  }

  const handleConfirmMultiMoveDestination = async (destination: { areaId: string | null; projectId: string | null }) => {
    if (selectedTaskIds.length === 0) {
      return
    }
    setBatchActionPending(true)
    try {
      const sortKey = destination.projectId
        ? `project:${destination.projectId}`
        : destination.areaId
          ? `area:${destination.areaId}`
          : 'view:inbox'
      let nextOrder = sortKey ? getNextSortOrder(sortKey) : null
      const results = await Promise.all(
        selectedTaskIds.map(taskId =>
          updateTask(taskId, (() => {
            const task = taskById.get(taskId)
            const baseOrders =
              task?.sort_orders && typeof task.sort_orders === 'object'
                ? (task.sort_orders as Record<string, number>)
                : {}
            const sort_orders =
              sortKey && nextOrder !== null
                ? { ...baseOrders, [sortKey]: nextOrder++ }
                : baseOrders
            return {
              project_id: destination.projectId,
              area_id: destination.areaId,
              heading_id: null,
              sort_orders,
            }
          })())
        )
      )
      const failed = results.find(result => !result.success)
      if (failed && failed.error) {
        throw new Error(failed.error)
      }
      pushSuccessMessage(`Tareas movidas: ${selectedTaskIds.length}`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      exitMultiSelect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al mover tareas')
    } finally {
      setBatchActionPending(false)
      setMultiSelectMoveOpen(false)
    }
  }

  const handleBatchComplete = async () => {
    if (selectedTaskIds.length === 0) {
      return
    }
    setBatchActionPending(true)
    try {
      const completedAt = new Date().toISOString()
      const results = await Promise.all(
        selectedTaskIds.map(taskId => updateTask(taskId, { status: 'done', completed_at: completedAt }))
      )
      const failed = results.find(result => !result.success)
      if (failed && failed.error) {
        throw new Error(failed.error)
      }
      pushSuccessMessage(`Tareas completadas: ${selectedTaskIds.length}`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      exitMultiSelect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar tareas')
    } finally {
      setBatchActionPending(false)
    }
  }

  const handleRequestBulkDelete = () => {
    if (selectedTaskIds.length === 0) {
      return
    }
    setBulkDeleteIds([...selectedTaskIds])
  }

  const handleCancelBulkDelete = () => {
    setBulkDeleteIds(null)
  }

  const handleConfirmBulkDelete = async () => {
    if (!bulkDeleteIds || bulkDeleteIds.length === 0) {
      return
    }
    setBatchActionPending(true)
    try {
      const results = await Promise.all(bulkDeleteIds.map(taskId => deleteTask(taskId)))
      const failed = results.find(result => !result.success)
      if (failed && failed.error) {
        throw new Error(failed.error)
      }
      pushSuccessMessage(`Tareas eliminadas: ${bulkDeleteIds.length}`)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      exitMultiSelect()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar tareas')
    } finally {
      setBatchActionPending(false)
      setBulkDeleteIds(null)
    }
  }

  const buildSelectedTasksText = () => {
    return selectedTasks.map(task => task.title).join('\n')
  }

  const handleCopySelectedTasks = async () => {
    const text = buildSelectedTasksText()
    if (!text) {
      return
    }
    try {
      const nav = getNavigator()
      if (!nav?.clipboard?.writeText) {
        setError('El portapapeles no está disponible')
        return
      }
      await nav.clipboard.writeText(text)
      pushSuccessMessage('Tareas copiadas')
    } catch (_err) {
      setError('No se pudo copiar al portapapeles')
    }
  }

  const handleShareSelectedTasks = async () => {
    const text = buildSelectedTasksText()
    if (!text) {
      return
    }
    try {
      const nav = getNavigator()
      if (nav?.share) {
        await nav.share({ title: 'Azahar', text })
        return
      }
      if (!nav?.clipboard?.writeText) {
        setError('El portapapeles no está disponible')
        return
      }
      await nav.clipboard.writeText(text)
      pushSuccessMessage('Tareas copiadas')
    } catch (_err) {
      setError('No se pudo compartir')
    }
  }

  const handlePasteTasks = async () => {
    const nav = getNavigator()
    if (!nav?.clipboard?.readText) {
      setError('El portapapeles no está disponible')
      return
    }
    try {
      const text = await nav.clipboard.readText()
      const lines = text
        .split(/\r?\n/)
        .map(line => line.replace(/^[-*]\s+/, '').trim())
        .filter(Boolean)
      if (lines.length === 0) {
        setError('No hay texto para pegar')
        return
      }
      setBatchActionPending(true)
      const normalizedView = activeQuickView === 'logbook' ? 'inbox' : activeQuickView
      const targetProjectId = selectedProjectId || null
      const targetAreaId =
        targetProjectId ? projectMap.get(targetProjectId)?.area_id || null : selectedAreaId || null
      const defaultDue = defaultDueForView(normalizedView, todayISO, tomorrowISO) || null
      const labelIds = getDraftLabelIdsForView(normalizedView, [])
      const sortKey = resolveListSortKey(normalizedView)
      const sortMode = resolveListSortMode(normalizedView)
      let nextOrder = sortKey && sortMode === 'default' ? getNextSortOrder(sortKey) : null
      for (const title of lines) {
        await addTaskMutation.mutateAsync({
          title,
          notes: '',
          due_at: defaultDue,
          deadline_at: null,
          status: normalizedView === 'someday' ? 'snoozed' : 'open',
          project_id: targetProjectId,
          area_id: targetAreaId,
          heading_id: null,
          quick_view: normalizedView,
          labelIds,
          sort_orders: sortKey && nextOrder !== null ? { [sortKey]: nextOrder } : undefined,
        })
        if (nextOrder !== null) {
          nextOrder += 1
        }
      }
      pushSuccessMessage(`Tareas creadas: ${lines.length}`)
    } catch (_err) {
      setError('No se pudieron crear tareas desde el portapapeles')
    } finally {
      setBatchActionPending(false)
    }
  }

  const editingState = {
    id: editingId,
    title: editingTitle,
    notes: editingNotes,
    dueAt: editingDueAt,
    deadlineAt: editingDeadlineAt,
    projectId: editingProjectId,
    areaId: editingAreaId,
    headingId: editingHeadingId,
  }

  const editingHandlers = {
    setTitle: setEditingTitle,
    setNotes: setEditingNotes,
    setAreaId: setEditingAreaId,
    setProjectId: setEditingProjectId,
    setHeadingId: setEditingHeadingId,
  }
  const resolveListSortKey = useCallback(
    (viewOverride?: QuickViewId) => {
      if (selectedProjectId) {
        return `project:${selectedProjectId}`
      }
      if (selectedAreaId) {
        return `area:${selectedAreaId}`
      }
      const view = viewOverride ?? activeQuickView
      return view ? `view:${view}` : null
    },
    [activeQuickView, selectedAreaId, selectedProjectId]
  )
  const resolveListSortMode = useCallback(
    (viewOverride?: QuickViewId) => {
      if (selectedProjectId || selectedAreaId) {
        return 'default'
      }
      const view = viewOverride ?? activeQuickView
      if (view === 'upcoming') {
        return 'due'
      }
      if (view === 'logbook') {
        return 'completed'
      }
      return 'default'
    },
    [activeQuickView, selectedAreaId, selectedProjectId]
  )
  const getNextSortOrder = useCallback(
    (sortKey: string) => {
      let maxOrder = -1
      tasks.forEach(task => {
        const orders = task.sort_orders
        if (!orders || typeof orders !== 'object') {
          return
        }
        const value = (orders as Record<string, number>)[sortKey]
        if (typeof value === 'number' && Number.isFinite(value)) {
          maxOrder = Math.max(maxOrder, value)
        }
      })
      return maxOrder + 1
    },
    [tasks]
  )
  const buildSortOrdersForKey = useCallback(
    (task: Task, sortKey: string) => {
      const baseOrders =
        task.sort_orders && typeof task.sort_orders === 'object' ? (task.sort_orders as Record<string, number>) : {}
      return { ...baseOrders, [sortKey]: getNextSortOrder(sortKey) }
    },
    [getNextSortOrder]
  )

  const renderTaskList = (
    variant: 'desktop' | 'mobile',
    tasks: Task[],
    options: {
      showEmptyState?: boolean
      showLoadingState?: boolean
      renderDraftCard?: () => ReactNode
      showDraftCard?: boolean
      autoSaveOnBlur?: boolean
      dragEnabled?: boolean
      onDragEndTask?: () => void
      onCreateTask?: () => void
      dndDroppableId?: string
    } = {}
  ) => {
    const listSortKey = resolveListSortKey()
    const listSortMode = resolveListSortMode()
    const reorderEnabled = !!listSortKey && listSortMode === 'default'
    const handleReorder = reorderEnabled
      ? (orderedIds: string[]) => handleReorderTasks(orderedIds, listSortKey!)
      : undefined
    return (
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
        contextProjectId={selectedProjectId}
        contextAreaId={selectedAreaId}
        editingState={editingState}
        editingHandlers={editingHandlers}
        onStartEdit={handleEditTask}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onToggleTask={(taskId) => toggleTaskMutation.mutate(taskId)}
        togglePending={toggleTaskMutation.isPending}
        onDeleteTask={handleRequestDeleteTask}
        deletePending={deleteTaskMutation.isPending}
        onOpenEditDatePicker={(anchor) => openDatePicker('edit', 'when', anchor)}
        onOpenDeadlinePicker={(anchor) => openDatePicker('edit', 'deadline', anchor)}
        onOpenLabelSheet={handleOpenTaskLabelSheet}
        onOpenChecklist={(task, anchor) => handleOpenChecklistSheet(task.id, anchor)}
        onOpenMoveSheet={handleOpenMoveSheet}
        onArchiveTask={handleArchiveTask}
        archivePending={archiveTaskMutation.isPending}
        onConvertToProject={handleConvertToProject}
        convertPending={convertTaskMutation.isPending}
        onOpenOverflowMenu={(task) => handleOpenOverflowMenu(task.id)}
        onToggleCollapsedChecklist={handleToggleCollapsedChecklist}
        onApplyQuickView={handleApplyQuickView}
        quickViewPending={applyQuickViewMutation.isPending}
        formatDateLabel={formatDateForLabel}
        renderDraftCard={options.renderDraftCard}
        showDraftCard={options.showDraftCard}
        autoSaveOnBlur={variant === 'desktop' ? options.autoSaveOnBlur : false}
        dragEnabled={options.dragEnabled && !isMultiSelectMode}
        onDragEndTask={options.onDragEndTask}
        highlightedTaskId={highlightedTaskId}
        multiSelectMode={isMultiSelectMode}
        selectedTaskIds={selectedTaskIds}
        onToggleSelection={toggleTaskSelection}
        onCreateTask={options.onCreateTask}
        sortKey={listSortKey ?? undefined}
        sortMode={listSortMode}
        onReorderTasks={handleReorder}
        dndDroppableId={options.dndDroppableId}
      />
    )
  }

  const quickViewLabels: Record<QuickViewId, string> = useMemo(() => ({
    inbox: customViewNames.inbox?.trim() || translate(language, 'view.inbox'),
    today: customViewNames.today?.trim() || translate(language, 'view.today'),
    upcoming: customViewNames.upcoming?.trim() || translate(language, 'view.upcoming'),
    anytime: customViewNames.anytime?.trim() || translate(language, 'view.anytime'),
    waiting: customViewNames.waiting?.trim() || translate(language, 'view.waiting'),
    someday: customViewNames.someday?.trim() || translate(language, 'view.someday'),
    reference: customViewNames.reference?.trim() || translate(language, 'view.reference'),
    logbook: customViewNames.logbook?.trim() || translate(language, 'view.logbook'),
  }), [customViewNames, language])
  const quickViewEmojis: Record<QuickViewId, string> = useMemo(() => ({
    inbox: '📥',
    today: '⭐',
    upcoming: '📆',
    anytime: '🌤️',
    waiting: '⏳',
    someday: '📦',
    reference: '📚',
    logbook: '✅',
  }), [])

  const quickViewDescriptions: Record<QuickViewId, string> = useMemo(() => ({
    inbox: translate(language, 'view.desc.inbox'),
    today: translate(language, 'view.desc.today'),
    upcoming: translate(language, 'view.desc.upcoming'),
    anytime: translate(language, 'view.desc.anytime'),
    waiting: translate(language, 'view.desc.waiting'),
    someday: translate(language, 'view.desc.someday'),
    reference: translate(language, 'view.desc.reference'),
    logbook: translate(language, 'view.desc.logbook'),
  }), [language])
  const quickViewLabelIds = useMemo(() => {
    const payload: Record<'waiting' | 'reference', string[]> = { waiting: [], reference: [] }
    labels.forEach(label => {
      const view = getLabelQuickView(label.name)
      if (view === 'waiting' || view === 'reference') {
        payload[view].push(label.id)
      }
    })
    return payload
  }, [labels])
  const getDraftLabelIdsForView = useCallback(
    (view: QuickViewId, current: string[]) => {
      const waitingIds = quickViewLabelIds.waiting
      const referenceIds = quickViewLabelIds.reference
      if (waitingIds.length === 0 && referenceIds.length === 0) {
        return current
      }
      const cleaned = current.filter(id => !waitingIds.includes(id) && !referenceIds.includes(id))
      if (view === 'waiting' && waitingIds.length) {
        return Array.from(new Set([...cleaned, ...waitingIds]))
      }
      if (view === 'reference' && referenceIds.length) {
        return Array.from(new Set([...cleaned, ...referenceIds]))
      }
      return cleaned
    },
    [quickViewLabelIds]
  )
  const applyQuickViewLabels = useCallback(
    (view: QuickViewId) => {
      setTaskLabels(prev => getDraftLabelIdsForView(view, prev))
    },
    [getDraftLabelIdsForView, setTaskLabels]
  )

  const quickLists = useMemo(() => ([
    { id: 'inbox', label: quickViewLabels.inbox, icon: inboxIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'today', label: quickViewLabels.today, icon: todayIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'upcoming', label: quickViewLabels.upcoming, icon: upcomingIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'anytime', label: quickViewLabels.anytime, icon: anytimeIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'waiting', label: quickViewLabels.waiting, icon: waitingIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'someday', label: quickViewLabels.someday, icon: somedayIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'reference', label: quickViewLabels.reference, icon: referenceIcon, accent: 'text-[var(--color-text-muted)]' },
    { id: 'logbook', label: quickViewLabels.logbook, icon: logbookIcon, accent: 'text-[var(--color-text-muted)]' },
  ] as const), [quickViewLabels])
  const creationViewOptions = quickLists.filter(list => list.id !== 'logbook')
  const currentQuickView = quickLists.find(list => list.id === activeQuickView) || quickLists[0]
  const moveSheetTask = moveSheetTaskId ? tasks.find(task => task.id === moveSheetTaskId) ?? null : null
  const overflowTask = overflowTaskId ? tasks.find(task => task.id === overflowTaskId) ?? null : null
  const editingTask = editingId ? tasks.find(task => task.id === editingId) ?? null : null
  const shouldAutoSaveEdit =
    labelSheetTarget === null &&
    !scheduleSheetOpen &&
    moveSheetTaskId === null &&
    !multiSelectMoveOpen &&
    !isChecklistSheetOpen &&
    overflowTaskId === null &&
    datePickerTarget === null &&
    !isMultiSelectMode
  const shouldAutoSaveDraft = labelSheetTarget === null && datePickerTarget === null

  const handleSelectQuickView = (view: QuickViewId) => {
    clearSearchState()
    setActiveQuickView(view)
    setSelectedProjectId(null)
    setSelectedAreaId(null)
    setActiveProjectFilterChip('all')
    setShowNewListMenu(false)
    setMobileProjectFocusId(null)
    if (useMobileExperience) {
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
      isMobile={useMobileExperience}
      draft={taskDraft}
      projects={projects}
      areas={areas}
      headings={projectHeadings}
      labels={orderedLabels}
      creationViewOptions={creationViewOptions}
      dueDateLabel={formatDateForLabel(taskDraft.due_at)}
      deadlineDateLabel={formatDateForLabel(taskDraft.deadline_at)}
      savingTask={addTaskMutation.isPending}
      savingLabel={addInlineLabelMutation.isPending}
      onClose={handleCloseTaskModal}
      onSubmit={handleAddTask}
      onUpdateDraft={updateTaskDraft}
      onApplyViewPreset={applyViewPreset}
      onRequestDueDate={(anchor) => openDatePicker('new', 'when', anchor)}
      onRequestDeadline={(anchor) => openDatePicker('new', 'deadline', anchor)}
      onToggleLabel={toggleNewTaskLabel}
      inlineLabelName={inlineLabelName}
      onInlineLabelNameChange={setInlineLabelName}
      onCreateInlineLabel={handleInlineLabelCreate}
    />
  )

  const renderDeleteConfirmation = () => {
    if (!deleteTarget) {
      return null
    }
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4"
        onClick={handleCancelDelete}
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-container)] bg-[var(--color-surface)] border border-[var(--color-border)] "
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Confirmar eliminación</p>
            <p className="text-lg font-semibold text-[var(--on-surface)]">Eliminar tarea</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              ¿Seguro que deseas enviar a la papelera la tarea <span className="font-semibold text-[var(--on-surface)]">"{deleteTarget.title}"</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="min-h-[44px] px-5 py-2 rounded-[var(--radius-card)] bg-[var(--color-danger-500)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderBulkDeleteConfirmation = () => {
    if (!bulkDeleteIds) {
      return null
    }
    const countLabel = bulkDeleteIds.length === 1 ? '1 tarea' : `${bulkDeleteIds.length} tareas`
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4"
        onClick={handleCancelBulkDelete}
      >
        <div
          className="w-full max-w-md rounded-[var(--radius-container)] bg-[var(--color-surface)] border border-[var(--color-border)] "
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-[var(--color-border)]">
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Confirmar eliminación</p>
            <p className="text-lg font-semibold text-[var(--on-surface)]">Eliminar tareas</p>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              ¿Seguro que deseas enviar a la papelera {countLabel} seleccionadas?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelBulkDelete}
                className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={batchActionPending}
                className="min-h-[44px] px-5 py-2 rounded-[var(--radius-card)] bg-[var(--color-danger-500)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const selectedProject = selectedProjectId ? projects.find(project => project.id === selectedProjectId) ?? null : null
  const selectedArea = selectedAreaId ? areas.find(area => area.id === selectedAreaId) ?? null : null
  const activeTaskCount = filteredTasks.filter(task => task.status !== 'done').length
  const completedCount = filteredTasks.filter(task => task.status === 'done').length
  const activeFilters = useMemo(
    () => buildActiveFilters(selectedProjectId, projects, activeLabelIds, labels, selectedAreaId, areas, language),
    [selectedProjectId, projects, activeLabelIds, labels, selectedAreaId, areas, language]
  )
  const filteredViewActive = isFilteredView(
    activeQuickView,
    '',
    selectedProjectId,
    selectedLabelIds,
    selectedAreaId
  )

  const friendlyToday = useMemo(() => {
    const locale = language === 'en' ? 'en-US' : 'es-ES'
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }, [language])

  const isMobileDetail = useMobileExperience && !showMobileHome
  const mobileProject = mobileProjectFocusId ? projects.find(project => project.id === mobileProjectFocusId) ?? null : null
  const selectedAreaProjectCount = selectedArea ? projects.filter(project => project.area_id === selectedArea.id).length : 0
  const isMobileProjectView = isMobileDetail && !!mobileProject
  const visibleMobileTasks = isMobileDetail ? filteredTasks.slice(0, mobileTaskLimit) : filteredTasks
  const canShowMoreMobileTasks = isMobileDetail && mobileTaskLimit < filteredTasks.length
  const upcomingMobileSections = useMemo(() => {
    if (!useMobileExperience || activeQuickView !== 'upcoming' || selectedProjectId || selectedAreaId) {
      return null
    }
    if (visibleMobileTasks.length === 0) {
      return []
    }
    const locale = language === 'en' ? 'en-US' : 'es-ES'
    const capitalize = (value: string) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : value)
    const todayDate = parseISODate(todayISO) ?? new Date()
    todayDate.setHours(0, 0, 0, 0)
    const weekLimit = new Date(todayDate)
    weekLimit.setDate(todayDate.getDate() + 7)

    const sortedTasks = [...visibleMobileTasks].sort((a, b) => {
      const aDate = normalizeDate(a.due_at) || ''
      const bDate = normalizeDate(b.due_at) || ''
      if (aDate !== bDate) {
        return aDate.localeCompare(bDate)
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    const dayBuckets = new Map<string, Task[]>()
    const monthBuckets = new Map<string, Task[]>()
    const undated: Task[] = []

    sortedTasks.forEach(task => {
      const normalized = normalizeDate(task.due_at)
      if (!normalized) {
        undated.push(task)
        return
      }
      const dueDate = parseISODate(normalized)
      if (!dueDate || Number.isNaN(dueDate.getTime())) {
        undated.push(task)
        return
      }
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate <= weekLimit) {
        const bucket = dayBuckets.get(normalized) || []
        bucket.push(task)
        dayBuckets.set(normalized, bucket)
        return
      }
      const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`
      const bucket = monthBuckets.get(monthKey) || []
      bucket.push(task)
      monthBuckets.set(monthKey, bucket)
    })

    const sections: Array<{ id: string; label: string; dayNumber?: string; tasks: Task[] }> = []
    const dayKeys = Array.from(dayBuckets.keys()).sort()
    dayKeys.forEach((key) => {
      const dayTasks = dayBuckets.get(key) || []
      const date = parseISODate(key)
      if (!date) {
        return
      }
      date.setHours(0, 0, 0, 0)
      const diffDays = Math.round((date.getTime() - todayDate.getTime()) / 86400000)
      const label =
        diffDays === 0
          ? t('view.today')
          : diffDays === 1
            ? t('datePicker.option.tomorrow')
            : capitalize(date.toLocaleDateString(locale, { weekday: 'long' }))
      sections.push({
        id: `day-${key}`,
        label,
        dayNumber: String(date.getDate()),
        tasks: dayTasks,
      })
    })

    const monthKeys = Array.from(monthBuckets.keys()).sort()
    monthKeys.forEach((key) => {
      const monthTasks = monthBuckets.get(key) || []
      const [yearStr, monthStr] = key.split('-')
      const monthDate = new Date(Number(yearStr), Number(monthStr) - 1, 1)
      const monthLabel = capitalize(
        monthDate.toLocaleDateString(locale, {
          month: 'long',
          year: monthDate.getFullYear() === todayDate.getFullYear() ? undefined : 'numeric',
        })
      )
      sections.push({
        id: `month-${key}`,
        label: monthLabel,
        tasks: monthTasks,
      })
    })

    if (undated.length > 0) {
      sections.push({ id: 'undated', label: t('datePicker.none'), tasks: undated })
    }

    return sections
  }, [
    useMobileExperience,
    activeQuickView,
    selectedProjectId,
    selectedAreaId,
    visibleMobileTasks,
    language,
    todayISO,
    t,
  ])
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
    return filteredTasks
  }, [filteredTasks, selectedProject, activeProjectFilterChip])

  const contextLabel = selectedProject
    ? translate(language, 'context.label.project')
    : selectedArea
      ? translate(language, 'context.label.area')
      : translate(language, 'context.label.view')
  const contextTitle = selectedProject
    ? selectedProject.name
    : selectedArea
      ? selectedArea.name
      : currentQuickView.label
  const areaTaskSummary = selectedArea ? areaStats.get(selectedArea.id) : null
  const contextDescription = selectedProject
    ? selectedArea
      ? `${translate(language, 'context.label.area')}: ${selectedArea.name}`
      : ''
    : selectedArea
      ? `${selectedAreaProjectCount} ${translate(language, 'sidebar.projects').toLowerCase()} · ${areaTaskSummary?.total || 0} ${translate(language, 'sidebar.tasks')}`
      : quickViewDescriptions[activeQuickView]
  const pendingCount = selectedProject
    ? visibleProjectTasks.filter(task => task.status !== 'done').length
    : filteredTasks.filter(task => task.status !== 'done').length
  const overdueCount = selectedProject
    ? visibleProjectTasks.filter(task => isTaskOverdue(task)).length
    : filteredTasks.filter(task => isTaskOverdue(task)).length
  const headerChipItems = selectedProject
    ? [
      { id: 'all', label: translate(language, 'filters.all') },
      ...projectChipOptions.map(label => ({ id: label.id, label: label.name })),
    ]
    : []

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
    if (activeLabelIds.length === 0) {
      if (activeProjectFilterChip !== 'all') {
        setActiveProjectFilterChip('all')
      }
      return
    }
    const first = activeLabelIds[0]
    if (activeProjectFilterChip !== first) {
      setActiveProjectFilterChip(first)
    }
  }, [activeLabelIds, activeProjectFilterChip])
  useEffect(() => {
    if (showQuickHeadingForm && !selectedProjectId) {
      setShowQuickHeadingForm(false)
    }
    if (!showQuickHeadingForm) {
      setNewHeadingName('')
    }
  }, [selectedProjectId, showQuickHeadingForm])

  const suggestionResults = useMemo(() => {
    if (!normalizedSearch) {
      return []
    }
    return searchResults.slice(0, 6)
  }, [normalizedSearch, searchResults])

  const showSuggestionPanel = isSearchFocused && normalizedSearch.length > 0

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

  const clearSearchState = useCallback(() => {
    setSearchQuery('')
    setIsSearchFocused(false)
  }, [])

  const handleMobileHomeSearchFocus = () => {
    handleSearchFocus()
  }

  const handleSuggestionSelect = (task: Task) => {
    setSearchQuery('')
    setIsSearchFocused(false)
    setSelectedLabelIds([])
    setShowNewListMenu(false)
    setActiveProjectFilterChip('all')
    if (task.project_id) {
      setSelectedProjectId(task.project_id)
      const project = projects.find(project => project.id === task.project_id)
      setSelectedAreaId(task.area_id ?? project?.area_id ?? null)
      setActiveQuickView('inbox')
    } else if (task.area_id) {
      setSelectedAreaId(task.area_id)
      setSelectedProjectId(null)
      setActiveQuickView('inbox')
    } else {
      setSelectedProjectId(null)
      setSelectedAreaId(null)
      setActiveQuickView(getTaskView(task, todayISO))
    }
    highlightTask(task.id)
    handleEditTask(task)
  }

  const handleClearSearch = () => {
    clearSearchState()
  }

  const openDesktopQuickFind = useCallback(() => {
    setIsQuickFindOpen(true)
    setQuickFindQuery('')
  }, [])

  useEffect(() => {
    if (useMobileExperience || typeof window === 'undefined') {
      return
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase()
      if (target?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select') {
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openDesktopQuickFind()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openDesktopQuickFind, useMobileExperience, isQuickFindOpen])

  const quickFindResults = useMemo(() => {
    const q = quickFindQuery.toLowerCase().trim()
    if (!q) return []

    const res: QuickFindResult[] = []

    // Views
    quickLists.forEach(l => {
      if (l.label.toLowerCase().includes(q)) {
        res.push({ id: l.id, type: 'view', title: l.label, payload: l.id })
      }
    })

    // Projects
    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q)) {
        res.push({ id: p.id, type: 'project', title: p.name, payload: p })
      }
    })

    // Areas
    areas.forEach(a => {
      if (a.name.toLowerCase().includes(q)) {
        res.push({ id: a.id, type: 'area', title: a.name, payload: a })
      }
    })

    // Tasks (Top 10)
    tasks.filter(t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q))
      .slice(0, 10)
      .forEach(t => {
        res.push({ id: t.id, type: 'task', title: t.title, subtitle: t.notes || undefined, payload: t })
      })

    return res
  }, [quickFindQuery, tasks, projects, areas, quickLists])

  const handleQuickFindSelect = (result: QuickFindResult) => {
    setIsQuickFindOpen(false)
    if (result.type === 'view') {
      applyViewPreset(result.payload as QuickViewId)
    } else if (result.type === 'project') {
      setSelectedProjectId(result.id)
      setSelectedAreaId(null)
      setActiveQuickView('inbox')
    } else if (result.type === 'area') {
      setSelectedAreaId(result.id)
      setSelectedProjectId(null)
      setActiveQuickView('inbox')
    } else if (result.type === 'task') {
      const task = result.payload as Task
      highlightTask(task.id)
      handleEditTask(task)
    }
  }

  const formatDateForLabel = (value: string) => {
    if (!value) {
      return t('datePicker.none')
    }
    const date = parseISODate(value)
    if (!date || Number.isNaN(date.getTime())) {
      return t('datePicker.none')
    }
    const locale = language === 'en' ? 'en-US' : 'es-ES'
    return date.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  const openDatePicker = (target: 'new' | 'edit' | 'draft', intent: 'when' | 'deadline' = 'when', anchor?: HTMLElement | null) => {
    const rawValue = intent === 'when'
      ? target === 'new'
        ? taskDraft.due_at
        : target === 'edit'
          ? editingDueAt
          : mobileDraftTask?.due_at || ''
      : target === 'new'
        ? taskDraft.deadline_at
        : target === 'edit'
          ? editingDeadlineAt
          : mobileDraftTask?.deadline_at || ''
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
    setDatePickerAnchor(anchor || null)
    setDatePickerTarget(target)
    setDatePickerIntent(intent)
  }

  const closeDatePicker = () => {
    setDatePickerTarget(null)
    setDatePickerAnchor(null)
    setDatePickerIntent('when')
  }

  const applyPickedDate = (value: string | null) => {
    const isSomeday = value === 'someday'
    const normalized = isSomeday ? '' : (value || '')
    if (datePickerIntent === 'deadline') {
      if (datePickerTarget === 'new') {
        updateTaskDraft('deadline_at', normalized)
      } else if (datePickerTarget === 'edit') {
        setEditingDeadlineAt(normalized)
        if (editingId) {
          // Auto-save deadline when picked
          updateTaskMutation.mutate({
            taskId: editingId,
            title: editingTitle,
            notes: editingNotes,
            dueAt: editingDueAt,
            deadlineAt: normalized,
            projectId: editingProjectId,
            areaId: editingAreaId,
            headingId: editingHeadingId,
            checklist: editingChecklist,
          })
        }
      } else if (datePickerTarget === 'draft') {
        updateMobileDraft(prev => (prev ? { ...prev, deadline_at: normalized || null } : prev))
      }
    } else {
      if (datePickerTarget === 'new') {
        updateTaskDraft('due_at', normalized)
        const nextView = isSomeday ? 'someday' : determineViewFromDate(normalized, todayISO, taskDraft.view)
        updateTaskDraft('view', nextView)
        applyQuickViewLabels(nextView)
        updateTaskDraft('status', nextView === 'anytime' ? 'open' : nextView === 'someday' ? 'snoozed' : 'open')
      } else if (datePickerTarget === 'edit') {
        setEditingDueAt(normalized)
        if (editingId) {
          // Auto-save date when picked
          updateTaskMutation.mutate({
            taskId: editingId,
            title: editingTitle,
            notes: editingNotes,
            dueAt: normalized,
            deadlineAt: editingDeadlineAt,
            projectId: editingProjectId,
            areaId: editingAreaId,
            headingId: editingHeadingId,
            checklist: editingChecklist,
          })
        }
      } else if (datePickerTarget === 'draft') {
        updateMobileDraft(prev => {
          if (!prev) return prev
          const nextView = isSomeday ? 'someday' : determineViewFromDate(normalized, todayISO, prev.view)
          return {
            ...prev,
            due_at: normalized || null,
            view: nextView,
            labelIds: getDraftLabelIdsForView(nextView, prev.labelIds),
          }
        })
      }
    }
    setDatePickerTarget(null)
    setDatePickerAnchor(null)
    setDatePickerIntent('when')
  }

  const handleDatePickerMonthChange = (offset: number) => {
    setDatePickerMonth(prev => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + offset)
      return next
    })
  }



  const agendaLocale = language === 'en' ? 'en-US' : 'es-ES'
  const buildAgendaEntries = (taskList: Task[]) => {
    const entries = taskList
      .map(task => {
        if (!task.start_at || !task.start_at.includes('T')) {
          return null
        }
        const date = parseISODate(task.start_at)
        if (!date) {
          return null
        }
        if (formatISODate(date) !== todayISO) {
          return null
        }
        const timeLabel = date.toLocaleTimeString(agendaLocale, {
          hour: 'numeric',
          minute: '2-digit',
        })
        return { id: task.id, title: task.title, timeLabel, timeValue: date.getTime() }
      })
      .filter((entry): entry is { id: string; title: string; timeLabel: string; timeValue: number } => !!entry)
      .sort((a, b) => a.timeValue - b.timeValue)
    return entries.map(({ timeValue: _timeValue, ...entry }) => entry)
  }

  const renderTaskBody = (
    variant: 'desktop' | 'mobile',
    taskSource?: Task[],
    showEmptyState = true,
    options: {
      showLoadingState?: boolean
      renderDraftCard?: () => ReactNode
      showDraftCard?: boolean
      autoSaveOnBlur?: boolean
      dragEnabled?: boolean
      onDragEndTask?: () => void
      onCreateTask?: () => void
      dndDroppableId?: string
    } = {}
  ) => {
    const tasks = taskSource ?? (variant === 'mobile' ? visibleMobileTasks : filteredTasks)
    const showLoadingState = options.showLoadingState ?? !taskSource
    const isAgendaContext =
      activeQuickView === 'today' && !selectedProjectId && !selectedAreaId
    const agendaSource = variant === 'mobile' ? filteredTasks : tasks
    const agendaEntries = isAgendaContext ? buildAgendaEntries(agendaSource) : []
    const dragEnabled = options.dragEnabled ?? (variant === 'desktop')
    const agendaCard =
      agendaEntries.length > 0 ? (
        <AgendaSummary
          variant={variant}
          entries={agendaEntries}
          onSelectEntry={(taskId) => {
            const task = tasks.find(item => item.id === taskId)
            if (task) {
              handleEditTask(task)
              highlightTask(taskId)
            }
          }}
        />
      ) : null

    return (
      <>
        {agendaCard}
        {renderTaskList(variant, tasks, {
          showEmptyState,
          showLoadingState,
          renderDraftCard: options.renderDraftCard,
          showDraftCard: options.showDraftCard,
          autoSaveOnBlur: options.autoSaveOnBlur ?? shouldAutoSaveEdit,
          dragEnabled,
          onDragEndTask: options.onDragEndTask,
          onCreateTask: options.onCreateTask,
          dndDroppableId: options.dndDroppableId || dndIds.quickView.list(activeQuickView),
        })}
      </>
    )
  }





  const renderMobileCreationSheet = () => (
    <MobileCreationSheet
      isOpen={useMobileExperience && showMobileCreationSheet}
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
              labelIds: getDraftLabelIdsForView(view, prev.labelIds),
            }
            : prev
        )
      }}
    />
  )

  const renderLabelSheet = () => (
    <LabelSheet
      open={!!labelSheetTarget}
      anchorEl={labelSheetAnchor}
      isMobile={useMobileExperience}
      labels={orderedLabels}
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

  const renderChecklistSheet = () => (
    <ChecklistSheet
      open={isChecklistSheetOpen}
      items={editingChecklist}
      onClose={() => setChecklistSheetOpen(false)}
      onToggle={handleChecklistToggle}
      onAdd={handleChecklistAdd}
      onUpdate={handleChecklistUpdate}
      onRemove={handleChecklistRemove}
      onReorder={handleChecklistReorder}
    />
  )

  const renderOverflowMenu = () => {
    const waitingActive = overflowTask
      ? (overflowTask.labels || []).some(label => getLabelQuickView(label.name) === 'waiting')
      : false
    const referenceActive = overflowTask
      ? (overflowTask.labels || []).some(label => getLabelQuickView(label.name) === 'reference')
      : false
    const somedayActive = overflowTask?.status === 'snoozed'
    const quickViewActions: Array<{ id: 'waiting' | 'someday' | 'reference'; label: string; active: boolean }> = overflowTask
      ? [
        { id: 'waiting', label: quickViewLabels.waiting, active: waitingActive },
        { id: 'someday', label: quickViewLabels.someday, active: somedayActive },
        { id: 'reference', label: quickViewLabels.reference, active: referenceActive },
      ]
      : []

    return (
      <TaskOverflowMenu
        open={overflowTaskId !== null}
        task={overflowTask}
        isDuplicating={duplicateTaskMutation.isPending}
        isPinning={togglePinMutation.isPending}
        isApplyingQuickView={applyQuickViewMutation.isPending}
        quickViewActions={quickViewActions}
        onApplyQuickView={(view) => {
          if (overflowTask) {
            handleApplyQuickView(overflowTask, view)
          }
        }}
        onTogglePin={handleTogglePinnedTask}
        onDuplicate={handleDuplicateTask}
        onCopyLink={handleCopyTaskLink}
        onClose={handleCloseOverflowMenu}
      />
    )
  }

  const renderMoveSheet = () => (
    <MoveTaskSheet
      open={!!moveSheetTaskId || multiSelectMoveOpen}
      task={moveSheetTask}
      areas={areas}
      projects={projects}
      isProcessing={moveTaskMutation.isPending || batchActionPending}
      titleOverride={
        multiSelectMoveOpen
          ? language === 'en'
            ? `Move ${selectedTaskIds.length} tasks`
            : `Mover ${selectedTaskIds.length} tareas`
          : undefined
      }
      onClose={() => {
        handleCloseMoveSheet()
        setMultiSelectMoveOpen(false)
      }}
      onSelect={multiSelectMoveOpen ? handleConfirmMultiMoveDestination : handleConfirmMoveDestination}
    />
  )

  const renderDesktopDraftTaskCard = () =>
    showDesktopDraft ? (
      <DesktopDraftCard
        draft={taskDraft}
        viewLabel={quickViewLabels[taskDraft.view]}
        dueLabel={formatDateForLabel(taskDraft.due_at)}
        deadlineLabel={formatDateForLabel(taskDraft.deadline_at)}
        labelCount={taskDraft.labelIds.length}
        onSubmit={handleAddTask}
        onCancel={handleCancelDesktopDraft}
        onTitleChange={(value) => updateTaskDraft('title', value)}
        onNotesChange={(value) => updateTaskDraft('notes', value)}
        onRequestDueDate={(anchor) => openDatePicker('new', 'when', anchor)}
        onRequestDeadline={(anchor) => openDatePicker('new', 'deadline', anchor)}
        onOpenLabels={() => {
          setLabelSheetSelection(taskDraft.labelIds)
          setLabelSheetTarget({ kind: 'draft-task' })
        }}
        autoSaveEnabled={shouldAutoSaveDraft}
      />
    ) : null


  const renderMobileDraftTaskCard = () => (
    mobileDraftTask ? (
      <MobileDraftCard
        draft={mobileDraftTask}
        labels={orderedLabels}
        scheduleLabel={quickViewLabels[mobileDraftTask.view]}
        onTitleChange={(value) => updateMobileDraft(prev => (prev ? { ...prev, title: value } : prev))}
        onNotesChange={(value) => updateMobileDraft(prev => (prev ? { ...prev, notes: value } : prev))}
        onSchedulePress={() => setScheduleSheetOpen(true)}
        onLabelsPress={() => {
          setLabelSheetSelection(mobileDraftTask.labelIds)
          setLabelSheetTarget({ kind: 'draft-task' })
        }}
        onDatePress={() => openDatePicker('draft', 'when')}
        onDeadlinePress={() => openDatePicker('draft', 'deadline')}
        onCancel={handleCancelMobileDraftTask}
        onSave={handleSaveMobileDraftTask}
        saving={addTaskMutation.isPending}
      />
    ) : null
  )

  const renderMobileTaskEditSheet = () => (
    <MobileTaskEditSheet
      open={useMobileExperience && !!editingTask}
      task={editingTask}
      title={editingTitle}
      notes={editingNotes}
      dueLabel={formatDateForLabel(editingDueAt)}
      deadlineLabel={formatDateForLabel(editingDeadlineAt)}
      labelCount={editingTask?.labels?.length ?? 0}
      onChangeTitle={setEditingTitle}
      onChangeNotes={setEditingNotes}
      onClose={handleCancelEdit}
      onSave={() => handleSaveEdit()}
      onOpenDatePicker={() => openDatePicker('edit', 'when')}
      onOpenDeadlinePicker={() => openDatePicker('edit', 'deadline')}
      onOpenLabels={() => {
        if (editingTask) {
          handleOpenTaskLabelSheet(editingTask, null)
        }
      }}
      onOpenChecklist={() => {
        if (editingTask) {
          handleOpenChecklistSheet(editingTask.id, null)
        }
      }}
      onMove={() => {
        if (editingTask) {
          handleOpenMoveSheet(editingTask, null)
        }
      }}
      onDelete={() => {
        if (editingTask) {
          handleRequestDeleteTask(editingTask.id)
        }
      }}
      onOpenMenu={() => {
        if (editingTask) {
          handleOpenOverflowMenu(editingTask.id)
        }
      }}
      saving={updateTaskMutation.isPending}
    />
  )

  const dragUpdateTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'drag-update'],
    networkMode: 'online',
    mutationFn: async (payload: { taskId: string; updates: Partial<Task>; successMessage?: string }) => {
      const result = await updateTask(payload.taskId, payload.updates)
      if (!result.success) {
        return result
      }
      return { ...result, successMessage: payload.successMessage }
    },
    onMutate: async (payload) => {
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks'] })
      const shouldResetQuickView = 'due_at' in payload.updates || 'status' in payload.updates
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
        if (!old) return old
        return old.map(task => {
          if (task.id !== payload.taskId) return task
          const nextTask = { ...task, ...payload.updates }
          if (shouldResetQuickView) {
            nextTask.quick_view = undefined
          }
          return nextTask
        })
      })
      return { previous }
    },
    onSuccess: (result, payload) => {
      if (result.success) {
        setError('')
        if (payload.successMessage) {
          pushSuccessMessage(payload.successMessage)
        }
        if (editingId === payload.taskId) {
          if ('due_at' in payload.updates) {
            setEditingDueAt(payload.updates.due_at ? String(payload.updates.due_at) : '')
          }
          if ('deadline_at' in payload.updates) {
            setEditingDeadlineAt(payload.updates.deadline_at ? String(payload.updates.deadline_at) : '')
          }
          if ('heading_id' in payload.updates) {
            setEditingHeadingId(payload.updates.heading_id ?? null)
          }
          if ('project_id' in payload.updates) {
            setEditingProjectId(payload.updates.project_id ?? null)
          }
          if ('area_id' in payload.updates) {
            setEditingAreaId(payload.updates.area_id ?? null)
          }
        }
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al mover tarea')
      }
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      setError('Error inesperado al mover tarea')
    },
  })

  const resolveUpcomingDropDate = useCallback((sectionId: string) => {
    if (sectionId.startsWith('day-')) {
      return sectionId.replace('day-', '') || null
    }
    if (sectionId.startsWith('month-')) {
      const key = sectionId.replace('month-', '')
      const [year, month] = key.split('-')
      if (!year || !month) {
        return null
      }
      return `${year}-${month}-01`
    }
    if (sectionId === 'undated') {
      return null
    }
    return null
  }, [])

  const clearUpcomingDragTarget = useCallback(() => {
    setUpcomingDropTargetId(null)
  }, [setUpcomingDropTargetId])

  const handleUpcomingDragOver = useCallback(
    (event: DragEvent<HTMLElement>, sectionId: string) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setUpcomingDropTargetId(sectionId)
    },
    [setUpcomingDropTargetId]
  )

  const handleUpcomingDrop = useCallback(
    (event: DragEvent<HTMLElement>, sectionId: string) => {
      event.preventDefault()
      const taskId = event.dataTransfer.getData('text/plain')
      setUpcomingDropTargetId(null)
      if (!taskId) {
        return
      }
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      const targetDate = resolveUpcomingDropDate(sectionId)
      const normalizedTarget = targetDate ? normalizeDate(targetDate) : null
      const normalizedCurrent = normalizeDate(task.due_at)
      if (normalizedCurrent === normalizedTarget) {
        return
      }
      dragUpdateTaskMutation.mutate({
        taskId,
        updates: { due_at: targetDate },
        successMessage: targetDate ? `Fecha actualizada a ${formatDateForLabel(targetDate)}` : 'Tarea sin fecha',
      })
    },
    [dragUpdateTaskMutation, formatDateForLabel, resolveUpcomingDropDate, taskById]
  )

  const renderMobileTaskBoard = () => {
    const showUpcomingCreateRow = !!upcomingMobileSections && !mobileDraftTask
    const upcomingCreateRow = showUpcomingCreateRow ? (
      <button
        type="button"
        onClick={() => startMobileTaskDraft('upcoming')}
        className="w-full min-h-[48px] px-4 py-3 rounded-[var(--radius-container)] border border-dashed border-[var(--color-border)] text-left hover:border-[var(--color-primary-400)]"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-[var(--on-surface)]">
          <span className="h-8 w-8 rounded-[var(--radius-card)] bg-[var(--color-surface-elevated)] flex items-center justify-center text-lg text-[var(--color-text-muted)]">+</span>
          {t('mobile.upcoming.addAfterToday')}
        </span>
      </button>
    ) : null
    const upcomingTaskList = upcomingMobileSections
      ? upcomingMobileSections.length === 0
        ? (
          <div className="space-y-6">
            {mobileDraftTask ? renderMobileDraftTaskCard() : null}
            {upcomingCreateRow}
            {renderTaskBody('mobile', [], true, { showLoadingState: false, onCreateTask: handleMobileNewTask })}
          </div>
        )
        : (
          <div className="space-y-6">
            {mobileDraftTask ? renderMobileDraftTaskCard() : null}
            {upcomingCreateRow}
            {upcomingMobileSections.map(section => (
              <section
                key={section.id}
                onDragOver={(event) => handleUpcomingDragOver(event, section.id)}
                onDragLeave={clearUpcomingDragTarget}
                onDrop={(event) => handleUpcomingDrop(event, section.id)}
                className={`space-y-3 rounded-[var(--radius-container)] ${upcomingDropTargetId === section.id ? 'ring-1 ring-[var(--color-primary-200)]' : ''
                  }`}
              >
                <div className="flex items-baseline gap-2 px-1">
                  {section.dayNumber ? (
                    <span className="text-2xl font-semibold text-[var(--on-surface)]">{section.dayNumber}</span>
                  ) : null}
                  <span className="text-sm font-semibold text-[var(--color-text-muted)]">{section.label}</span>
                </div>
                {renderTaskBody('mobile', section.tasks, false, {
                  showLoadingState: false,
                  dragEnabled: true,
                  onDragEndTask: clearUpcomingDragTarget,
                  onCreateTask: handleMobileNewTask,
                })}
              </section>
            ))}
          </div>
        )
      : renderTaskBody('mobile', undefined, true, {
        showLoadingState: true,
        renderDraftCard: renderMobileDraftTaskCard,
        showDraftCard: !!mobileDraftTask,
        onCreateTask: handleMobileNewTask,
      })

    return (
      <MobileTaskBoard
        taskList={upcomingTaskList}
        canShowMore={canShowMoreMobileTasks}
        onShowMore={handleShowMoreMobileTasks}
      />
    )
  }

  // Mutación para agregar tarea
  const addTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'add'],
    networkMode: 'online',
    mutationFn: async (args: {
      title: string
      notes?: string
      due_at?: string | null
      deadline_at?: string | null
      status?: 'open' | 'done' | 'snoozed'
      project_id?: string | null
      area_id?: string | null
      heading_id?: string | null
      quick_view?: QuickViewId
      labelIds?: string[]
      clientMutationId?: string
      sort_orders?: Record<string, number>
    }) => {
      const clientMutationId = args.clientMutationId || uuid()
      const result = await addTask(
        args.title,
        args.notes || undefined,
        args.due_at || undefined,
        args.status ?? 'open',
        args.project_id ?? null,
        args.area_id ?? null,
        args.heading_id ?? null,
        clientMutationId,
        args.quick_view,
        args.deadline_at ?? null,
        args.sort_orders
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
      return { ...result.task, clientMutationId }
    },
    onSuccess: () => {
      setError('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err: Error) => {
      setError(err.message || 'Error inesperado al crear tarea')
    },
  })

  const duplicateTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'duplicate'],
    networkMode: 'online',
    mutationFn: async (task: Task) => {
      const result = await addTask(
        `${task.title}`,
        task.notes || '',
        task.due_at ?? undefined,
        task.status,
        task.project_id,
        task.area_id,
        task.heading_id,
        undefined,
        task.quick_view,
        task.deadline_at ?? null,
        task.sort_orders ?? undefined
      )
      if (!result.success || !result.task) {
        throw new Error(result.error || 'Error al duplicar tarea')
      }
      const labelIds = (task.labels || []).map(label => label.id)
      if (labelIds.length > 0) {
        await Promise.all(labelIds.map(labelId => addTaskLabel(result.task!.id, labelId)))
      }
      return result.task
    },
    onSuccess: () => {
      setOverflowTaskId(null)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err: Error) => {
      setError(err.message || 'Error inesperado al duplicar tarea')
    },
  })

  const togglePinMutation = useMutation({
    mutationFn: ({ taskId, pinned }: { taskId: string; pinned: boolean }) => setTaskPinned(taskId, pinned),
    onSuccess: () => {
      setOverflowTaskId(null)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (err: Error) => {
      setError(err.message || 'Error al fijar tarea')
    },
  })

  const addLabelMutation = useMutation({
    mutationKey: ['mutations', 'labels', 'add'],
    networkMode: 'online',
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

  useEffect(() => {
    if (!labelsFetched || seededImportantLabelRef.current || !isOnline) {
      return
    }
    const hasImportant = labels.some(label => label.name.trim().toLowerCase() === 'importante')
    if (hasImportant) {
      seededImportantLabelRef.current = true
      return
    }
    seededImportantLabelRef.current = true
    addLabelMutation.mutate('Importante')
  }, [labels, labelsFetched, isOnline, addLabelMutation])

  const deleteLabelMutation = useMutation({
    mutationKey: ['mutations', 'labels', 'delete'],
    networkMode: 'online',
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

  const resolveQuickViewLabel = useCallback(
    async (view: 'waiting' | 'reference') => {
      const existing = labels.find(label => getLabelQuickView(label.name) === view)
      if (existing) {
        return existing
      }
      const fallbackName = view === 'waiting'
        ? translate(language, 'view.waiting')
        : translate(language, 'view.reference')
      const result = await addLabel(fallbackName)
      if (result.success && result.label) {
        queryClient.invalidateQueries({ queryKey: ['labels'] })
        return result.label
      }
      return null
    },
    [labels, language, queryClient]
  )

  const applyQuickViewMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'quickView'],
    networkMode: 'online',
    mutationFn: async (payload: {
      task: Task
      view: 'waiting' | 'someday' | 'reference'
      sortOrders?: Record<string, number>
    }) => {
      const { task, view, sortOrders } = payload
      const updates: Partial<Task> = {}
      if (view === 'someday') {
        updates.status = 'snoozed'
        updates.due_at = null
      } else {
        updates.status = 'open'
      }
      if (sortOrders) {
        updates.sort_orders = sortOrders
      }
      const updated = await updateTask(task.id, updates)
      if (!updated.success) {
        return updated
      }

      const labelViews = (task.labels || [])
        .map(label => ({ id: label.id, view: getLabelQuickView(label.name) }))
        .filter(label => label.view === 'waiting' || label.view === 'reference')

      const shouldRemove = (labelView: 'waiting' | 'reference') => {
        if (view === 'waiting') return labelView === 'reference'
        if (view === 'reference') return labelView === 'waiting'
        return true
      }

      const removeIds = labelViews.filter(label => shouldRemove(label.view as 'waiting' | 'reference')).map(label => label.id)
      if (removeIds.length > 0) {
        const removals = await Promise.all(removeIds.map(labelId => removeTaskLabel(task.id, labelId)))
        const failedRemoval = removals.find(result => !result.success)
        if (failedRemoval) {
          return { success: false, error: failedRemoval.error || 'Error al actualizar etiquetas' }
        }
      }

      if (view === 'waiting' || view === 'reference') {
        const label = await resolveQuickViewLabel(view)
        if (!label) {
          return { success: false, error: 'No se pudo crear la etiqueta necesaria' }
        }
        const added = await addTaskLabel(task.id, label.id)
        if (!added.success) {
          return { success: false, error: added.error || 'Error al actualizar etiquetas' }
        }
      }

      return updated
    },
    onSuccess: (result, payload) => {
      if (result.success) {
        setError('')
        if (payload.view === 'someday' && editingId === payload.task.id) {
          setEditingDueAt('')
        }
        setOverflowTaskId(null)
        pushSuccessMessage(`${t('task.quickView.title')} ${quickViewLabels[payload.view]}`)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al actualizar la vista rápida')
      }
    },
    onError: () => {
      setError('Error inesperado al actualizar la vista rápida')
    },
  })

  // Mutación para actualizar tarea
  const updateTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'update'],
    networkMode: 'online',
    mutationFn: async (payload: {
      taskId: string
      title: string
      notes: string
      dueAt: string
      deadlineAt: string
      projectId: string | null
      areaId: string | null
      headingId: string | null
      checklist: EditingChecklistItem[]
    }) => {
      const resolvedTitle = payload.title.trim() ? payload.title : 'Nueva tarea'
      const updated = await updateTask(payload.taskId, {
        title: resolvedTitle,
        notes: payload.notes,
        due_at: payload.dueAt || null,
        deadline_at: payload.deadlineAt || null,
        project_id: payload.projectId || null,
        area_id: payload.areaId || null,
        heading_id: payload.headingId || null,
      })
      if (!updated.success) {
        return updated
      }
      const checklistPayload = payload.checklist.map((item, index) => ({
        id: item.persisted ? item.id : undefined,
        text: item.text,
        completed: item.completed,
        sort_order: item.sortOrder ?? index,
      }))
      const synced = await syncTaskChecklist(payload.taskId, checklistPayload)
      if (!synced.success) {
        return { success: false, error: synced.error }
      }
      return updated
    },
    onMutate: async (variables) => {
      const resolvedTitle = variables.title.trim() ? variables.title.trim() : 'Nueva tarea'
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks'] })
      queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
        if (!old) return old
        return old.map(task => {
          if (task.id !== variables.taskId) return task
          return {
            ...task,
            title: resolvedTitle,
            notes: variables.notes,
            due_at: variables.dueAt || null,
            deadline_at: variables.deadlineAt || null,
            project_id: variables.projectId,
            area_id: variables.areaId,
            heading_id: variables.headingId,
          }
        })
      })
      return { previous }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        const resolvedTitle = variables.title.trim() ? variables.title.trim() : 'Nueva tarea'
        queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
          if (!old) return old
          return old.map(task => {
            if (task.id !== variables.taskId) return task
            return {
              ...task,
              ...result.task,
              title: resolvedTitle,
              notes: variables.notes,
              due_at: variables.dueAt || null,
              deadline_at: variables.deadlineAt || null,
              project_id: variables.projectId,
              area_id: variables.areaId,
              heading_id: variables.headingId,
            }
          })
        })
        const previousTitle = tasks.find(task => task.id === variables.taskId)?.title || ''
        if (previousTitle && previousTitle.trim() !== resolvedTitle) {
          pushSuccessMessage('Tarea renombrada')
        } else {
          pushSuccessMessage('Tarea actualizada')
        }
        setEditingId(null)
        setEditingTitle('')
        setEditingNotes('')
        setEditingDueAt('')
        setEditingDeadlineAt('')
        setEditingChecklist([])
        setChecklistSheetOpen(false)
        setOverflowTaskId(null)
        setError('')
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al actualizar tarea')
      }
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      setError('Error inesperado al actualizar tarea')
    },
  })

  const moveTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'move'],
    networkMode: 'online',
    mutationFn: ({ taskId, areaId, projectId }: { taskId: string; areaId: string | null; projectId: string | null }) => {
      const task = taskById.get(taskId)
      const sortKey = projectId
        ? `project:${projectId}`
        : areaId
          ? `area:${areaId}`
          : 'view:inbox'
      const sortOrders = task ? buildSortOrdersForKey(task, sortKey) : undefined
      return updateTask(taskId, {
        area_id: areaId,
        project_id: projectId,
        heading_id: null,
        sort_orders: sortOrders,
      })
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        setError('')
        const destinationProject = variables.projectId
          ? projects.find(project => project.id === variables.projectId)
          : null
        const destinationArea = variables.areaId ? areas.find(area => area.id === variables.areaId) : null
        if (destinationProject) {
          pushSuccessMessage(`Tarea movida a ${destinationProject.name}`)
        } else if (destinationArea) {
          pushSuccessMessage(`Tarea movida a ${destinationArea.name}`)
        } else {
          pushSuccessMessage('Tarea movida')
        }
        if (editingId === variables.taskId) {
          setEditingAreaId(variables.areaId)
          setEditingProjectId(variables.projectId)
          setEditingHeadingId(null)
        }
        setMoveSheetTaskId(null)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al mover tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al mover tarea')
    },
  })

  const archiveTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'archive'],
    networkMode: 'online',
    mutationFn: (taskId: string) =>
      updateTask(taskId, { status: 'done', completed_at: new Date().toISOString() }),
    onSuccess: (result, taskId) => {
      if (result.success) {
        setError('')
        pushSuccessMessage('Tarea archivada')
        if (editingId === taskId) {
          setEditingId(null)
          setEditingTitle('')
          setEditingNotes('')
          setEditingDueAt('')
          setEditingDeadlineAt('')
          setEditingProjectId(null)
          setEditingAreaId(null)
          setEditingHeadingId(null)
          setEditingChecklist([])
          setChecklistSheetOpen(false)
        }
        setOverflowTaskId(null)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al archivar tarea')
      }
    },
    onError: () => {
      setError('Error inesperado al archivar tarea')
    },
  })

  // Mutación para cambiar estado de tarea
  const toggleTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'toggleStatus'],
    networkMode: 'online',
    mutationFn: (taskId: string) => toggleTaskStatus(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        const statusLabel = result.task?.status === 'done'
          ? 'Tarea marcada como completada'
          : 'Tarea marcada como pendiente'
        pushSuccessMessage(statusLabel)
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al cambiar estado')
      }
    },
    onError: () => {
      setError('Error inesperado al cambiar estado')
    },
  })

  const toggleChecklistItemMutation = useMutation({
    mutationKey: ['mutations', 'checklist', 'toggle'],
    networkMode: 'online',
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      toggleChecklistItemCompletion(itemId, completed),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'No se pudo actualizar checklist')
      }
    },
    onError: () => {
      setError('Error inesperado al actualizar checklist')
    },
  })

  // Mutación para eliminar tarea
  const deleteTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'delete'],
    networkMode: 'online',
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (result) => {
      if (result.success) {
        setError('')
        setDeleteTarget(null)
        pushSuccessMessage('Tarea eliminada')
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
    mutationKey: ['mutations', 'areas', 'add'],
    networkMode: 'online',
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
    mutationKey: ['mutations', 'projects', 'add'],
    networkMode: 'online',
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

  const reorderProjectsMutation = useMutation({
    mutationKey: ['mutations', 'projects', 'reorder'],
    networkMode: 'online',
    mutationFn: async (updates: { id: string; sort_order: number; area_id?: string | null }[]) => {
      const results = await Promise.all(
        updates.map(({ id, ...rest }) => updateProject(id, rest))
      )
      const failed = results.find(result => !result.success)
      if (failed) {
        return { success: false, error: failed.error || 'Error al reordenar proyectos' }
      }
      return { success: true }
    },
    onSuccess: (result) => {
      if (result.success) {
        setError('')
      } else {
        setError(result.error || 'Error al reordenar proyectos')
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
    onError: () => {
      setError('Error inesperado al reordenar proyectos')
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const convertTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'convert'],
    networkMode: 'online',
    mutationFn: async (task: Task) => {
      if (task.project_id) {
        return { success: false, error: 'La tarea ya pertenece a un proyecto.' }
      }
      const projectName = task.title.trim() || 'Nuevo proyecto'
      const projectResult = await addProject(projectName, '#3b82f6', task.area_id ?? null)
      if (!projectResult.success || !projectResult.project) {
        return { success: false, error: projectResult.error || 'No se pudo crear el proyecto' }
      }
      const updated = await updateTask(task.id, {
        project_id: projectResult.project.id,
        area_id: null,
        heading_id: null,
      })
      if (!updated.success) {
        return { success: false, error: updated.error || 'No se pudo mover la tarea al proyecto' }
      }
      return { success: true, project: projectResult.project }
    },
    onSuccess: (result) => {
      if (result.success && result.project) {
        setError('')
        pushSuccessMessage('Proyecto creado')
        setSelectedProjectId(result.project.id)
        setSelectedAreaId(result.project.area_id ?? null)
        setActiveQuickView('inbox')
        setSelectedLabelIds([])
        setActiveProjectFilterChip('all')
        setShowNewListMenu(false)
        if (useMobileExperience) {
          setShowMobileHome(false)
        }
        setEditingId(null)
        setEditingTitle('')
        setEditingNotes('')
        setEditingDueAt('')
        setEditingDeadlineAt('')
        setEditingProjectId(null)
        setEditingAreaId(null)
        setEditingHeadingId(null)
        setEditingChecklist([])
        setChecklistSheetOpen(false)
        setOverflowTaskId(null)
        queryClient.invalidateQueries({ queryKey: ['projects'] })
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
      } else {
        setError(result.error || 'Error al convertir en proyecto')
      }
    },
    onError: () => {
      setError('Error inesperado al convertir en proyecto')
    },
  })

  // Mutaciones para headings
  const addHeadingMutation = useMutation({
    mutationKey: ['mutations', 'headings', 'add'],
    networkMode: 'online',
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
    mutationKey: ['mutations', 'headings', 'update'],
    networkMode: 'online',
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
    mutationKey: ['mutations', 'headings', 'delete'],
    networkMode: 'online',
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

  const reorderHeadingsMutation = useMutation({
    mutationKey: ['mutations', 'headings', 'reorder'],
    networkMode: 'online',
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      const results = await Promise.all(
        updates.map(update => updateProjectHeading(update.id, { sort_order: update.sort_order }))
      )
      const failed = results.find(result => !result.success)
      if (failed) {
        throw new Error(failed.error || 'Error al reordenar secciones')
      }
      return results
    },
    onError: (err: Error) => {
      setError(err.message || 'Error inesperado al reordenar secciones')
    },
  })

  const reorderTasksMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'reorder'],
    networkMode: 'online',
    mutationFn: async (updates: { id: string; sort_orders: Record<string, number> }[]) => {
      const results = await Promise.all(
        updates.map(update => updateTask(update.id, { sort_orders: update.sort_orders }))
      )
      const failed = results.find(result => !result.success)
      if (failed) {
        return { success: false, error: failed.error || 'Error al reordenar tareas' }
      }
      return { success: true }
    },
    onSuccess: (result) => {
      if (!result.success) {
        setError(result.error || 'Error al reordenar tareas')
      }
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: () => {
      setError('Error inesperado al reordenar tareas')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleReorderTasks = (orderedIds: string[], sortKey: string) => {
    if (!sortKey || orderedIds.length === 0) {
      return
    }
    const updates = orderedIds
      .map((taskId, index) => {
        const task = taskById.get(taskId)
        if (!task) {
          return null
        }
        const baseOrders =
          task.sort_orders && typeof task.sort_orders === 'object' ? (task.sort_orders as Record<string, number>) : {}
        return { id: taskId, sort_orders: { ...baseOrders, [sortKey]: index } }
      })
      .filter((item): item is { id: string; sort_orders: Record<string, number> } => !!item)

    if (updates.length === 0) {
      return
    }

    const updatesMap = new Map(updates.map(update => [update.id, update.sort_orders]))
    queryClient.setQueriesData({ queryKey: ['tasks'] }, (old: Task[] | undefined) => {
      if (!old) {
        return old
      }
      return old.map(task => {
        const nextOrders = updatesMap.get(task.id)
        if (!nextOrders) {
          return task
        }
        return { ...task, sort_orders: nextOrders }
      })
    })

    reorderTasksMutation.mutate(updates)
  }

  const addInlineLabelMutation = useMutation({
    mutationKey: ['mutations', 'labels', 'inline-add'],
    networkMode: 'online',
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
    mutationKey: ['mutations', 'task-labels', 'add'],
    networkMode: 'online',
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
    mutationKey: ['mutations', 'task-labels', 'remove'],
    networkMode: 'online',
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

  const clearQuickViewLabels = useCallback(
    (task: Task) => {
      const labelIds = (task.labels || [])
        .filter(label => {
          const view = getLabelQuickView(label.name)
          return view === 'waiting' || view === 'reference'
        })
        .map(label => label.id)
      labelIds.forEach(labelId => {
        removeTaskLabelMutation.mutate({ taskId: task.id, labelId })
      })
    },
    [removeTaskLabelMutation]
  )

  const canDropTask = useCallback((taskId: string) => taskById.has(taskId), [taskById])

  const handleDropTaskQuickView = useCallback(
    (taskId: string, view: QuickViewId) => {
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      if (view === 'waiting' || view === 'someday' || view === 'reference') {
        applyQuickViewMutation.mutate({
          task,
          view,
          sortOrders: buildSortOrdersForKey(task, `view:${view}`),
        })
        return
      }

      const updates: Partial<Task> = {
        sort_orders: buildSortOrdersForKey(task, `view:${view}`),
      }

      if (view === 'inbox') {
        updates.project_id = null
        updates.area_id = null
        updates.heading_id = null
        updates.due_at = null
        updates.status = 'open'
      } else if (view === 'today') {
        updates.due_at = todayISO
        updates.status = 'open'
      } else if (view === 'upcoming') {
        const normalizedCurrent = normalizeDate(task.due_at)
        updates.due_at = normalizedCurrent && normalizedCurrent > todayISO ? normalizedCurrent : tomorrowISO
        updates.status = 'open'
      } else if (view === 'anytime') {
        updates.due_at = null
        updates.status = 'open'
      } else if (view === 'logbook') {
        updates.status = 'done'
        updates.completed_at = new Date().toISOString()
      }

      dragUpdateTaskMutation.mutate({ taskId, updates })
      clearQuickViewLabels(task)
    },
    [
      applyQuickViewMutation,
      buildSortOrdersForKey,
      clearQuickViewLabels,
      dragUpdateTaskMutation,
      taskById,
      todayISO,
      tomorrowISO,
    ]
  )

  const handleDropTaskArea = useCallback(
    (taskId: string, areaId: string) => {
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      dragUpdateTaskMutation.mutate({
        taskId,
        updates: {
          area_id: areaId,
          project_id: null,
          heading_id: null,
          sort_orders: buildSortOrdersForKey(task, `area:${areaId}`),
        },
      })
    },
    [buildSortOrdersForKey, dragUpdateTaskMutation, taskById]
  )

  const handleDropTaskProject = useCallback(
    (taskId: string, projectId: string) => {
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      const destinationProject = projectMap.get(projectId)
      dragUpdateTaskMutation.mutate({
        taskId,
        updates: {
          project_id: projectId,
          area_id: destinationProject?.area_id ?? null,
          heading_id: null,
          sort_orders: buildSortOrdersForKey(task, `project:${projectId}`),
        },
      })
    },
    [buildSortOrdersForKey, dragUpdateTaskMutation, projectMap, taskById]
  )

  const handleProjectChipSelect = (chipId: 'all' | string) => {
    if (chipId === 'all') {
      setSelectedLabelIds([])
      setActiveProjectFilterChip('all')
      return
    }
    setSelectedLabelIds([chipId])
    setActiveProjectFilterChip(chipId)
  }

  const startMobileTaskDraft = (
    view: QuickViewId,
    overrides?: { areaId?: string | null; projectId?: string | null; stayHome?: boolean }
  ) => {
    const normalizedView = view === 'logbook' ? 'inbox' : view
    const targetProjectId = overrides?.projectId ?? selectedProjectId ?? null
    const appliedAreaId =
      overrides?.areaId ??
      selectedAreaId ??
      (targetProjectId ? projects.find(project => project.id === targetProjectId)?.area_id || null : null)
    if (!overrides?.stayHome) {
      setShowMobileHome(false)
    }
    updateMobileDraft(() => ({
      title: '',
      notes: '',
      view: normalizedView,
      areaId: appliedAreaId || null,
      projectId: targetProjectId || null,
      due_at: defaultDueForView(normalizedView, todayISO, tomorrowISO),
      deadline_at: null,
      labelIds: getDraftLabelIdsForView(normalizedView, []),
    }))
  }

  const handleMobileNewTask = () => {
    if (showMobileHome) {
      setShowMobileCreationSheet(true)
      return
    }
    startMobileTaskDraft(activeQuickView)
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
    const normalizedView = mobileDraftTask.view === 'logbook' ? 'inbox' : mobileDraftTask.view
    const basePayload = buildMobileTaskPayload({
      ...mobileDraftTask,
      view: normalizedView,
      labelIds: getDraftLabelIdsForView(normalizedView, mobileDraftTask.labelIds),
    })
    const sortKey = resolveListSortKey(normalizedView)
    const sortMode = resolveListSortMode(normalizedView)
    const sortOrders =
      sortKey && sortMode === 'default' ? { [sortKey]: getNextSortOrder(sortKey) } : undefined
    const targetProjectId = basePayload.project_id ?? selectedProjectId ?? null
    const targetAreaId =
      basePayload.area_id ??
      selectedAreaId ??
      (targetProjectId ? projects.find(project => project.id === targetProjectId)?.area_id || null : null)
    addTaskMutation.mutate(
      {
        ...basePayload,
        project_id: targetProjectId,
        area_id: targetAreaId,
        sort_orders: sortOrders,
      },
      {
        onSuccess: () => {
          updateMobileDraft(() => null)
          setShowMobileCreationSheet(false)
          setShowMobileHome(true)
        },
      }
    )
  }

  const handleCancelDesktopDraft = () => {
    setShowDesktopDraft(false)
    resetTaskDraft()
  }

  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault?.()
    if (!taskDraft.title.trim()) {
      setError('El título no puede estar vacío')
      return
    }
    const targetProjectId = taskDraft.projectId ?? selectedProjectId ?? null
    const targetAreaId =
      taskDraft.areaId ??
      selectedAreaId ??
      (targetProjectId ? projects.find(project => project.id === targetProjectId)?.area_id || null : null)
    const sortKey = resolveListSortKey(taskDraft.view)
    const sortMode = resolveListSortMode(taskDraft.view)
    const sortOrders =
      sortKey && sortMode === 'default' ? { [sortKey]: getNextSortOrder(sortKey) } : undefined
    addTaskMutation.mutate({
      title: taskDraft.title,
      notes: taskDraft.notes,
      due_at: taskDraft.due_at,
      deadline_at: taskDraft.deadline_at,
      status: taskDraft.status,
      project_id: targetProjectId,
      area_id: targetAreaId,
      heading_id: taskDraft.headingId,
      quick_view: taskDraft.view,
      labelIds: taskDraft.labelIds,
      sort_orders: sortOrders,
    }, {
      onSuccess: () => {
        resetTaskDraft()
        closeTaskModal()
        setShowDesktopDraft(false)
      },
    })
  }

  const handleEditTask = (task: Task) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
    const legacy = deserializeChecklistNotes(task.notes)
    const checklistSource =
      task.checklist_items && task.checklist_items.length > 0
        ? task.checklist_items.map((item, index) => ({
          id: item.id,
          text: item.text,
          completed: item.completed,
          sortOrder: item.sort_order ?? index,
          persisted: true,
        }))
        : legacy.items.map((item, index) => ({
          id: item.id || generateChecklistId(),
          text: item.text,
          completed: item.completed,
          sortOrder: index,
          persisted: false,
        }))
    setEditingNotes(legacy.text || task.notes || '')
    setEditingChecklist(checklistSource)
    setEditingDueAt(task.due_at ? task.due_at.split('T')[0] : '')
    setEditingDeadlineAt(task.deadline_at ? task.deadline_at.split('T')[0] : '')
    setEditingProjectId(task.project_id || null)
    setEditingAreaId(task.area_id || null)
    setEditingHeadingId(task.heading_id || null)
  }

  const handleSaveEdit = (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault()
    }
    if (editingId) {
      updateTaskMutation.mutate({
        taskId: editingId,
        title: editingTitle,
        notes: editingNotes,
        dueAt: editingDueAt,
        deadlineAt: editingDeadlineAt,
        projectId: editingProjectId,
        areaId: editingAreaId,
        headingId: editingHeadingId,
        checklist: editingChecklist,
      })
      return true
    }
    return false
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
    setEditingNotes('')
    setEditingDueAt('')
    setEditingDeadlineAt('')
    setEditingProjectId(null)
    setEditingAreaId(null)
    setEditingHeadingId(null)
    setMoveSheetTaskId(null)
    setEditingChecklist([])
    setChecklistSheetOpen(false)
    setOverflowTaskId(null)
  }

  const handleSelectProject = (projectId: string) => {
    clearSearchState()
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

  const handleReorderProjects = useCallback(
    ({
      sourceAreaId,
      targetAreaId,
      orderedProjectIds,
      movedProjectId,
    }: {
      sourceAreaId: string | null
      targetAreaId: string | null
      orderedProjectIds: string[]
      movedProjectId: string
    }) => {
      const normalizedSource = sourceAreaId ?? null
      const normalizedTarget = targetAreaId ?? null
      const sourceGroupIds = projects
        .filter(project => (project.area_id ?? null) === normalizedSource)
        .map(project => project.id)
      const targetGroupIds = projects
        .filter(project => (project.area_id ?? null) === normalizedTarget)
        .map(project => project.id)
      if (!sourceGroupIds.includes(movedProjectId)) {
        return
      }
      const movingAcross = normalizedSource !== normalizedTarget
      if (!orderedProjectIds.length) {
        return
      }
      let nextTargetIds = orderedProjectIds
      if (movingAcross && !nextTargetIds.includes(movedProjectId)) {
        nextTargetIds = [...targetGroupIds, movedProjectId]
      }
      const expectedTargetIds = new Set(
        movingAcross ? [...targetGroupIds, movedProjectId] : targetGroupIds
      )
      if (
        nextTargetIds.length !== expectedTargetIds.size ||
        !nextTargetIds.every(id => expectedTargetIds.has(id))
      ) {
        return
      }
      if (
        !movingAcross &&
        nextTargetIds.length === sourceGroupIds.length &&
        nextTargetIds.every((id, index) => id === sourceGroupIds[index])
      ) {
        return
      }
      const nextSourceIds = movingAcross
        ? sourceGroupIds.filter(id => id !== movedProjectId)
        : sourceGroupIds
      const updates: { id: string; sort_order: number; area_id?: string | null }[] = []
      nextTargetIds.forEach((id, index) => {
        const update: { id: string; sort_order: number; area_id?: string | null } = {
          id,
          sort_order: index,
        }
        if (movingAcross && id === movedProjectId) {
          update.area_id = normalizedTarget
        }
        updates.push(update)
      })
      if (movingAcross) {
        nextSourceIds.forEach((id, index) => {
          updates.push({ id, sort_order: index })
        })
      }
      queryClient.setQueryData<Project[]>(['projects'], (prev) => {
        if (!prev) {
          return prev
        }
        const updatesById = new Map(updates.map(update => [update.id, update]))
        const next = prev.map(project => {
          const update = updatesById.get(project.id)
          if (!update) {
            return project
          }
          return {
            ...project,
            sort_order: update.sort_order,
            area_id: update.area_id !== undefined ? update.area_id : project.area_id,
          }
        })
        return [...next].sort((a, b) => {
          const orderDelta = (a.sort_order ?? 0) - (b.sort_order ?? 0)
          if (orderDelta !== 0) {
            return orderDelta
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      })
      reorderProjectsMutation.mutate(updates)
    },
    [projects, queryClient, reorderProjectsMutation]
  )

  const handleReorderHeadings = useCallback(
    ({
      projectId,
      orderedHeadingIds,
      movedHeadingId,
    }: {
      projectId: string
      orderedHeadingIds: string[]
      movedHeadingId: string
    }) => {
      const headingsForProject = projectHeadings.filter(heading => heading.project_id === projectId)
      const currentIds = headingsForProject.map(heading => heading.id)
      if (!currentIds.includes(movedHeadingId)) {
        return
      }
      if (orderedHeadingIds.length !== currentIds.length) {
        return
      }
      if (!orderedHeadingIds.every(id => currentIds.includes(id))) {
        return
      }
      if (orderedHeadingIds.every((id, index) => id === currentIds[index])) {
        return
      }

      const updates = orderedHeadingIds.map((id, index) => ({ id, sort_order: index }))
      const updatesById = new Map(updates.map(update => [update.id, update.sort_order]))
      queryClient.setQueryData<ProjectHeading[]>(['project-headings'], (prev) => {
        if (!prev) {
          return prev
        }
        const next = prev.map(heading => {
          const sortOrder = updatesById.get(heading.id)
          if (sortOrder === undefined) {
            return heading
          }
          return { ...heading, sort_order: sortOrder }
        })
        return [...next].sort((a, b) => {
          const orderDelta = (a.sort_order ?? 0) - (b.sort_order ?? 0)
          if (orderDelta !== 0) {
            return orderDelta
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        })
      })
      reorderHeadingsMutation.mutate(updates)
    },
    [projectHeadings, queryClient, reorderHeadingsMutation]
  )

  const handleSelectArea = (areaId: string) => {
    clearSearchState()
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

  const handleMoveTaskToHeading = useCallback(
    ({ taskId, headingId }: { taskId: string; headingId: string | null }) => {
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      const currentHeading = task.heading_id || null
      if (currentHeading === headingId) {
        return
      }
      const headingName = headingId ? headingMap.get(headingId)?.name : null
      dragUpdateTaskMutation.mutate({
        taskId,
        updates: { heading_id: headingId },
        successMessage: headingName ? `Tarea movida a ${headingName}` : 'Tarea sin sección',
      })
    },
    [dragUpdateTaskMutation, headingMap, taskById]
  )

  const handleMoveTaskToProject = useCallback(
    ({ taskId, projectId, areaId }: { taskId: string; projectId: string | null; areaId: string | null }) => {
      const task = taskById.get(taskId)
      if (!task) {
        return
      }
      const nextProjectId = projectId ?? null
      const nextAreaId = areaId ?? null
      if ((task.project_id || null) === nextProjectId && (task.area_id || null) === nextAreaId) {
        return
      }
      const destinationProject = nextProjectId ? projectMap.get(nextProjectId) ?? null : null
      const destinationArea = nextAreaId ? areas.find(area => area.id === nextAreaId) ?? null : null
      const sortKey = nextProjectId
        ? `project:${nextProjectId}`
        : nextAreaId
          ? `area:${nextAreaId}`
          : 'view:inbox'
      dragUpdateTaskMutation.mutate({
        taskId,
        updates: {
          project_id: nextProjectId,
          area_id: nextAreaId,
          heading_id: null,
          sort_orders: buildSortOrdersForKey(task, sortKey),
        },
        successMessage: destinationProject
          ? `Tarea movida a ${destinationProject.name}`
          : destinationArea
            ? `Tarea movida a ${destinationArea.name}`
            : 'Tarea movida',
      })
    },
    [areas, buildSortOrdersForKey, dragUpdateTaskMutation, projectMap, taskById]
  )

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId, type } = result
      if (!destination) return

      if (source.droppableId === destination.droppableId && source.index === destination.index) {
        return
      }

      if (type === 'HEADING') {
        const projectId = parseHeadingDropId(destination.droppableId)
        if (!projectId) return
        const headingsForProject = projectHeadings.filter(h => h.project_id === projectId)
        const currentIds = headingsForProject.map(h => h.id)
        const nextIds = Array.from(currentIds)
        const [removed] = nextIds.splice(source.index, 1)
        nextIds.splice(destination.index, 0, removed)
        handleReorderHeadings({
          projectId,
          orderedHeadingIds: nextIds,
          movedHeadingId: draggableId,
        })
        return
      }

      const sourceContext = parseTaskListId(source.droppableId)
      const targetContext = parseTaskListId(destination.droppableId)

      if (!sourceContext || !targetContext) return

      const taskId = draggableId
      const task = taskById.get(taskId)
      if (!task) return

      if (source.droppableId === destination.droppableId) {
        // Reordering within the same list
        const items = Array.from(tasks.map(t => t.id))
        const [removed] = items.splice(source.index, 1)
        items.splice(destination.index, 0, removed)

        handleReorderTasks(items, source.droppableId)
        return
      }

      // Moving across lists
      if (targetContext.kind === 'project-heading') {
        handleMoveTaskToHeading({ taskId, headingId: targetContext.headingId })
        if (targetContext.projectId !== (task.project_id || null)) {
          handleMoveTaskToProject({
            taskId,
            projectId: targetContext.projectId,
            areaId: projectMap.get(targetContext.projectId)?.area_id ?? null,
          })
        }
      } else if (targetContext.kind === 'area-project') {
        handleMoveTaskToProject({
          taskId,
          projectId: targetContext.projectId,
          areaId: targetContext.areaId,
        })
      } else if (targetContext.kind === 'quick-view') {
        handleDropTaskQuickView(taskId, targetContext.view)
      }
    },
    [
      handleDropTaskQuickView,
      handleMoveTaskToHeading,
      handleMoveTaskToProject,
      handleReorderHeadings,
      projectHeadings,
      projectMap,
      taskById,
    ]
  )

  const renderDesktopTaskBoard = () => {
    const hasDraft = showDesktopDraft
    const isQuickViewContext = !selectedProject && !selectedArea
    if (isQuickViewContext && isLoading && filteredTasks.length === 0 && !hasDraft) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-[var(--color-text-muted)]">{t('tasks.loading')}</div>
        </div>
      )
    }
    if (isQuickViewContext && filteredTasks.length === 0 && !hasDraft) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-[var(--color-text-muted)] space-y-4">
            <p>{filteredViewActive ? t('tasks.empty.filtered') : t('tasks.empty')}</p>
            <button
              type="button"
              onClick={handleOpenTaskModal}
              className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
            >
              {t('tasks.empty.cta')}
            </button>
          </div>
        </div>
      )
    }
    if (isQuickViewContext) {
      return renderTaskBody('desktop', filteredTasks, false, {
        renderDraftCard: hasDraft ? renderDesktopDraftTaskCard : undefined,
        showDraftCard: hasDraft,
        onCreateTask: handleOpenTaskModal,
      })
    }
    return (
      <DesktopTaskBoardSwitcher
        selectedProject={selectedProject}
        selectedArea={selectedArea}
        projects={projects}
        areas={areas}
        projectHeadings={projectHeadings}
        filteredTasks={filteredTasks}
        visibleProjectTasks={visibleProjectTasks}
        completedCount={completedCount}
        showCompletedTasks={showCompletedInContext}
        quickViewGroups={quickViewGroups}
        headingEditingId={headingEditingId}
        headingEditingName={headingEditingName}
        onStartEditHeading={handleStartEditHeading}
        onChangeHeadingName={(value) => setHeadingEditingName(value)}
        onSaveHeadingName={handleSaveHeadingEdit}
        onCancelHeadingEdit={handleCancelHeadingEdit}
        onDeleteHeading={handleDeleteHeading}
        onReorderHeadings={handleReorderHeadings}
        onMoveTaskToHeading={handleMoveTaskToHeading}
        onMoveTaskToProject={handleMoveTaskToProject}
        onSelectArea={handleSelectArea}
        onSelectProject={handleSelectProject}
        renderTaskList={(
          tasks,
          options: { showEmptyState?: boolean; showLoadingState?: boolean; dragEnabled?: boolean } = {}
        ) =>
          renderTaskBody('desktop', tasks, options.showEmptyState ?? !hasDraft, {
            showLoadingState: options.showLoadingState,
            renderDraftCard: hasDraft ? renderDesktopDraftTaskCard : undefined,
            showDraftCard: hasDraft,
            dragEnabled: options.dragEnabled,
            onCreateTask: handleOpenTaskModal,
          })
        }
      />
    )
  }

  const handleShowMoreMobileTasks = () => {
    setMobileTaskLimit(prev => Math.min(prev + 5, filteredTasks.length))
  }

  const handleMobileBack = () => {
    if (isQuickFindActive) {
      handleClearSearch()
      return
    }
    if (mobileProjectFocusId) {
      setMobileProjectFocusId(null)
      setSelectedProjectId(null)
    }
    setSelectedAreaId(null)
    setShowMobileHome(true)
    setIsSearchFocused(false)
  }

  const handleMobileNavHome = () => {
    handleMobileBack()
    setSearchQuery('')
  }

  const handleOpenMobileSearch = () => {
    handleSearchFocus()
    setTimeout(() => {
      if (showMobileHome) {
        mobileHomeSearchInputRef.current?.focus()
        return
      }
      mobileSearchInputRef.current?.focus()
    }, 120)
  }

  const startDesktopDraft = () => {
    const defaultView = activeQuickView === 'logbook' ? 'inbox' : activeQuickView
    const targetProjectId = selectedProjectId || null
    const targetAreaId =
      targetProjectId ? projects.find(project => project.id === targetProjectId)?.area_id || null : selectedAreaId || null
    const defaultDue = defaultDueForView(defaultView, todayISO, tomorrowISO) || ''
    updateTaskDraft('title', '')
    updateTaskDraft('notes', '')
    updateTaskDraft('projectId', targetProjectId)
    updateTaskDraft('areaId', targetAreaId)
    updateTaskDraft('headingId', null)
    updateTaskDraft('view', defaultView)
    updateTaskDraft('status', defaultView === 'someday' ? 'snoozed' : 'open')
    updateTaskDraft('due_at', defaultDue)
    updateTaskDraft('deadline_at', '')
    setTaskLabels(getDraftLabelIdsForView(defaultView, []))
    setInlineLabelName('')
    setShowDesktopDraft(true)
  }

  const handleOpenTaskModal = () => {
    if (useMobileExperience) {
      openTaskModal()
      return
    }
    startDesktopDraft()
  }

  const handleCloseTaskModal = () => {
    closeTaskModal()
    resetTaskDraft()
  }

  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev)
  }

  const renderMultiSelectBar = () => {
    if (!isMultiSelectMode) {
      return null
    }
    return (
      <MultiSelectActionBar
        variant={useMobileExperience ? 'mobile' : 'desktop'}
        count={selectedTaskIds.length}
        onCancel={exitMultiSelect}
        onMove={() => setMultiSelectMoveOpen(true)}
        onComplete={handleBatchComplete}
        onDelete={handleRequestBulkDelete}
        onCopy={handleCopySelectedTasks}
        onShare={handleShareSelectedTasks}
        onPaste={handlePasteTasks}
        isProcessing={batchActionPending}
      />
    )
  }


  if (useMobileExperience && showMobileHome) {
    return (
      <main className="app-shell pb-28">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="glass-panel p-4 sm:p-6">
            <MobileOverview
              showDraftCard={!!mobileDraftTask}
              renderDraftCard={renderMobileDraftTaskCard}
              searchQuery={searchQuery}
              searchInputRef={mobileHomeSearchInputRef}
              onSearchChange={setSearchQuery}
              onSearchFocus={handleMobileHomeSearchFocus}
              showSuggestions={showSuggestionPanel && showMobileHome}
              suggestions={suggestionResults}
              onSelectSuggestion={handleSuggestionSelect}
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
              onOpenSettings={handleOpenSettings}
              onOpenHelp={handleOpenHelp}
            />
          </div>
        </div>
        {!isMultiSelectMode && (
          <MobileBottomBar
            isHomeActive
            isSearchActive={isQuickFindActive}
            onHome={handleMobileNavHome}
            onSearch={handleOpenMobileSearch}
          />
        )}
        {renderMobileTaskEditSheet()}
        {renderTaskModal()}
        {renderMobileCreationSheet()}
        {renderScheduleSheet()}
        {renderMoveSheet()}
        {renderChecklistSheet()}
        {renderOverflowMenu()}
        {renderLabelSheet()}
        {renderDeleteConfirmation()}
        {renderBulkDeleteConfirmation()}
        <TaskDatePickerOverlay
          target={datePickerTarget}
          intent={datePickerIntent}
          month={datePickerMonth}
          todayISO={todayISO}
          tomorrowISO={tomorrowISO}
          draftDueDate={taskDraft.due_at}
          draftDeadlineDate={taskDraft.deadline_at}
          editingDueDate={editingDueAt}
          editingDeadlineDate={editingDeadlineAt}
          mobileDraftDueDate={mobileDraftTask?.due_at ?? null}
          mobileDraftDeadlineDate={mobileDraftTask?.deadline_at ?? null}
          formatDateLabel={formatDateForLabel}
          anchorEl={datePickerAnchor}
          isMobile={useMobileExperience}
          onClose={closeDatePicker}
          onMonthChange={handleDatePickerMonthChange}
          onSelectDate={applyPickedDate}
        />
        {renderMultiSelectBar()}
      </main>
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <main className="app-shell">
        {useMobileExperience ? (
          <>
            <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
              <div className="glass-panel p-4 sm:p-6">
                <MobileTasksPane
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onSearchFocus={handleSearchFocus}
                  onSearchBlur={handleSearchBlur}
                  onSearchClear={handleClearSearch}
                  searchInputRef={mobileSearchInputRef}
                  showSuggestions={showSuggestionPanel && !showMobileHome}
                  suggestions={suggestionResults}
                  projects={projects}
                  onSelectSuggestion={handleSuggestionSelect}
                  onBack={handleMobileBack}
                  onToggleSelect={toggleMultiSelectMode}
                  isSelecting={isMultiSelectMode}
                  isProjectView={isMobileProjectView}
                  isSearchView={false}
                  selectedArea={selectedArea}
                  mobileProject={mobileProject}
                  quickViewLabel={currentQuickView.label}
                  friendlyToday={friendlyToday}
                  filteredTaskCount={filteredTasks.length}
                  completedCount={completedCount}
                  projectsInArea={selectedAreaProjectCount}
                  filters={activeFilters}
                  compactFilters={isMobileDetail}
                  onRemoveFilter={handleRemoveFilter}
                  errorMessage={error}
                  successMessage={successMessage}
                  retryLabel={t('actions.retry')}
                  onRetry={handleRetryLoad}
                  renderTaskBoard={renderMobileTaskBoard}
                  renderDraftCard={renderMobileDraftTaskCard}
                  showDraft={showMobileHome && !!mobileDraftTask}
                  pendingSync={hasPendingSync}
                  isFocusMode={isFocusMode}
                  onToggleFocus={toggleFocusMode}
                />
              </div>
            </div>
            {!isMultiSelectMode && (
              <MobileBottomBar
                isHomeActive={showMobileHome}
                isSearchActive={isQuickFindActive}
                onHome={handleMobileNavHome}
                onSearch={handleOpenMobileSearch}
              />
            )}
            {useMobileExperience && !isMultiSelectMode && (
              <MobileFab
                isHomeView={showMobileHome}
                onTapHome={handleMobileNewTask}
                onTapDetail={() => startMobileTaskDraft(activeQuickView)}
                onDropInbox={() => startMobileTaskDraft('inbox')}
                currentLabel={showMobileHome ? undefined : currentQuickView.label}
                currentIcon={showMobileHome ? undefined : quickViewEmojis[activeQuickView]}
                onDropCurrent={() => startMobileTaskDraft(activeQuickView)}
              />
            )}
            {renderMobileTaskEditSheet()}
          </>
        ) : (
          <>
            <div className="max-w-6xl mx-auto px-4 py-10 md:px-8">
              <div className="glass-panel p-6 md:p-8 md:min-h-[calc(100vh-200px)] md:max-h-[calc(100vh-200px)] md:overflow-hidden">
                <div
                  className={`grid gap-8 ${isFocusMode
                    ? 'md:grid-cols-[minmax(0,1fr)]'
                    : 'md:grid-cols-[var(--panel-sidebar-width),minmax(0,1fr)]'
                    }`}
                >
                  {!isFocusMode && (
                    <div className="hidden md:block">
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
                        onOpenSettings={handleOpenSettings}
                        onOpenHelp={handleOpenHelp}
                        onReorderProjects={handleReorderProjects}
                        taskDrop={{
                          canDropTask,
                          onDropQuickView: handleDropTaskQuickView,
                          onDropArea: handleDropTaskArea,
                          onDropProject: handleDropTaskProject,
                        }}
                        search={{
                          searchQuery,
                          suggestions: suggestionResults,
                          projects,
                          showSuggestions: showSuggestionPanel,
                          inputRef: desktopSearchInputRef,
                          onQueryChange: setSearchQuery,
                          onFocus: handleSearchFocus,
                          onBlur: handleSearchBlur,
                          onClear: handleClearSearch,
                          onSelectSuggestion: handleSuggestionSelect,
                        }}
                      />
                    </div>
                  )}
                  <section className="flex flex-col gap-6 min-h-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleFocusMode}
                          aria-pressed={isFocusMode}
                          className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
                        >
                          {isFocusMode ? t('actions.showSidebar') : t('actions.focusMode')}
                        </button>
                        <button
                          type="button"
                          onClick={toggleMultiSelectMode}
                          aria-pressed={isMultiSelectMode}
                          className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-600)]"
                        >
                          {isMultiSelectMode ? t('multiSelect.done') : t('multiSelect.select')}
                        </button>
                      </div>
                      {assistantEnabled && (
                        <button
                          type="button"
                          onClick={() => setShowAssistantChat(true)}
                          className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--on-surface)] backdrop-blur hover:border-[var(--color-primary-600)]"
                        >
                          Chat IA (crear tareas)
                        </button>
                      )}
                    </div>
                    <DesktopContextHeader
                      label={contextLabel}
                      title={contextTitle}
                      description={contextDescription}
                      pendingCount={pendingCount}
                      overdueCount={overdueCount}
                      pendingLabel={translate(language, 'context.pending')}
                      overdueLabel={translate(language, 'context.overdue')}
                      chips={headerChipItems}
                      activeChip={activeProjectFilterChip}
                      onChipSelect={(chipId) => handleProjectChipSelect(chipId as 'all' | string)}
                    />
                    <ActiveFilterChips filters={activeFilters} compact={false} onRemove={handleRemoveFilter} />
                    <StatusBanner message={successMessage} />
                    <ErrorBanner message={error} actionLabel={t('actions.retry')} onAction={handleRetryLoad} />
                    {!isOnline && <ErrorBanner message={t('status.offline')} />}
                    {hasPendingSync && <ErrorBanner message={t('status.pendingSync')} />}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                      {renderDesktopTaskBoard()}
                    </div>
                  </section>
                </div>
              </div>
            </div>
            {!isMultiSelectMode && (
              <DesktopDock
                onCreateTask={handleOpenTaskModal}
                onAddHeading={() => setShowQuickHeadingForm(true)}
                onOpenDatePicker={(anchor) => openDatePicker('edit', 'when', anchor)}
                onMoveSelected={() => {
                  if (editingId) {
                    const task = tasks.find(t => t.id === editingId)
                    if (task) handleOpenMoveSheet(task)
                  }
                }}
                onOpenQuickFind={openDesktopQuickFind}
                disableHeading={!selectedProjectId}
                disableDate={!editingId}
                disableMove={!editingId}
              />
            )}
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
        {renderMoveSheet()}
        {renderChecklistSheet()}
        {renderOverflowMenu()}
        {renderLabelSheet()}
        {renderDeleteConfirmation()}
        {renderBulkDeleteConfirmation()}
        {assistantEnabled && (
          <AssistantChat
            open={showAssistantChat}
            onClose={() => setShowAssistantChat(false)}
          />
        )}
        <TaskDatePickerOverlay
          target={datePickerTarget}
          intent={datePickerIntent}
          month={datePickerMonth}
          todayISO={todayISO}
          tomorrowISO={tomorrowISO}
          draftDueDate={taskDraft.due_at}
          draftDeadlineDate={taskDraft.deadline_at}
          editingDueDate={editingDueAt}
          editingDeadlineDate={editingDeadlineAt}
          mobileDraftDueDate={mobileDraftTask?.due_at ?? null}
          mobileDraftDeadlineDate={mobileDraftTask?.deadline_at ?? null}
          formatDateLabel={formatDateForLabel}
          anchorEl={datePickerAnchor}
          isMobile={useMobileExperience}
          onClose={closeDatePicker}
          onMonthChange={handleDatePickerMonthChange}
          onSelectDate={applyPickedDate}
        />
        {renderMultiSelectBar()}
        <QuickFindOverlay
          open={isQuickFindOpen}
          onClose={() => setIsQuickFindOpen(false)}
          query={quickFindQuery}
          onQueryChange={setQuickFindQuery}
          results={quickFindResults}
          onSelect={handleQuickFindSelect}
        />
      </main>
    </DragDropContext>
  )
}
