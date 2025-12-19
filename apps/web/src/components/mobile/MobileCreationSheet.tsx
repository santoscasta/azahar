interface MobileCreationSheetProps {
  isOpen: boolean
  onClose: (preserveDrafts?: boolean) => void
  onCreateTask: () => void
  onCreateProject: () => void
  onCreateArea: () => void
}

export function MobileCreationSheet({
  isOpen,
  onClose,
  onCreateTask,
  onCreateProject,
  onCreateArea,
}: MobileCreationSheetProps) {
  if (!isOpen) {
    return null
  }
    return (
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
        data-testid="mobile-creation-sheet"
        onClick={() => onClose()}
      >
      <div
        className="absolute bottom-6 left-4 right-4 bg-slate-900 text-white rounded-[32px] p-5 space-y-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-2xl hover:bg-slate-800 transition"
          onClick={() => {
            onClose()
            onCreateTask()
          }}
        >
          <span className="text-base font-semibold">Nueva tarea</span>
          <span className="text-sm text-slate-300">Añade rápidamente una tarea a la Entrada.</span>
        </button>
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-2xl hover:bg-slate-800 transition"
          onClick={() => {
            onClose(true)
            onCreateProject()
          }}
        >
          <span className="text-base font-semibold">Nuevo proyecto</span>
          <span className="text-sm text-slate-300">Define un objetivo y avanza tarea tras tarea.</span>
        </button>
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-2xl hover:bg-slate-800 transition"
          onClick={() => {
            onClose(true)
            onCreateArea()
          }}
        >
          <span className="text-base font-semibold">Nueva área</span>
          <span className="text-sm text-slate-300">
            Agrupa proyectos y tareas por responsabilidades.
          </span>
        </button>
      </div>
    </div>
  )
}
