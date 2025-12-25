import type { ReactNode } from 'react'
import HomeIcon from '../icons/HomeIcon.js'
import SearchIcon from '../icons/SearchIcon.js'

interface MobileBottomBarProps {
  isHomeActive: boolean
  isSearchActive: boolean
  onHome: () => void
  onSearch: () => void
  onNewTask: () => void
}

interface NavButtonProps {
  label: string
  icon: ReactNode
  active?: boolean
  badge?: string
  helperText?: string
  disabled?: boolean
  onClick: () => void
}

function NavButton({ label, icon, active, badge, helperText, disabled, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold transition ${
        active ? 'text-[var(--color-accent-500)]' : 'text-[var(--color-text-muted)]'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:translate-y-[1px]'}`}
      aria-pressed={active}
    >
      <span
        className={`relative h-10 w-10 rounded-2xl border border-[var(--color-border)] flex items-center justify-center transition ${
          active
            ? 'bg-[var(--color-accent-50)] border-[var(--color-accent-200)]'
            : 'bg-[var(--color-surface)]'
        } ${disabled ? '' : 'active:scale-95'}`}
      >
        {icon}
        {badge ? (
          <span
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[var(--color-done-500)]"
            aria-label={badge}
          />
        ) : null}
      </span>
      <span>{label}</span>
      {helperText ? <span className="text-[11px] text-[var(--color-text-muted)] leading-none">{helperText}</span> : null}
    </button>
  )
}

export default function MobileBottomBar({
  isHomeActive,
  isSearchActive,
  onHome,
  onSearch,
  onNewTask,
}: MobileBottomBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-6 py-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
        <NavButton label="Inicio" icon={<HomeIcon />} active={isHomeActive} onClick={onHome} />
        <NavButton label="Buscar" icon={<SearchIcon />} active={isSearchActive} onClick={onSearch} />
        <button
          type="button"
          onClick={onNewTask}
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary-600)] text-white py-3 text-sm font-semibold shadow-lg transition hover:bg-[var(--color-primary-700)] active:scale-[0.98]"
          aria-label="Crear nueva tarea"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Nueva</span>
        </button>
      </div>
    </div>
  )
}
