import CalendarIcon from '../icons/CalendarIcon.js'
import SearchIcon from '../icons/SearchIcon.js'
import SectionIcon from '../icons/SectionIcon.js'

interface DesktopDockProps {
  onCreateTask: () => void
  onAddHeading: () => void
  onOpenDatePicker: (anchor?: HTMLElement | null) => void
  onMoveSelected: () => void
  onOpenQuickFind: () => void
  disableHeading?: boolean
  disableDate?: boolean
  disableMove?: boolean
}

export default function DesktopDock({
  onCreateTask,
  onAddHeading,
  onOpenDatePicker,
  onMoveSelected,
  onOpenQuickFind,
  disableHeading = false,
  disableDate = false,
  disableMove = false,
}: DesktopDockProps) {
  return (
    <div className="hidden md:flex fixed inset-x-0 bottom-6 justify-center pointer-events-none z-30">
      <div className="az-dock px-6 py-3 flex items-center gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={onCreateTask}
          className="h-12 w-12 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-2xl  flex items-center justify-center hover:opacity-90 transition"
          aria-label="Crear tarea"
        >
          +
        </button>
        <button
          type="button"
          onClick={onAddHeading}
          disabled={disableHeading}
          className="h-12 w-12 rounded-[var(--radius-card)] border border-[var(--color-border)] text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] disabled:opacity-40 flex items-center justify-center"
          aria-label="Nueva sección"
        >
          <SectionIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(event) => onOpenDatePicker(event.currentTarget)}
          disabled={disableDate}
          className="h-12 w-12 rounded-[var(--radius-card)] border border-[var(--color-border)] text-lg text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] disabled:opacity-40 flex items-center justify-center"
          aria-label="Elegir cuando"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onMoveSelected}
          disabled={disableMove}
          className="h-12 w-12 rounded-[var(--radius-card)] border border-[var(--color-border)] text-lg text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] disabled:opacity-40 flex items-center justify-center"
          aria-label="Mover tarea"
        >
          &rarr;
        </button>
        <button
          type="button"
          onClick={onOpenQuickFind}
          className="h-12 w-12 rounded-[var(--radius-card)] border border-[var(--color-border)] text-lg text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] flex items-center justify-center"
          aria-label="Abrir búsqueda rápida"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
