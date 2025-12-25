import CalendarIcon from '../icons/CalendarIcon.js'
import SectionIcon from '../icons/SectionIcon.js'

interface DesktopDockProps {
  onCreateTask: () => void
  onAddHeading: () => void
  onOpenDatePicker: () => void
  disableHeading?: boolean
}

export default function DesktopDock({
  onCreateTask,
  onAddHeading,
  onOpenDatePicker,
  disableHeading = false,
}: DesktopDockProps) {
  return (
    <div className="hidden md:flex fixed inset-x-0 bottom-6 justify-center pointer-events-none z-30">
      <div className="az-dock px-6 py-3 flex items-center gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={onCreateTask}
          className="h-12 w-12 rounded-full bg-[var(--color-primary-600)] text-white text-2xl shadow-xl flex items-center justify-center hover:bg-[var(--color-primary-700)] transition"
          aria-label="Crear tarea"
        >
          +
        </button>
        <button
          type="button"
          onClick={onAddHeading}
          disabled={disableHeading}
          className="h-12 w-12 rounded-full border border-[var(--color-border)] text-xl text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] disabled:opacity-40 flex items-center justify-center"
          aria-label="Nueva sección"
        >
          <SectionIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onOpenDatePicker}
          className="h-12 w-12 rounded-full border border-[var(--color-border)] text-lg text-[var(--color-text-muted)] hover:bg-[var(--color-primary-100)] flex items-center justify-center"
          aria-label="Elegir fecha"
        >
          <CalendarIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
