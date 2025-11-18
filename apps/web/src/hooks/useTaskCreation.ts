import { useState, useCallback } from 'react'
import type { QuickViewId } from '../pages/tasksSelectors.js'

export interface TaskCreationDraft {
  title: string
  notes: string
  priority: 0 | 1 | 2 | 3
  due_at: string
  projectId: string | null
  areaId: string | null
  headingId: string | null
  status: 'open' | 'done' | 'snoozed'
  labelIds: string[]
  view: QuickViewId
}

export interface MobileTaskDraft {
  title: string
  notes: string
  view: QuickViewId
  areaId: string | null
  projectId: string | null
  due_at: string | null
  labelIds: string[]
}

const defaultDraft: TaskCreationDraft = {
  title: '',
  notes: '',
  priority: 0,
  due_at: '',
  projectId: null,
  areaId: null,
  headingId: null,
  status: 'open',
  labelIds: [],
  view: 'inbox',
}

type LabelInput = string[] | ((prev: string[]) => string[])

export function useTaskCreation(initialView: QuickViewId = 'inbox') {
  const [taskDraft, setTaskDraft] = useState<TaskCreationDraft>({ ...defaultDraft, view: initialView })
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [mobileDraftTask, setMobileDraftTask] = useState<MobileTaskDraft | null>(null)

  const updateTaskDraft = useCallback(<K extends keyof TaskCreationDraft>(key: K, value: TaskCreationDraft[K]) => {
    setTaskDraft(prev => ({ ...prev, [key]: value }))
  }, [])

  const setTaskLabels = useCallback((labels: LabelInput) => {
    setTaskDraft(prev => ({
      ...prev,
      labelIds: typeof labels === 'function' ? labels(prev.labelIds) : labels,
    }))
  }, [])

  const resetTaskDraft = useCallback(() => {
    setTaskDraft({ ...defaultDraft, view: initialView })
  }, [initialView])

  const openTaskModal = useCallback(() => setIsTaskModalOpen(true), [])
  const closeTaskModal = useCallback(() => setIsTaskModalOpen(false), [])

  const updateMobileDraft = useCallback((updater: (draft: MobileTaskDraft | null) => MobileTaskDraft | null) => {
    setMobileDraftTask(updater)
  }, [])

  return {
    taskDraft,
    updateTaskDraft,
    setTaskLabels,
    resetTaskDraft,
    isTaskModalOpen,
    openTaskModal,
    closeTaskModal,
    mobileDraftTask,
    updateMobileDraft,
  }
}
