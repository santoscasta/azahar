import { describe, it, expect, vi } from 'vitest'
import { fireEvent, screen, within } from '@testing-library/react'
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
        isSearchView={false}
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
        successMessage="Listo"
        renderTaskBoard={renderTaskBoard}
        renderDraftCard={renderDraftCard}
        showDraft
        pendingSync={false}
      />
    )

    expect(screen.getByPlaceholderText('Búsqueda rápida')).toBeDefined()
    expect(screen.getByText('Inbox')).toBeDefined()
    expect(screen.getByText('Etiqueta')).toBeDefined()
    expect(screen.getByText('Error test')).toBeDefined()
    expect(screen.getByText('Tablero móvil')).toBeDefined()
    expect(screen.getByText('Draft card')).toBeDefined()

    const filterLabel = screen.getByText('Etiqueta')
    const filterChip = filterLabel.closest('span')
    if (!filterChip) throw new Error('Filter chip not found')
    // The button is a sibling of the text node "Etiqueta" inside the span, 
    // but getByText returns the element containing the text if it's a leaf, or the element itself.
    // In ActiveFilterChips: {filter.label} <button>...</button>
    // "Etiqueta" is a text node inside the span. 
    // getByText('Etiqueta') usually matches the span if it contains only that text + elements?
    // Actually, let's use within on the parent span.

    const closeButton = within(filterChip).getByText('✕')
    fireEvent.click(closeButton)
    expect(onRemoveFilter).toHaveBeenCalledWith(filters[0])
  })
})
