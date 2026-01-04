import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import TaskDatePickerOverlay from '../TaskDatePickerOverlay'

const overlaySpy = vi.fn()

vi.mock('../DatePickerOverlay.js', () => ({
  default: (props: unknown) => {
    overlaySpy(props)
    return null
  },
}))

describe('TaskDatePickerOverlay', () => {
  beforeEach(() => {
    overlaySpy.mockClear()
  })

  const baseProps = {
    month: new Date('2024-01-01T00:00:00.000Z'),
    todayISO: '2024-01-02',
    tomorrowISO: '2024-01-03',
    draftDueDate: '',
    draftDeadlineDate: '',
    editingDueDate: '',
    editingDeadlineDate: '',
    mobileDraftDueDate: null,
    mobileDraftDeadlineDate: null,
    intent: 'when' as const,
    formatDateLabel: (value: string) => `formatted:${value}`,
    onClose: vi.fn(),
    onMonthChange: vi.fn(),
    onSelectDate: vi.fn(),
  }

  it('passes draft due date when creating a new task', () => {
    render(
      <TaskDatePickerOverlay
        {...baseProps}
        target="new"
        draftDueDate="2024-02-10"
      />
    )
    const props = overlaySpy.mock.calls[0][0] as any
    expect(props.open).toBe(true)
    expect(props.mode).toBe('new')
    expect(props.selectedDate).toBe('2024-02-10')
    expect(props.selectedDateLabel).toBe('formatted:2024-02-10')
  })

  it('uses the mobile draft date when selecting for drafts', () => {
    render(
      <TaskDatePickerOverlay
        {...baseProps}
        target="draft"
        mobileDraftDueDate="2024-03-15"
      />
    )
    const props = overlaySpy.mock.calls[0][0] as any
    expect(props.mode).toBe('draft')
    expect(props.selectedDate).toBe('2024-03-15')
  })

  it('keeps the overlay hidden when there is no target', () => {
    const onSelectDate = vi.fn()
    render(
      <TaskDatePickerOverlay
        {...baseProps}
        target={null}
        onSelectDate={onSelectDate}
      />
    )
    const props = overlaySpy.mock.calls[0][0] as any
    expect(props.open).toBe(false)
    expect(props.selectedDate).toBe('')
    expect(props.selectedDateLabel).toBe('Sin fecha')
    props.onSelectDate('2024-04-01')
    expect(onSelectDate).toHaveBeenCalledWith('2024-04-01')
  })
})
