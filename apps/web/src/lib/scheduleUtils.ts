import type { QuickViewId } from '../pages/tasksSelectors.js'

export function defaultDueForView(
  view: QuickViewId,
  todayISO: string,
  tomorrowISO: string
): string | null {
  if (view === 'today') {
    return todayISO
  }
  if (view === 'upcoming') {
    return tomorrowISO
  }
  return null
}

export function deriveStatusFromView(view: QuickViewId): 'open' | 'snoozed' {
  return view === 'someday' ? 'snoozed' : 'open'
}

export function determineViewFromDate(
  value: string | null,
  todayISO: string,
  fallback: QuickViewId = 'inbox'
): QuickViewId {
  if (!value) {
    return fallback === 'someday' ? 'someday' : 'anytime'
  }
  if (value <= todayISO) {
    return 'today'
  }
  return 'upcoming'
}
