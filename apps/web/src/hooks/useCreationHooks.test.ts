import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskCreation } from './useTaskCreation.js'
import { useProjectCreation } from './useProjectCreation.js'
import { useAreaCreation } from './useAreaCreation.js'

describe('useTaskCreation', () => {
  it('updates draft fields and resets', () => {
    const { result } = renderHook(() => useTaskCreation())

    act(() => {
      result.current.updateTaskDraft('title', 'Revisar sprint')
      result.current.updateTaskDraft('view', 'today')
      result.current.setTaskLabels(['a'])
      result.current.openTaskModal()
    })

    expect(result.current.taskDraft.title).toBe('Revisar sprint')
    expect(result.current.taskDraft.view).toBe('today')
    expect(result.current.taskDraft.labelIds).toEqual(['a'])
    expect(result.current.isTaskModalOpen).toBe(true)

    act(() => {
      result.current.resetTaskDraft()
      result.current.closeTaskModal()
    })

    expect(result.current.taskDraft.title).toBe('')
    expect(result.current.taskDraft.view).toBe('inbox')
    expect(result.current.taskDraft.labelIds).toEqual([])
    expect(result.current.isTaskModalOpen).toBe(false)
  })
})

describe('useProjectCreation', () => {
  it('manages draft state and modal visibility', () => {
    const { result } = renderHook(() => useProjectCreation())

    act(() => {
      result.current.openProjectModal()
      result.current.setProjectName('Nuevo proyecto')
      result.current.setProjectAreaId('area-1')
    })

    expect(result.current.showProjectModal).toBe(true)
    expect(result.current.projectDraft).toEqual({ name: 'Nuevo proyecto', areaId: 'area-1' })

    act(() => {
      result.current.closeProjectModal()
    })

    expect(result.current.showProjectModal).toBe(false)
    expect(result.current.projectDraft).toEqual({ name: '', areaId: null })
  })
})

describe('useAreaCreation', () => {
  it('opens and closes the modal resetting input', () => {
    const { result } = renderHook(() => useAreaCreation())

    act(() => {
      result.current.openAreaModal()
      result.current.setAreaNameDraft('Hogar')
    })

    expect(result.current.showAreaModal).toBe(true)
    expect(result.current.areaNameDraft).toBe('Hogar')

    act(() => {
      result.current.closeAreaModal()
    })

    expect(result.current.showAreaModal).toBe(false)
    expect(result.current.areaNameDraft).toBe('')
  })
})
