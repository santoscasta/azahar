
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskCreation } from './useTaskCreation.js'

describe('useTaskCreation Extended', () => {
    it('initializes with default values', () => {
        const { result } = renderHook(() => useTaskCreation())

        expect(result.current.taskDraft).toEqual({
            title: '',
            notes: '',
            status: 'open',
            due_at: '',
            deadline_at: '',
            view: 'inbox',
            projectId: null,
            areaId: null,
            headingId: null,
            labelIds: [],
        })
        expect(result.current.isTaskModalOpen).toBe(false)
        expect(result.current.mobileDraftTask).toBeNull()
    })

    it('updates mobile draft task', () => {
        const { result } = renderHook(() => useTaskCreation())

        act(() => {
            result.current.updateMobileDraft(() => ({
                title: 'Mobile Task',
                notes: 'Some notes',
                view: 'inbox',
                projectId: 'p1',
                areaId: null,
                due_at: '2023-01-01',
                deadline_at: null,
                labelIds: ['l1'],
            }))
        })

        expect(result.current.mobileDraftTask).toEqual({
            title: 'Mobile Task',
            notes: 'Some notes',
            view: 'inbox',
            projectId: 'p1',
            areaId: null,
            due_at: '2023-01-01',
            deadline_at: null,
            labelIds: ['l1'],
        })
    })

    it('resets task draft correctly', () => {
        const { result } = renderHook(() => useTaskCreation())

        act(() => {
            result.current.updateTaskDraft('title', 'Draft to reset')
            result.current.resetTaskDraft()
        })

        expect(result.current.taskDraft.title).toBe('')
    })
})
