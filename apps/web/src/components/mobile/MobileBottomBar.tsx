import homeIcon from '../../assets/icons/inbox.svg'
import searchIcon from '../../assets/icons/search.svg'
import settingsIcon from '../../assets/icons/settings.svg'

interface MobileBottomBarProps {
  isHomeActive: boolean
  isSearchActive: boolean
  pendingSync: boolean
  onHome: () => void
  onSearch: () => void
  onNewTask: () => void
  onOpenSettings: () => void
}

interface NavButtonProps {
  label: string
  icon: string
  active?: boolean
  badge?: string
  helperText?: string
  onClick: () => void
}

function NavButton({ label, icon, active, badge, helperText, onClick }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${
        active ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-text-muted)]'
      }`}
      aria-pressed={active}
    >
      <span className={`relative h-10 w-10 rounded-2xl border border-[var(--color-border)] flex items-center justify-center ${
        active ? 'bg-[var(--color-primary-100)] border-[var(--color-primary-200)]' : 'bg-[var(--color-surface)]'
      }`}>
        <img src={icon} alt="" className="h-5 w-5" />
        {badge ? (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#FF7A33]" aria-label={badge} />
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
  pendingSync,
  onHome,
  onSearch,
  onNewTask,
  onOpenSettings,
}: MobileBottomBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md px-6 py-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="mx-auto max-w-2xl flex items-center justify-between gap-3">
        <NavButton label="Inicio" icon={homeIcon} active={isHomeActive} onClick={onHome} />
        <NavButton label="Buscar" icon={searchIcon} active={isSearchActive} onClick={onSearch} />
        <button
          type="button"
          onClick={onNewTask}
          className="flex-1 max-w-[140px] flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary-600)] text-white py-3 text-sm font-semibold shadow-lg hover:bg-[var(--color-primary-700)]"
          aria-label="Crear nueva tarea"
        >
          <span className="text-lg leading-none">＋</span>
          <span>Nueva</span>
        </button>
        <NavButton
          label="Ajustes"
          icon={settingsIcon}
          active={false}
          badge={pendingSync ? 'Cambios pendientes por sincronizar' : undefined}
          helperText={pendingSync ? 'Sincronizando…' : undefined}
          onClick={onOpenSettings}
        />
      </div>
    </div>
  )
}
