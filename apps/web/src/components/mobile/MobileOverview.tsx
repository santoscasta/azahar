import type { ReactNode } from 'react'
import type { Area, Project } from '../../lib/supabase.js'
import type { QuickViewId } from '../../pages/tasksSelectors.js'
import searchIcon from '../../assets/icons/search.svg'
import settingsIcon from '../../assets/icons/settings.svg'

interface DraftArea {
  name: string
}

interface DraftProject {
  name: string
  areaId: string | null
}

interface QuickListItem {
  id: QuickViewId
  label: string
  icon: string
}

interface MobileOverviewProps {
  showDraftCard: boolean
  renderDraftCard?: () => ReactNode
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchFocus: () => void
  quickLists: readonly QuickListItem[]
  quickViewStats: Record<QuickViewId, number>
  onSelectQuickView: (view: QuickViewId) => void
  areas: Area[]
  areaDraft: DraftArea | null
  areaInputRef?: (element: HTMLInputElement | null) => void
  onAreaDraftChange: (value: string) => void
  onAreaDraftBlur: (value: string) => void
  onCancelAreaDraft: () => void
  onSaveAreaDraft: () => void
  onSelectArea: (areaId: string) => void
  projects: Project[]
  projectDraft: DraftProject | null
  projectInputRef?: (element: HTMLInputElement | null) => void
  onProjectDraftChange: (value: string) => void
  onProjectDraftBlur: (value: string) => void
  onCancelProjectDraft: () => void
  onSaveProjectDraft: () => void
  onSelectProject: (projectId: string) => void
  onOpenCreationSheet: () => void
  onOpenSettings: () => void
}

export function MobileOverview({
  showDraftCard,
  renderDraftCard,
  searchQuery,
  onSearchChange,
  onSearchFocus,
  quickLists,
  quickViewStats,
  onSelectQuickView,
  areas,
  areaDraft,
  areaInputRef,
  onAreaDraftChange,
  onAreaDraftBlur,
  onCancelAreaDraft,
  onSaveAreaDraft,
  onSelectArea,
  projects,
  projectDraft,
  projectInputRef,
  onProjectDraftChange,
  onProjectDraftBlur,
  onCancelProjectDraft,
  onSaveProjectDraft,
  onSelectProject,
  onOpenCreationSheet,
  onOpenSettings,
}: MobileOverviewProps) {
  return (
    <div className="space-y-6 pb-28">
      {showDraftCard && renderDraftCard ? renderDraftCard() : null}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <img src={searchIcon} alt="" className="h-4 w-4" />
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-[var(--color-border)] bg-[var(--color-primary-100)] text-[var(--on-surface)] flex items-center justify-center shadow-sm hover:border-[var(--color-primary-600)] z-10"
          aria-label="Ajustes"
        >
          <img src={settingsIcon} alt="" className="h-4.5 w-4.5" />
        </button>
        <input
          type="text"
          value={searchQuery}
          onFocus={onSearchFocus}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Búsqueda rápida"
          className="w-full pl-10 pr-14 py-3 rounded-3xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[#C4BDB5] dark:placeholder-[#E5E7EF] focus:ring-2 focus:ring-[var(--color-primary-600)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface)]"
        />
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {quickLists.map(view => (
          <button
            key={`mobile-${view.id}`}
            onClick={() => onSelectQuickView(view.id)}
            className="w-full flex items-center justify-between px-4 py-4 text-left"
          >
            <span className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-[var(--color-primary-100)] flex items-center justify-center">
                <img src={view.icon} alt="" className="h-6 w-6" />
              </span>
              <span className="text-base font-medium text-[var(--on-surface)]">{view.label}</span>
            </span>
            <div className="flex items-center gap-2 text-[#736B63] dark:text-[#E5E7EF]">
              {quickViewStats[view.id] > 0 && <span className="text-sm text-[var(--on-surface)]">{quickViewStats[view.id]}</span>}
              <span className="text-[var(--on-surface)]">›</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-4 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#C4BDB5] dark:text-[#E5E7EF]">
          <span>Áreas</span>
        </div>
        {areaDraft && (
          <div className="rounded-2xl border border-[var(--color-border)] p-3 space-y-2">
            <input
              ref={areaInputRef}
              type="text"
              value={areaDraft.name}
              onChange={(event) => onAreaDraftChange(event.target.value)}
              onBlur={(event) => onAreaDraftBlur(event.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[#C4BDB5] dark:placeholder-[#E5E7EF] outline-none bg-[var(--color-surface)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelAreaDraft}
                className="px-3 py-1 rounded-full border border-[var(--color-border)] text-xs text-[var(--on-surface)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveAreaDraft}
                className="px-3 py-1 rounded-full bg-[var(--color-primary-600)] text-white text-xs"
              >
                OK
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {areas.slice(0, 4).map(area => (
            <button
              key={`mobile-area-${area.id}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl border border-transparent hover:border-[var(--color-border)]"
              onClick={() => onSelectArea(area.id)}
            >
              <span className="text-sm text-[var(--on-surface)]">{area.name}</span>
              <span className="text-[#736B63] dark:text-[#E5E7EF]">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-4 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[#C4BDB5] dark:text-[#E5E7EF]">
          <span>Proyectos</span>
        </div>
        {projectDraft && (
          <div className="rounded-2xl border border-[var(--color-border)] p-3 space-y-2">
            <input
              ref={projectInputRef}
              type="text"
              value={projectDraft.name}
              onChange={(event) => onProjectDraftChange(event.target.value)}
              onBlur={(event) => onProjectDraftBlur(event.target.value)}
              className="w-full px-3 py-2 rounded-2xl border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[#C4BDB5] dark:placeholder-[#E5E7EF] outline-none bg-[var(--color-surface)]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancelProjectDraft}
                className="px-3 py-1 rounded-full border border-[var(--color-border)] text-xs text-[var(--on-surface)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveProjectDraft}
                className="px-3 py-1 rounded-full bg-[var(--color-primary-600)] text-white text-xs"
              >
                OK
              </button>
            </div>
          </div>
        )}
        <div className="space-y-2">
          {projects.slice(0, 4).map(project => (
            <button
              key={`mobile-project-${project.id}`}
              className="w-full flex items-center justify-between px-3 py-2 rounded-2xl border border-transparent hover:border-[var(--color-border)]"
              onClick={() => onSelectProject(project.id)}
            >
              <span className="text-sm text-[var(--on-surface)]">{project.name}</span>
              <span className="text-[#736B63] dark:text-[#E5E7EF]">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-slate-400 px-2">
        <button className="text-sm flex items-center gap-2">
          ⚙ <span>Ajustes</span>
        </button>
        <button className="text-sm flex items-center gap-2">
          ❓<span>Ayuda</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenCreationSheet}
        className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-[var(--color-primary-600)] text-white text-3xl shadow-2xl flex items-center justify-center"
        aria-label="Abrir creación rápida"
      >
        +
      </button>
    </div>
  )
}

export default MobileOverview
