import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'
import { formatISODate } from '../../lib/dateUtils.js'
import { useTranslations } from '../../App.js'
import AnchoredPopover from './AnchoredPopover.js'

type PickerMode = 'new' | 'edit' | 'draft'
type PickerIntent = 'when' | 'deadline'

interface DatePickerOverlayProps {
  open: boolean
  mode: PickerMode
  intent?: PickerIntent
  month: Date
  todayISO: string
  tomorrowISO: string
  selectedDate: string
  selectedDateLabel: string
  formatDateLabel: (value: string) => string
  anchorEl?: HTMLElement | null
  isMobile?: boolean
  onClose: () => void
  onMonthChange: (offset: number) => void
  onSelectDate: (value: string | null) => void
}

export default function DatePickerOverlay({
  open,
  mode,
  intent,
  month,
  todayISO,
  tomorrowISO,
  selectedDate,
  selectedDateLabel,
  formatDateLabel,
  anchorEl = null,
  isMobile = false,
  onClose,
  onMonthChange,
  onSelectDate,
}: DatePickerOverlayProps) {
  if (!open) {
    return null
  }

  const { t } = useTranslations()
  const [pendingDate, setPendingDate] = useState(selectedDate)
  const effectiveIntent: PickerIntent = intent ?? 'when'

  useEffect(() => {
    if (open) {
      setPendingDate(selectedDate)
    }
  }, [open, selectedDate])

  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const monthLabel = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const quickOptions = [
    { id: 'today', label: t('datePicker.option.today'), value: todayISO },
    { id: 'tomorrow', label: t('datePicker.option.tomorrow'), value: tomorrowISO },
    { id: 'someday', label: t('gtd.someday'), value: 'someday' },
    { id: 'waiting', label: t('view.waiting'), value: 'waiting' },
    { id: 'reference', label: t('view.reference'), value: 'reference' },
    { id: 'clear', label: t('datePicker.option.clear'), value: '' },
  ]

  const calendarDays = buildCalendarDays(month, todayISO, selectedDate)
  const headerLabel =
    effectiveIntent === 'deadline'
      ? mode === 'new'
        ? t('datePicker.title.deadline.new')
        : mode === 'edit'
          ? t('datePicker.title.deadline.edit')
          : t('datePicker.title.deadline.draft')
      : mode === 'new'
        ? t('datePicker.title.new')
        : mode === 'edit'
          ? t('datePicker.title.edit')
          : t('datePicker.title.draft')

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const currentSelectionLabel = pendingDate === selectedDate
    ? selectedDateLabel
    : pendingDate
      ? formatDateLabel(pendingDate)
      : t('datePicker.none')

  const handleApply = () => {
    onSelectDate(pendingDate || null)
    onClose()
  }

  const handleQuickSelect = (value: string | null) => {
    onSelectDate(value)
    onClose()
  }

  const handleDaySelect = (iso: string) => {
    onSelectDate(iso)
    onClose()
  }

  const handleCancel = () => {
    setPendingDate(selectedDate)
    onClose()
  }

  const hintLabel = effectiveIntent === 'deadline' ? t('datePicker.hint.deadline') : t('datePicker.hint')
  const applyLabel = effectiveIntent === 'deadline' ? t('datePicker.apply.deadline') : t('datePicker.apply')
  const closeLabel = effectiveIntent === 'deadline'
    ? `${t('actions.close')} ${t('gtd.due').toLowerCase()}`
    : `${t('actions.close')} ${t('task.edit.when').toLowerCase()}`

  const panel = (
    <div
      className="w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-container)] shadow-2xl border border-[var(--color-border)]"
      onClick={handleOverlayClick}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">{headerLabel}</p>
          <p className="text-lg font-semibold text-[var(--on-surface)] capitalize">{monthLabel}</p>
        </div>
        {!isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--on-surface)] text-xl"
            aria-label={closeLabel}
          >
            ✕
          </button>
        )}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {quickOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleQuickSelect(option.value)}
              className={`px-3 py-1.5 rounded-[var(--radius-chip)] text-sm font-medium border transition ${pendingDate === option.value
                ? 'border-[var(--color-action-500)] text-[var(--color-action-500)] bg-[var(--color-accent-200)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)]'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onMonthChange(-1)}
            className="h-11 w-11 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)] flex items-center justify-center"
            aria-label={t('datePicker.prevMonth')}
          >
            ←
          </button>
          <span className="text-sm font-semibold text-[var(--color-text-muted)] capitalize">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={() => onMonthChange(1)}
            className="h-11 w-11 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)] flex items-center justify-center"
            aria-label={t('datePicker.nextMonth')}
          >
            →
          </button>
        </div>
        <div>
          <div className="grid grid-cols-7 text-center text-xs text-[var(--color-text-subtle)] tracking-wide mb-2">
            {weekdays.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => (
              <button
                key={day.iso}
                type="button"
                onClick={() => handleDaySelect(day.iso)}
                className={`h-11 w-11 mx-auto rounded-[var(--radius-card)] text-sm font-semibold transition flex items-center justify-center ${pendingDate === day.iso
                  ? 'bg-[var(--color-action-500)] text-[var(--on-primary)]'
                  : day.isToday
                    ? 'border border-[var(--color-primary-200)] text-[var(--color-primary-600)]'
                    : day.inMonth
                      ? 'text-[var(--on-surface)] hover:bg-[var(--color-primary-100)]'
                      : 'text-[var(--color-text-subtle)]'
                  }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
          <span>
            {pendingDate ? `${t('datePicker.selected')}: ${currentSelectionLabel}` : t('datePicker.noDateAssigned')}
          </span>
          <button
            type="button"
            onClick={() => handleQuickSelect('')}
            className="text-[var(--color-action-500)] font-semibold px-4 py-2"
          >
            {t('actions.clear')}
          </button>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          {hintLabel}
        </p>
        <div className="flex justify-end gap-2 pt-1 text-sm">
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-[44px] px-4 py-2 rounded-[var(--radius-card)] border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold hover:border-[var(--color-primary-400)]"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="min-h-[44px] px-6 py-2 rounded-[var(--radius-card)] bg-[var(--color-action-500)] text-[var(--on-primary)] font-semibold"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  )

  const usePopover = !!anchorEl && !isMobile
  if (usePopover) {
    return (
      <AnchoredPopover open={open} anchorEl={anchorEl} onClose={onClose} align="start" className="min-w-[280px]">
        {panel}
      </AnchoredPopover>
    )
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--color-overlay-strong)]" onClick={onClose}>
        <div className="absolute inset-x-4 bottom-6" onClick={(event) => event.stopPropagation()}>
          {panel}
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {panel}
    </div>
  )
}

function buildCalendarDays(month: Date, todayISO: string, selectedValue: string) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const cursor = new Date(firstDay)
  cursor.setDate(firstDay.getDate() - startOffset)
  const days = []
  for (let i = 0; i < 42; i++) {
    const current = new Date(cursor)
    current.setDate(cursor.getDate() + i)
    const iso = formatISODate(current)
    days.push({
      iso,
      label: current.getDate(),
      inMonth: current.getMonth() === month.getMonth(),
      isToday: iso === todayISO,
      isSelected: selectedValue ? iso === selectedValue : false,
    })
  }
  return days
}
