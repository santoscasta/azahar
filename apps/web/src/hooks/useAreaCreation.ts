import { useState, useCallback, useEffect } from 'react'
import { loadDraft, saveDraft, clearDraft } from './draftStorage.js'

export function useAreaCreation() {
  const [areaNameDraft, setAreaNameDraft] = useState(() => loadDraft<string>('azahar:draft:area') || '')
  const [showAreaModal, setShowAreaModal] = useState(false)

  const openAreaModal = useCallback(() => setShowAreaModal(true), [])

  const closeAreaModal = useCallback(() => {
    setShowAreaModal(false)
    setAreaNameDraft('')
    clearDraft('azahar:draft:area')
  }, [])

  useEffect(() => {
    if (areaNameDraft) {
      saveDraft('azahar:draft:area', areaNameDraft)
    } else {
      clearDraft('azahar:draft:area')
    }
  }, [areaNameDraft])

  return {
    areaNameDraft,
    setAreaNameDraft,
    showAreaModal,
    openAreaModal,
    closeAreaModal,
  }
}
