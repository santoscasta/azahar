import { useState, useCallback } from 'react'

export interface ProjectDraft {
  name: string
  areaId: string | null
}

const defaultProjectDraft: ProjectDraft = {
  name: '',
  areaId: null,
}

export function useProjectCreation() {
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(defaultProjectDraft)
  const [showProjectModal, setShowProjectModal] = useState(false)

  const setProjectName = useCallback((name: string) => {
    setProjectDraft(prev => ({ ...prev, name }))
  }, [])

  const setProjectAreaId = useCallback((areaId: string | null) => {
    setProjectDraft(prev => ({ ...prev, areaId }))
  }, [])

  const resetProjectDraft = useCallback(() => {
    setProjectDraft(defaultProjectDraft)
  }, [])

  const openProjectModal = useCallback(() => setShowProjectModal(true), [])

  const closeProjectModal = useCallback(() => {
    setShowProjectModal(false)
    resetProjectDraft()
  }, [resetProjectDraft])

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
