import { useEffect, useState } from 'react'
import type { MouseEvent } from 'react'

type PickerMode = 'new' | 'edit' | 'draft'

interface DatePickerOverlayProps {
  open: boolean
  mode: PickerMode
  month: Date
  todayISO: string
  tomorrowISO: string
  selectedDate: string
  selectedDateLabel: string
  formatDateLabel: (value: string) => string
  onClose: () => void
  onMonthChange: (offset: number) => void
  onSelectDate: (value: string | null) => void
}

export default function DatePickerOverlay({
  open,
  mode,
  month,
  todayISO,
  tomorrowISO,
  selectedDate,
  selectedDateLabel,
  formatDateLabel,
  onClose,
  onMonthChange,
  onSelectDate,
}: DatePickerOverlayProps) {
  if (!open) {
    return null
  }

  const [pendingDate, setPendingDate] = useState(selectedDate)

  useEffect(() => {
    if (open) {
      setPendingDate(selectedDate)
    }
  }, [open, selectedDate])

  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const monthLabel = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const weekendDate = new Date(todayISO)
  const dayOfWeek = weekendDate.getDay()
  const daysUntilWeekend = dayOfWeek === 6 ? 0 : 6 - dayOfWeek
  weekendDate.setDate(weekendDate.getDate() + daysUntilWeekend)
  const weekendISO = weekendDate.toISOString().slice(0, 10)
  const nextWeekDate = new Date(todayISO)
  nextWeekDate.setDate(nextWeekDate.getDate() + 7)
  const nextWeekISO = nextWeekDate.toISOString().slice(0, 10)

  const quickOptions = [
    { id: 'today', label: 'Hoy', value: todayISO },
    { id: 'tomorrow', label: 'Mañana', value: tomorrowISO },
    { id: 'weekend', label: 'Este fin', value: weekendISO },
    { id: 'nextweek', label: 'Próxima semana', value: nextWeekISO },
    { id: 'clear', label: 'Sin fecha', value: '' },
  ]

  const calendarDays = buildCalendarDays(month, todayISO, selectedDate)
  const headerLabel =
    mode === 'new' ? 'Fecha para nueva tarea' : mode === 'edit' ? 'Actualizar vencimiento' : 'Plazo'

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const currentSelectionLabel = pendingDate === selectedDate
    ? selectedDateLabel
    : pendingDate
      ? formatDateLabel(pendingDate)
      : 'Sin fecha'

  const handleApply = () => {
    onSelectDate(pendingDate || null)
    onClose()
  }

  const handleCancel = () => {
    setPendingDate(selectedDate)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--color-surface)] rounded-2xl shadow-2xl"
        onClick={handleOverlayClick}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div>
            <p className="text-xs font-semibold text-[var(--color-text-muted)]">{headerLabel}</p>
            <p className="text-lg font-semibold text-[var(--on-surface)] capitalize">{monthLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--on-surface)] text-xl"
            aria-label="Cerrar selector de fecha"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPendingDate(option.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  pendingDate === option.value
                    ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-[var(--color-primary-100)]'
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
              className="h-11 w-11 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)] flex items-center justify-center"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <span className="text-sm font-semibold text-[var(--color-text-muted)] capitalize">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => onMonthChange(1)}
              className="h-11 w-11 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-400)] flex items-center justify-center"
              aria-label="Mes siguiente"
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
                  onClick={() => setPendingDate(day.iso)}
                  className={`h-11 w-11 mx-auto rounded-xl text-sm font-semibold transition flex items-center justify-center ${
                    pendingDate === day.iso
                      ? 'bg-[var(--color-primary-600)] text-[var(--on-primary)]'
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
              {pendingDate ? `Seleccionada: ${currentSelectionLabel}` : 'Sin fecha asignada'}
            </span>
            <button
              type="button"
              onClick={() => setPendingDate('')}
              className="text-[var(--color-primary-600)] font-semibold"
            >
              Limpiar
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-1 text-sm">
            <button
              type="button"
              onClick={handleCancel}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] font-semibold hover:border-[var(--color-primary-400)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="min-h-[44px] px-6 py-2 rounded-xl bg-[var(--color-primary-600)] text-[var(--on-primary)] font-semibold shadow-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
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
    const iso = current.toISOString().slice(0, 10)
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
