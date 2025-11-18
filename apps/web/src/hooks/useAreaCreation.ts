import { useState, useCallback } from 'react'

export function useAreaCreation() {
  const [areaNameDraft, setAreaNameDraft] = useState('')
  const [showAreaModal, setShowAreaModal] = useState(false)

  const openAreaModal = useCallback(() => setShowAreaModal(true), [])

  const closeAreaModal = useCallback(() => {
    setShowAreaModal(false)
    setAreaNameDraft('')
  }, [])

  return {
    areaNameDraft,
    setAreaNameDraft,
    showAreaModal,
    openAreaModal,
    closeAreaModal,
  }
}
