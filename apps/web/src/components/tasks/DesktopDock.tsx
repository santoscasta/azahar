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
    <div className="hidden lg:flex fixed inset-x-0 bottom-6 justify-center pointer-events-none">
      <div className="az-dock px-6 py-3 flex items-center gap-4 pointer-events-auto">
        <button
          type="button"
          onClick={onCreateTask}
          className="h-12 w-12 rounded-full bg-[var(--color-primary-600)] text-white text-2xl shadow-xl flex items-center justify-center"
          aria-label="Crear tarea"
        >
          +
        </button>
        <button
          type="button"
          onClick={onAddHeading}
          disabled={disableHeading}
          className="h-12 w-12 rounded-full border border-slate-200 text-xl text-slate-600 hover:border-slate-300 disabled:opacity-40"
          aria-label="Nueva sección"
        >
          ≡
        </button>
        <button
          type="button"
          onClick={onOpenDatePicker}
          className="h-12 w-12 rounded-full border border-slate-200 text-lg text-slate-600 hover:border-slate-300"
          aria-label="Elegir fecha"
        >
          📅
        </button>
      </div>
    </div>
  )
}
