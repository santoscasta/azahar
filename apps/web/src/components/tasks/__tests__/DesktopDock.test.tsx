import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import DesktopDock from '../DesktopDock'

describe('DesktopDock', () => {
  it('triggers callbacks', () => {
    const onCreate = vi.fn()
    const onHeading = vi.fn()
    const onDate = vi.fn()
    render(
      <DesktopDock
        onCreateTask={onCreate}
        onAddHeading={onHeading}
        onOpenDatePicker={onDate}
      />
    )

    fireEvent.click(screen.getByLabelText('Crear tarea'))
    expect(onCreate).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Nueva sección'))
    expect(onHeading).toHaveBeenCalled()

    fireEvent.click(screen.getByLabelText('Elegir fecha'))
    expect(onDate).toHaveBeenCalled()
  })
})
