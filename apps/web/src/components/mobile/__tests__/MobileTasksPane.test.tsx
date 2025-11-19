import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../tests/renderWithProviders'
import MobileTasksPane from '../MobileTasksPane'
import type { ActiveFilterDescriptor } from '../../../pages/tasksSelectors.js'

const filters: ActiveFilterDescriptor[] = [
  { key: 'label:1', label: 'Etiqueta', type: 'label', referenceId: '1' },
]

describe('MobileTasksPane', () => {
  it('renders search, header, filters, and task board content', () => {
    const onSearchChange = vi.fn()
    const onRemoveFilter = vi.fn()
    const renderTaskBoard = vi.fn(() => <div>Tablero móvil</div>)
    const renderDraftCard = vi.fn(() => <div>Draft card</div>)

    renderWithProviders(
      <MobileTasksPane
        searchQuery="hola"
        onSearchChange={onSearchChange}
        onSearchFocus={vi.fn()}
        onSearchBlur={vi.fn()}
        onSearchClear={vi.fn()}
        searchInputRef={{ current: null }}
        onBack={vi.fn()}
        isProjectView={false}
        selectedArea={null}
        mobileProject={null}
        quickViewLabel="Inbox"
        friendlyToday="lunes"
        filteredTaskCount={3}
        completedCount={1}
        projectsInArea={2}
        filters={filters}
        compactFilters={false}
        onRemoveFilter={onRemoveFilter}
        errorMessage="Error test"
        renderTaskBoard={renderTaskBoard}
        renderDraftCard={renderDraftCard}
        showDraft
      />
    )

    expect(screen.getByPlaceholderText('Buscar tareas...')).toBeDefined()
    expect(screen.getByText('Inbox')).toBeDefined()
    expect(screen.getByText('Etiqueta')).toBeDefined()
    expect(screen.getByText('Error test')).toBeDefined()
    expect(screen.getByText('Tablero móvil')).toBeDefined()
    expect(screen.getByText('Draft card')).toBeDefined()

    fireEvent.click(screen.getByText('✕'))
    expect(onRemoveFilter).toHaveBeenCalledWith(filters[0])
  })
})
