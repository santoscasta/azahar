import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import MobileTaskBoard from '../MobileTaskBoard'

afterEach(() => {
  cleanup()
})

describe('MobileTaskBoard', () => {
  it('renders the task list and the show more button when available', () => {
    const onShowMore = vi.fn()
    renderWithProviders(
      <MobileTaskBoard
        taskList={<div>Contenido tareas</div>}
        canShowMore
        onShowMore={onShowMore}
      />
    )

    expect(screen.getByText('Contenido tareas')).toBeDefined()
    fireEvent.click(screen.getByText('Mostrar más'))
    expect(onShowMore).toHaveBeenCalled()
  })

  it('hides the button when there are no more tasks', () => {
    renderWithProviders(
      <MobileTaskBoard
        taskList={<div>Lista</div>}
        canShowMore={false}
        onShowMore={vi.fn()}
      />
    )

    expect(screen.queryByText('Mostrar más')).toBeNull()
  })
})
