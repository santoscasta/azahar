import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import DatePickerOverlay from '../DatePickerOverlay'

const baseProps = {
  open: true,
  mode: 'new' as const,
  month: new Date('2024-01-01T00:00:00.000Z'),
  todayISO: '2024-01-01',
  tomorrowISO: '2024-01-02',
  selectedDate: '2024-01-01',
  selectedDateLabel: 'formatted:2024-01-01',
  formatDateLabel: (value: string) => `formatted:${value}`,
  onClose: vi.fn(),
  onMonthChange: vi.fn(),
  onSelectDate: vi.fn(),
}

describe('DatePickerOverlay', () => {
  it('updates the pending selection without applying immediately', () => {
    const onSelectDate = vi.fn()
    render(<DatePickerOverlay {...baseProps} onSelectDate={onSelectDate} />)

    const tomorrowButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Mañana'))
    expect(tomorrowButton).toBeDefined()
    fireEvent.click(tomorrowButton!)
    expect(screen.getByText('Seleccionada: formatted:2024-01-02')).toBeDefined()
    expect(onSelectDate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Aplicar/i }))
    expect(onSelectDate).toHaveBeenCalledWith('2024-01-02')
  })

  it('restores the original date when canceling the changes', () => {
    const onClose = vi.fn()
    render(<DatePickerOverlay {...baseProps} onClose={onClose} />)

    const tomorrowButton = screen.getAllByRole('button').find(button => button.textContent?.includes('Mañana'))
    expect(tomorrowButton).toBeDefined()
    fireEvent.click(tomorrowButton!)
    expect(screen.getByText('Seleccionada: formatted:2024-01-02')).toBeDefined()

    const cancelButtons = screen.getAllByRole('button', { name: /Cancelar/i })
    fireEvent.click(cancelButtons[cancelButtons.length - 1]!)
    expect(onClose).toHaveBeenCalled()
    expect(screen.getByText('Seleccionada: formatted:2024-01-01')).toBeDefined()
  })
})
