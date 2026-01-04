import { useTranslations } from '../../App.js'

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
  const { t } = useTranslations()
  if (!isOpen) {
    return null
  }
  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)] backdrop-blur-sm"
      data-testid="mobile-creation-sheet"
      onClick={() => onClose()}
    >
      <div
        className="absolute bottom-6 left-4 right-4 bg-[var(--color-surface)] text-[var(--on-surface)] rounded-[var(--radius-container)] p-6 space-y-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-[var(--radius-card)] hover:bg-[var(--color-surface-elevated)] transition"
          onClick={() => {
            onClose()
            onCreateTask()
          }}
        >
          <span className="text-base font-semibold">{t('mobile.creation.task.title')}</span>
          <span className="text-sm text-[var(--color-text-muted)]">{t('mobile.creation.task.desc')}</span>
        </button>
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-[var(--radius-card)] hover:bg-[var(--color-surface-elevated)] transition"
          onClick={() => {
            onClose(true)
            onCreateProject()
          }}
        >
          <span className="text-base font-semibold">{t('mobile.creation.project.title')}</span>
          <span className="text-sm text-[var(--color-text-muted)]">{t('mobile.creation.project.desc')}</span>
        </button>
        <button
          type="button"
          className="w-full text-left flex flex-col gap-1 p-3 rounded-[var(--radius-card)] hover:bg-[var(--color-surface-elevated)] transition"
          onClick={() => {
            onClose(true)
            onCreateArea()
          }}
        >
          <span className="text-base font-semibold">{t('mobile.creation.area.title')}</span>
          <span className="text-sm text-[var(--color-text-muted)]">{t('mobile.creation.area.desc')}</span>
        </button>
      </div>
    </div>
  )
}
