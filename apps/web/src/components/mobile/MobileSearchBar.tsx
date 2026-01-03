import type { RefObject } from 'react'
import { useTranslations } from '../../App.js'

interface MobileSearchBarProps {
  value: string
  inputRef: RefObject<HTMLInputElement>
  onFocus: () => void
  onBlur: () => void
  onChange: (value: string) => void
  onClear: () => void
  onClick?: () => void
}

export default function MobileSearchBar({
  value,
  inputRef,
  onFocus,
  onBlur,
  onChange,
  onClear,
  onClick,
}: MobileSearchBarProps) {
  const { t } = useTranslations()
  return (
    <div className="bg-[var(--color-surface)] rounded-[var(--radius-container)] border border-[var(--color-border)] px-4 py-3">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={onFocus}
          onClick={onClick}
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('mobile.search.placeholder')}
          className="w-full min-h-[48px] pl-10 pr-10 py-2.5 rounded-[var(--radius-container)] border border-[var(--color-border)] text-sm text-[var(--on-surface)] placeholder-[var(--color-text-muted)] focus:ring-1 focus:ring-[var(--color-primary-200)] focus:border-[var(--color-primary-600)] outline-none bg-[var(--color-surface)]"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 flex items-center justify-center text-[var(--color-text-subtle)] hover:text-[var(--color-primary-700)]"
            aria-label={t('search.clear')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
