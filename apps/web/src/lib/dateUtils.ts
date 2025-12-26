const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export function formatISODate(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value: string): Date | null {
  if (!value) return null
  const directValue = ISO_DATE_REGEX.test(value) ? value : value.slice(0, 10)
  if (ISO_DATE_REGEX.test(directValue)) {
    const [year, month, day] = directValue.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export function normalizeISODate(value?: string | null): string | null {
  if (!value) return null
  if (ISO_DATE_REGEX.test(value)) {
    return value
  }
  const parsed = parseISODate(value)
  if (!parsed) return null
  return formatISODate(parsed)
}
