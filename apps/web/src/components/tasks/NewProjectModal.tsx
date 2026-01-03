import type { FormEvent } from 'react'
import type { Area } from '../../lib/supabase.js'
import { useTranslations } from '../../App.js'

interface NewProjectModalProps {
  open: boolean
  projectName: string
  selectedAreaId: string | null
  areas: Area[]
  isSaving: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onNameChange: (value: string) => void
  onAreaChange: (value: string | null) => void
}

export default function NewProjectModal({
  open,
  projectName,
  selectedAreaId,
  areas,
  isSaving,
  onClose,
  onSubmit,
  onNameChange,
  onAreaChange,
}: NewProjectModalProps) {
  if (!open) {
    return null
  }
  const { t } = useTranslations()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[var(--color-surface)] rounded-[var(--radius-container)] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">{t('project.new.title')}</p>
            <p className="text-[24px] font-bold text-[var(--on-surface)]">{t('project.new.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--on-surface)] text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={projectName}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={t('project.new.placeholder')}
            className="w-full px-4 py-3 rounded-[var(--radius-container)] border border-[var(--color-border)] text-[var(--on-surface)] placeholder-[var(--color-text-subtle)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
          />
          <select
            value={selectedAreaId || ''}
            onChange={(event) => onAreaChange(event.target.value || null)}
            className="w-full px-4 py-3 rounded-[var(--radius-container)] border border-[var(--color-border)] text-[var(--on-surface)] bg-[var(--color-surface-elevated)] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none"
          >
            <option value="">{t('project.new.area.none')}</option>
            {areas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {areas.length === 0 && (
            <p className="text-xs text-[var(--color-text-muted)]">{t('project.new.area.empty')}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)]"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] text-sm font-semibold disabled:opacity-60"
            >
              {isSaving ? t('project.new.saving') : t('project.new.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
