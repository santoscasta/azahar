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
  onClose,
  onMonthChange,
  onSelectDate,
}: DatePickerOverlayProps) {
  if (!open) {
    return null
  }

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl"
        onClick={handleOverlayClick}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">{headerLabel}</p>
            <p className="text-lg font-semibold text-slate-800 capitalize">{monthLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
            aria-label="Cerrar selector de fecha"
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {quickOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelectDate(option.value || null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  selectedDate === option.value
                    ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-[var(--color-primary-100)]'
                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
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
              className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-slate-400"
              aria-label="Mes anterior"
            >
              ←
            </button>
            <span className="text-sm font-semibold text-slate-600 capitalize">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => onMonthChange(1)}
              className="p-2 rounded-full border border-slate-200 text-slate-500 hover:border-slate-400"
              aria-label="Mes siguiente"
            >
              →
            </button>
          </div>
          <div>
            <div className="grid grid-cols-7 text-center text-xs uppercase text-slate-400 tracking-wide mb-2">
              {weekdays.map(day => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => onSelectDate(day.iso)}
                  className={`py-2 rounded-2xl text-sm font-semibold transition ${
                    day.isSelected
                      ? 'bg-[var(--color-primary-600)] text-white'
                      : day.isToday
                        ? 'border border-[var(--color-primary-200)] text-[var(--color-primary-600)]'
                        : day.inMonth
                          ? 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              {selectedDate ? `Seleccionada: ${selectedDateLabel}` : 'Sin fecha asignada'}
            </span>
            <button
              type="button"
              onClick={() => onSelectDate('')}
              className="text-[var(--color-primary-600)] font-semibold"
            >
              Limpiar
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
