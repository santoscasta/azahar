import { useState, useCallback, useEffect } from 'react'
import { loadDraft, saveDraft, clearDraft } from './draftStorage.js'

export interface ProjectDraft {
  name: string
  areaId: string | null
}

const defaultProjectDraft: ProjectDraft = {
  name: '',
  areaId: null,
}

export function useProjectCreation() {
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(() => {
    const persisted = loadDraft<ProjectDraft>('azahar:draft:project')
    return persisted ? { ...defaultProjectDraft, ...persisted } : defaultProjectDraft
  })
  const [showProjectModal, setShowProjectModal] = useState(false)

  const setProjectName = useCallback((name: string) => {
    setProjectDraft(prev => ({ ...prev, name }))
  }, [])

  const setProjectAreaId = useCallback((areaId: string | null) => {
    setProjectDraft(prev => ({ ...prev, areaId }))
  }, [])

  const resetProjectDraft = useCallback(() => {
    setProjectDraft(defaultProjectDraft)
    clearDraft('azahar:draft:project')
  }, [])

  const openProjectModal = useCallback(() => setShowProjectModal(true), [])

  const closeProjectModal = useCallback(() => {
    setShowProjectModal(false)
    resetProjectDraft()
  }, [resetProjectDraft])

  useEffect(() => {
    saveDraft('azahar:draft:project', projectDraft)
  }, [projectDraft])

  return {
    projectDraft,
    setProjectName,
    setProjectAreaId,
    showProjectModal,
    openProjectModal,
    closeProjectModal,
    resetProjectDraft,
  }
}
