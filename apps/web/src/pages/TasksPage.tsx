import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
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
import NewAreaModal from '../components/tasks/NewAreaModal.js'
import NewProjectModal from '../components/tasks/NewProjectModal.js'
import QuickHeadingForm from '../components/tasks/QuickHeadingForm.js'
import ActiveFilterChips from '../components/tasks/ActiveFilterChips.js'
import ErrorBanner from '../components/tasks/ErrorBanner.js'
import StatusBanner from '../components/tasks/StatusBanner.js'
import TaskCreationModal from '../components/tasks/TaskCreationModal.js'
import TaskDatePickerOverlay from '../components/tasks/TaskDatePickerOverlay.js'
import LabelSheet from '../components/tasks/LabelSheet.js'
import TaskList from '../components/tasks/TaskList.js'
import DesktopSearch from '../components/tasks/DesktopSearch.js'
import DesktopContextHeader from '../components/tasks/DesktopContextHeader.js'
import DesktopDock from '../components/tasks/DesktopDock.js'
import DesktopTaskBoardSwitcher from '../components/tasks/boards/DesktopTaskBoardSwitcher.js'
import MobileOverview from '../components/mobile/MobileOverview.js'
import MobileTaskBoard from '../components/mobile/MobileTaskBoard.js'
import { DesktopDraftCard } from '../components/tasks/DesktopDraftCard.js'
import MoveTaskSheet from '../components/tasks/MoveTaskSheet.js'
import ChecklistSheet from '../components/tasks/ChecklistSheet.js'
import PriorityMenu from '../components/tasks/PriorityMenu.js'
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
type Priority = 0 | 1 | 2 | 3
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
  const [datePickerMonth, setDatePickerMonth] = useState(() => new Date())
  const [activeProjectFilterChip, setActiveProjectFilterChip] = useState<'all' | 'important' | string>('all')
  const [showNewListMenu, setShowNewListMenu] = useState(false)
  const [showQuickHeadingForm, setShowQuickHeadingForm] = useState(false)
  const [showMobileCreationSheet, setShowMobileCreationSheet] = useState(false)
  const [mobileDraftProject, setMobileDraftProject] = useState<{ name: string; areaId: string | null } | null>(null)
  const [mobileDraftArea, setMobileDraftArea] = useState<{ name: string } | null>(null)
  const [labelSheetTarget, setLabelSheetTarget] = useState<LabelSheetTarget>(null)
  const [labelSheetSelection, setLabelSheetSelection] = useState<string[]>([])
  const [labelSheetInput, setLabelSheetInput] = useState('')
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
  const [moveSheetTaskId, setMoveSheetTaskId] = useState<string | null>(null)
  const [editingChecklist, setEditingChecklist] = useState<EditingChecklistItem[]>([])
  const [isChecklistSheetOpen, setChecklistSheetOpen] = useState(false)
  const [isPriorityMenuOpen, setPriorityMenuOpen] = useState(false)
  const [overflowTaskId, setOverflowTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [showCompletedInContext, setShowCompletedInContext] = useState(true)
  const [customViewNames, setCustomViewNames] = useState<Partial<Record<QuickViewId, string>>>({})
  const [showAssistantChat, setShowAssistantChat] = useState(false)
  const [showDesktopDraft, setShowDesktopDraft] = useState(false)
  const searchBlurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
  const queryClient = useQueryClient()
  const isOnline = useConnectivity()
  const pendingMutations = useIsMutating({
    predicate: (mutation) => mutation.state.status === 'pending',
  })
  const hasPendingSync = pendingMutations > 0 && !isOnline
  const normalizedSearch = searchQuery.trim()
  const sortedLabelIds = useMemo(() => [...selectedLabelIds].sort(), [selectedLabelIds])
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

  // Consulta para obtener tareas con búsqueda y filtros
  const { data: tasksData = [], isLoading } = useQuery({
    queryKey: ['tasks', normalizedSearch, sortedLabelIds],
    queryFn: async () => {
      const result = await searchTasks({
        query: normalizedSearch || null,
        labelIds: sortedLabelIds.length > 0 ? sortedLabelIds : null,
        projectId: null,
        areaId: null,
        quickView: null,
      })
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
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!assistantEnabled && showAssistantChat) {
      setShowAssistantChat(false)
    }
  }, [assistantEnabled, showAssistantChat])

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
      const titleMatch = (task.title ?? '').toLowerCase().includes(query)
      const notesMatch = task.notes ? task.notes.toLowerCase().includes(query) : false
      const projectName = task.project_id
        ? projects.find(project => project.id === task.project_id)?.name?.toLowerCase() ?? ''
        : ''
      const projectMatch = projectName ? projectName.includes(query) : false
      return titleMatch || notesMatch || projectMatch
    })
  }, [normalizedSearch, projects, tasks])
  const isSearchMode = isSearchFocused || normalizedSearch.length > 0
  const filteredTasks = useMemo(() => {
    if (isSearchMode) {
      return searchResults.filter(task => task.status !== 'done')
    }
    return filterTasksForContext(tasks, activeQuickView, todayISO, selectedProjectId, selectedAreaId, projectMap)
  }, [
    isSearchMode,
    searchResults,
    tasks,
    activeQuickView,
    todayISO,
    selectedProjectId,
    selectedAreaId,
    projectMap,
  ])
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

  const handleOpenTaskLabelSheet = (task: Task) => {
    setLabelSheetSelection(task.labels?.map(label => label.id) ?? [])
    setLabelSheetTarget({ kind: 'task', taskId: task.id })
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
        ;(targetTask.labels || []).forEach(label => {
          if (!nextLabelIds.has(label.id)) {
            removeTaskLabelMutation.mutate({ taskId: targetTask.id, labelId: label.id })
          }
        })
      }
    }
    closeLabelSheet()
  }

  const handleOpenChecklistSheet = (taskId: string) => {
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

  const handleOpenPriorityMenu = () => {
    if (!editingId) {
      return
    }
    setPriorityMenuOpen(true)
  }

  const handleSelectPriority = (value: Priority) => {
    setEditingPriority(value)
    setPriorityMenuOpen(false)
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
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareText).catch(() => null)
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

  const handleOpenMoveSheet = (task: Task) => {
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
      autoSaveOnBlur?: boolean
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
      onOpenEditDatePicker={() => openDatePicker('edit')}
      onOpenLabelSheet={handleOpenTaskLabelSheet}
      onOpenChecklist={(task) => handleOpenChecklistSheet(task.id)}
      onOpenPriorityMenu={handleOpenPriorityMenu}
      onOpenMoveSheet={handleOpenMoveSheet}
      onOpenOverflowMenu={(task) => handleOpenOverflowMenu(task.id)}
      onToggleCollapsedChecklist={handleToggleCollapsedChecklist}
      formatDateLabel={formatDateForLabel}
      renderDraftCard={options.renderDraftCard}
      showDraftCard={options.showDraftCard}
      autoSaveOnBlur={options.autoSaveOnBlur}
    />
  )

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
  const searchViewLabel = translate(language, 'view.search')
  const searchViewDescription = translate(language, 'view.desc.search')
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
  const shouldAutoSaveEdit =
    labelSheetTarget === null &&
    !scheduleSheetOpen &&
    moveSheetTaskId === null &&
    !isChecklistSheetOpen &&
    !isPriorityMenuOpen &&
    overflowTaskId === null &&
    datePickerTarget === null
  const shouldAutoSaveDraft = labelSheetTarget === null && datePickerTarget === null

  const handleSelectQuickView = (view: QuickViewId) => {
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
          className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl"
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
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteTaskMutation.isPending}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-[var(--color-danger-500)] text-[var(--on-primary)] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
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
    () => buildActiveFilters(selectedProjectId, projects, selectedLabelIds, labels, selectedAreaId, areas),
    [selectedProjectId, projects, selectedLabelIds, labels, selectedAreaId, areas]
  )
  const filteredViewActive = isSearchMode
    ? true
    : isFilteredView(
      activeQuickView,
      searchQuery,
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

  const isMobileDetail = useMobileExperience && !showMobileHome && !isSearchMode
  const mobileProject = mobileProjectFocusId ? projects.find(project => project.id === mobileProjectFocusId) ?? null : null
  const selectedAreaProjectCount = selectedArea ? projects.filter(project => project.area_id === selectedArea.id).length : 0
  const isMobileProjectView = isMobileDetail && !!mobileProject
  const visibleMobileTasks = isMobileDetail ? filteredTasks.slice(0, mobileTaskLimit) : filteredTasks
  const canShowMoreMobileTasks = isMobileDetail && mobileTaskLimit < filteredTasks.length
  const quickViewGroups = useMemo(() => {
    if (selectedProjectId || selectedAreaId || isSearchMode) {
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

  const contextLabel = selectedProject
    ? translate(language, 'context.label.project')
    : selectedArea
      ? translate(language, 'context.label.area')
      : isSearchMode
        ? searchViewLabel
        : translate(language, 'context.label.view')
  const contextTitle = selectedProject
    ? selectedProject.name
    : selectedArea
      ? selectedArea.name
      : isSearchMode
        ? searchViewLabel
        : currentQuickView.label
  const areaTaskSummary = selectedArea ? areaStats.get(selectedArea.id) : null
  const contextDescription = selectedProject
    ? selectedArea
      ? `${translate(language, 'context.label.area')}: ${selectedArea.name}`
      : ''
    : selectedArea
      ? `${selectedAreaProjectCount} ${translate(language, 'sidebar.projects').toLowerCase()} · ${areaTaskSummary?.total || 0} ${translate(language, 'sidebar.tasks')}`
      : isSearchMode
        ? searchViewDescription
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
        { id: 'important', label: translate(language, 'filters.important') },
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

  const handleMobileHomeSearchFocus = () => {
    setShowMobileHome(false)
    handleSearchFocus()
  }

  const handleSuggestionSelect = (task: Task) => {
    setSearchQuery(task.title ?? '')
    setActiveQuickView('inbox')
    setSelectedProjectId(task.project_id || null)
    setSelectedAreaId(task.area_id || null)
    setSelectedLabelIds([])
    setIsSearchFocused(false)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setIsSearchFocused(false)
    if (useMobileExperience) {
      setShowMobileHome(true)
    }
  }

  const formatDateForLabel = (value: string) => {
    if (!value) {
      return 'Sin fecha'
    }
    const date = parseISODate(value)
    if (!date || Number.isNaN(date.getTime())) {
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
      applyQuickViewLabels(nextView)
      updateTaskDraft('status', nextView === 'anytime' ? 'open' : nextView === 'someday' ? 'snoozed' : 'open')
    } else if (datePickerTarget === 'edit') {
      setEditingDueAt(normalized)
    } else if (datePickerTarget === 'draft') {
      updateMobileDraft(prev => {
        if (!prev) return prev
        const nextView = determineViewFromDate(normalized, todayISO, prev.view)
        return {
          ...prev,
          due_at: normalized || null,
          view: nextView,
          labelIds: getDraftLabelIdsForView(nextView, prev.labelIds),
        }
      })
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
    options: {
      showLoadingState?: boolean
      renderDraftCard?: () => ReactNode
      showDraftCard?: boolean
      autoSaveOnBlur?: boolean
    } = {}
  ) => {
    const tasks = taskSource ?? (variant === 'mobile' ? visibleMobileTasks : filteredTasks)
    const showLoadingState = options.showLoadingState ?? !taskSource
    return renderTaskList(variant, tasks, {
      showEmptyState,
      showLoadingState,
      renderDraftCard: options.renderDraftCard,
      showDraftCard: options.showDraftCard,
      autoSaveOnBlur: options.autoSaveOnBlur ?? shouldAutoSaveEdit,
    })
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

  const renderChecklistSheet = () => (
    <ChecklistSheet
      open={isChecklistSheetOpen}
      items={editingChecklist}
      onClose={() => setChecklistSheetOpen(false)}
      onToggle={handleChecklistToggle}
      onAdd={handleChecklistAdd}
      onUpdate={handleChecklistUpdate}
      onRemove={handleChecklistRemove}
    />
  )

  const renderPriorityMenu = () => (
    <PriorityMenu
      open={isPriorityMenuOpen}
      selected={editingPriority}
      onSelect={handleSelectPriority}
      onClose={() => setPriorityMenuOpen(false)}
    />
  )

  const renderOverflowMenu = () => (
    <TaskOverflowMenu
      open={overflowTaskId !== null}
      task={overflowTask}
      isDuplicating={duplicateTaskMutation.isPending}
      isPinning={togglePinMutation.isPending}
      onTogglePin={handleTogglePinnedTask}
      onDuplicate={handleDuplicateTask}
      onCopyLink={handleCopyTaskLink}
      onClose={handleCloseOverflowMenu}
    />
  )

  const renderMoveSheet = () => (
    <MoveTaskSheet
      open={!!moveSheetTaskId}
      task={moveSheetTask}
      areas={areas}
      projects={projects}
      isProcessing={moveTaskMutation.isPending}
      onClose={handleCloseMoveSheet}
      onSelect={handleConfirmMoveDestination}
    />
  )

  const renderDesktopDraftTaskCard = () =>
    showDesktopDraft ? (
      <DesktopDraftCard
        draft={taskDraft}
        viewLabel={quickViewLabels[taskDraft.view]}
        dueLabel={formatDateForLabel(taskDraft.due_at)}
        onSubmit={handleAddTask}
        onCancel={handleCancelDesktopDraft}
        onTitleChange={(value) => updateTaskDraft('title', value)}
        onNotesChange={(value) => updateTaskDraft('notes', value)}
        onRequestDueDate={() => openDatePicker('new')}
        onOpenLabels={() => {
          setLabelSheetSelection(taskDraft.labelIds)
          setLabelSheetTarget({ kind: 'draft-task' })
        }}
        onCyclePriority={handleCycleDesktopPriority}
        autoSaveEnabled={shouldAutoSaveDraft}
      />
    ) : null


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
          setLabelSheetTarget({ kind: 'draft-task' })
        }}
        onDatePress={() => openDatePicker('draft')}
        onCancel={handleCancelMobileDraftTask}
        onSave={handleSaveMobileDraftTask}
        saving={addTaskMutation.isPending}
      />
    ) : null
  )

  const renderMobileTaskBoard = () => (
    <MobileTaskBoard
      taskList={renderTaskBody('mobile', undefined, true, {
        showLoadingState: true,
        renderDraftCard: renderMobileDraftTaskCard,
        showDraftCard: !!mobileDraftTask,
      })}
      canShowMore={canShowMoreMobileTasks}
      onShowMore={handleShowMoreMobileTasks}
    />
  )

  // Mutación para agregar tarea
  const addTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'add'],
    networkMode: 'online',
    mutationFn: async (args: {
      title: string
      notes?: string
      priority?: number
      due_at?: string | null
      status?: 'open' | 'done' | 'snoozed'
      project_id?: string | null
      area_id?: string | null
      heading_id?: string | null
      quick_view?: QuickViewId
      labelIds?: string[]
      clientMutationId?: string
    }) => {
      const clientMutationId = args.clientMutationId || uuid()
      const result = await addTask(
        args.title,
        args.notes || undefined,
        args.priority ?? 0,
        args.due_at || undefined,
        args.status ?? 'open',
        args.project_id ?? null,
        args.area_id ?? null,
        args.heading_id ?? null,
        clientMutationId,
        args.quick_view
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
        task.priority ?? 0,
        task.due_at ?? undefined,
        task.status,
        task.project_id,
        task.area_id,
        task.heading_id
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

  // Mutación para actualizar tarea
  const updateTaskMutation = useMutation({
    mutationKey: ['mutations', 'tasks', 'update'],
    networkMode: 'online',
    mutationFn: async (payload: {
      taskId: string
      title: string
      notes: string
      priority: Priority
      dueAt: string
      projectId: string | null
      areaId: string | null
      headingId: string | null
      checklist: EditingChecklistItem[]
    }) => {
      const resolvedTitle = payload.title.trim() ? payload.title : 'Nueva tarea'
      const updated = await updateTask(payload.taskId, {
        title: resolvedTitle,
        notes: payload.notes,
        priority: payload.priority,
        due_at: payload.dueAt || null,
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
            priority: variables.priority,
            due_at: variables.dueAt || null,
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
              priority: variables.priority,
              due_at: variables.dueAt || null,
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
        setEditingPriority(0)
        setEditingDueAt('')
        setEditingChecklist([])
        setChecklistSheetOpen(false)
        setPriorityMenuOpen(false)
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
    mutationFn: ({ taskId, areaId, projectId }: { taskId: string; areaId: string | null; projectId: string | null }) =>
      updateTask(taskId, {
        area_id: areaId,
        project_id: projectId,
        heading_id: null,
      }),
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

  const handleCycleDesktopPriority = () => {
    updateTaskDraft('priority', ((taskDraft.priority + 1) % 4) as 0 | 1 | 2 | 3)
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
    addTaskMutation.mutate({
      title: taskDraft.title,
      notes: taskDraft.notes,
      priority: taskDraft.priority,
      due_at: taskDraft.due_at,
      status: taskDraft.status,
      project_id: targetProjectId,
      area_id: targetAreaId,
      heading_id: taskDraft.headingId,
      quick_view: taskDraft.view,
      labelIds: taskDraft.labelIds,
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
    setEditingTitle(task.title ?? '')
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
    setEditingPriority((task.priority || 0) as 0 | 1 | 2 | 3)
    setEditingDueAt(task.due_at ? task.due_at.split('T')[0] : '')
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
        priority: editingPriority,
        dueAt: editingDueAt,
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
    setEditingPriority(0)
    setEditingDueAt('')
    setEditingProjectId(null)
    setEditingAreaId(null)
    setEditingHeadingId(null)
    setMoveSheetTaskId(null)
    setEditingChecklist([])
    setChecklistSheetOpen(false)
    setPriorityMenuOpen(false)
    setOverflowTaskId(null)
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

  const renderDesktopTaskBoard = () => {
    const hasDraft = showDesktopDraft
    const isQuickViewContext = !selectedProject && !selectedArea
    if (isQuickViewContext && isLoading && filteredTasks.length === 0 && !hasDraft) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-[var(--color-text-muted)]">Cargando tareas...</div>
        </div>
      )
    }
    if (isQuickViewContext && filteredTasks.length === 0 && !hasDraft) {
      return (
        <div className="az-card overflow-hidden">
          <div className="p-10 text-center text-[var(--color-text-muted)]">
            {filteredViewActive ? t('tasks.empty.filtered') : t('tasks.empty')}
          </div>
        </div>
      )
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
        onSelectArea={handleSelectArea}
        onSelectProject={handleSelectProject}
        renderTaskList={(tasks, options: { showEmptyState?: boolean; showLoadingState?: boolean } = {}) =>
          renderTaskBody('desktop', tasks, options.showEmptyState ?? !hasDraft, {
            showLoadingState: options.showLoadingState,
            renderDraftCard: hasDraft ? renderDesktopDraftTaskCard : undefined,
            showDraftCard: hasDraft,
          })
        }
      />
    )
  }

  const handleShowMoreMobileTasks = () => {
    setMobileTaskLimit(prev => Math.min(prev + 5, filteredTasks.length))
  }

  const handleMobileBack = () => {
    if (isSearchMode) {
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
    setShowMobileHome(false)
    handleSearchFocus()
    setTimeout(() => {
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
    updateTaskDraft('priority', 0)
    updateTaskDraft('projectId', targetProjectId)
    updateTaskDraft('areaId', targetAreaId)
    updateTaskDraft('headingId', null)
    updateTaskDraft('view', defaultView)
    updateTaskDraft('status', defaultView === 'someday' ? 'snoozed' : 'open')
    updateTaskDraft('due_at', defaultDue)
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


  if (useMobileExperience && showMobileHome) {
    return (
      <main className="app-shell pb-28">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="glass-panel p-4 sm:p-6">
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
              onOpenSettings={handleOpenSettings}
              onOpenHelp={handleOpenHelp}
            />
          </div>
        </div>
        <MobileBottomBar
          isHomeActive
          isSearchActive={isSearchMode}
          onHome={handleMobileNavHome}
          onSearch={handleOpenMobileSearch}
          onNewTask={handleMobileNewTask}
        />
        {renderTaskModal()}
        {renderMobileCreationSheet()}
        {renderScheduleSheet()}
        {renderMoveSheet()}
        {renderChecklistSheet()}
        {renderPriorityMenu()}
        {renderOverflowMenu()}
        {renderLabelSheet()}
        {renderDeleteConfirmation()}
        <TaskDatePickerOverlay
          target={datePickerTarget}
          month={datePickerMonth}
          todayISO={todayISO}
          tomorrowISO={tomorrowISO}
          draftDueDate={taskDraft.due_at}
          editingDueDate={editingDueAt}
          mobileDraftDueDate={mobileDraftTask?.due_at ?? null}
          formatDateLabel={formatDateForLabel}
          onClose={closeDatePicker}
          onMonthChange={handleDatePickerMonthChange}
          onSelectDate={applyPickedDate}
        />
      </main>
    )
  }

  return (
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
                onBack={handleMobileBack}
                isProjectView={isMobileProjectView}
                isSearchView={isSearchMode}
                selectedArea={selectedArea}
                mobileProject={mobileProject}
                quickViewLabel={isSearchMode ? searchViewLabel : currentQuickView.label}
                friendlyToday={friendlyToday}
                filteredTaskCount={filteredTasks.length}
                completedCount={completedCount}
                projectsInArea={selectedAreaProjectCount}
                filters={activeFilters}
                compactFilters={isMobileDetail}
                onRemoveFilter={handleRemoveFilter}
                errorMessage={error}
                successMessage={successMessage}
                renderTaskBoard={renderMobileTaskBoard}
                renderDraftCard={renderMobileDraftTaskCard}
                showDraft={showMobileHome && !!mobileDraftTask}
                pendingSync={hasPendingSync}
              />
            </div>
          </div>
          <MobileBottomBar
            isHomeActive={showMobileHome}
            isSearchActive={isSearchMode}
            onHome={handleMobileNavHome}
            onSearch={handleOpenMobileSearch}
            onNewTask={handleMobileNewTask}
          />
        </>
      ) : (
        <>
          <div className="max-w-6xl mx-auto px-4 py-10 lg:px-8">
            <div className="glass-panel p-6 lg:p-8">
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
                    onOpenSettings={handleOpenSettings}
                    onOpenHelp={handleOpenHelp}
                    onReorderProjects={handleReorderProjects}
                  />
                </div>
                <section className="space-y-6">
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
                  {assistantEnabled && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAssistantChat(true)}
                        className="px-4 py-2 text-sm font-semibold rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--on-surface)] shadow-sm backdrop-blur hover:border-[var(--color-primary-600)]"
                      >
                        Chat IA (crear tareas)
                      </button>
                    </div>
                  )}
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
                    onChipSelect={(chipId) => handleProjectChipSelect(chipId as 'all' | 'important' | string)}
                  />
                  <ActiveFilterChips
                    filters={activeFilters}
                    compact={false}
                    onRemove={handleRemoveFilter}
                  />
                  <StatusBanner message={successMessage} />
                  <ErrorBanner message={error} />
                  {!isOnline && <ErrorBanner message={t('status.offline')} />}
                  {hasPendingSync && <ErrorBanner message={t('status.pendingSync')} />}
                  {renderDesktopTaskBoard()}
                </section>
              </div>
            </div>
          </div>
          <DesktopDock
            onCreateTask={handleOpenTaskModal}
            onAddHeading={() => setShowQuickHeadingForm(true)}
            onOpenDatePicker={() => openDatePicker('new')}
            disableHeading={!selectedProjectId}
          />
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
      {renderPriorityMenu()}
      {renderOverflowMenu()}
      {renderLabelSheet()}
      {renderDeleteConfirmation()}
      {assistantEnabled && (
        <AssistantChat
          open={showAssistantChat}
          onClose={() => setShowAssistantChat(false)}
        />
      )}
      <TaskDatePickerOverlay
        target={datePickerTarget}
        month={datePickerMonth}
        todayISO={todayISO}
        tomorrowISO={tomorrowISO}
        draftDueDate={taskDraft.due_at}
        editingDueDate={editingDueAt}
        mobileDraftDueDate={mobileDraftTask?.due_at ?? null}
        formatDateLabel={formatDateForLabel}
        onClose={closeDatePicker}
        onMonthChange={handleDatePickerMonthChange}
        onSelectDate={applyPickedDate}
      />
    </main>
  )
}
