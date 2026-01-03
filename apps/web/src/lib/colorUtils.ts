import type { CSSProperties } from 'react'

export const getSoftLabelStyle = (_color?: string | null): CSSProperties | undefined => ({
  '--az-pill-bg': 'var(--color-surface-elevated)',
  '--az-pill-border': 'var(--color-border)',
  '--az-pill-text': 'var(--color-text-muted)',
} as CSSProperties)
