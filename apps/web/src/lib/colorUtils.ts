import type { CSSProperties } from 'react'

const normalizeHex = (value: string) => {
  const hex = value.replace('#', '').trim()
  if (hex.length === 3) {
    return hex
      .split('')
      .map(char => char + char)
      .join('')
  }
  return hex
}

const parseHexColor = (value?: string | null) => {
  if (!value) return null
  const normalized = normalizeHex(value)
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return { r, g, b }
}

const toRgba = (rgb: { r: number; g: number; b: number }, alpha: number) =>
  `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`

export const getSoftLabelStyle = (color?: string | null): CSSProperties | undefined => {
  const rgb = parseHexColor(color)
  if (!rgb) return undefined
  return {
    '--az-pill-bg': toRgba(rgb, 0.12),
    '--az-pill-border': toRgba(rgb, 0.32),
    '--az-pill-text': 'var(--on-surface)',
  } as CSSProperties
}
