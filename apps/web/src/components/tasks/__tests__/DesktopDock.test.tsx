import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import DesktopDock from '../DesktopDock'

describe('DesktopDock', () => {
  it('triggers callbacks', () => {
    const onCreate = vi.fn()
    const onHeading = vi.fn()
    const onDate = vi.fn()
    const onMove = vi.fn()
    const onQuickFind = vi.fn()
    render(
      <DesktopDock
        onCreateTask={onCreate}
        onAddHeading={onHeading}
        onOpenDatePicker={onDate}
        onMoveSelected={onMove}
        onOpenQuickFind={onQuickFind}
      />
    )

    fireEvent.click(screen.getByLabelText('Crear tarea'))
    expect(onCreate).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Nueva sección'))
    expect(onHeading).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Elegir cuando'))
    expect(onDate).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Mover tarea'))
    expect(onMove).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Abrir búsqueda rápida'))
    expect(onQuickFind).toHaveBeenCalled()
  })
})
