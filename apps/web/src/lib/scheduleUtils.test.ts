import { describe, it, expect } from 'vitest'
import type { QuickViewId } from '../pages/tasksSelectors.js'
import { defaultDueForView, deriveStatusFromView, determineViewFromDate } from './scheduleUtils.js'

describe('scheduleUtils', () => {
  const today = '2025-01-10'
  const tomorrow = '2025-01-11'

  describe('defaultDueForView', () => {
    it('returns today for view today', () => {
      expect(defaultDueForView('today', today, tomorrow)).toBe(today)
    })

    it('returns tomorrow for view upcoming', () => {
      expect(defaultDueForView('upcoming', today, tomorrow)).toBe(tomorrow)
    })

    it('returns null for other views', () => {
      const others: QuickViewId[] = ['inbox', 'anytime', 'someday', 'logbook']
      others.forEach(view => {
        expect(defaultDueForView(view, today, tomorrow)).toBeNull()
      })
    })
  })

  describe('deriveStatusFromView', () => {
    it('returns snoozed for someday', () => {
      expect(deriveStatusFromView('someday')).toBe('snoozed')
    })

    it('returns open for other views', () => {
      ;['inbox', 'today', 'upcoming', 'anytime', 'logbook'].forEach(view => {
        expect(deriveStatusFromView(view as QuickViewId)).toBe('open')
      })
    })
  })

  describe('determineViewFromDate', () => {
    it('returns fallback when no date', () => {
      expect(determineViewFromDate(null, today, 'inbox')).toBe('anytime')
      expect(determineViewFromDate(null, today, 'someday')).toBe('someday')
    })

    it('returns today for past or current date', () => {
      expect(determineViewFromDate('2025-01-05', today)).toBe('today')
      expect(determineViewFromDate(today, today)).toBe('today')
    })

    it('returns upcoming for future dates', () => {
      expect(determineViewFromDate(tomorrow, today)).toBe('upcoming')
    })
  })
})
