import DatePickerOverlay from './DatePickerOverlay.js'
import { useTranslations } from '../../App.js'

type DatePickerTarget = 'new' | 'edit' | 'draft' | null

interface TaskDatePickerOverlayProps {
  target: DatePickerTarget
  month: Date
  todayISO: string
  tomorrowISO: string
  draftDueDate: string | null
  editingDueDate: string
  mobileDraftDueDate: string | null
  formatDateLabel: (value: string) => string
  anchorEl?: HTMLElement | null
  isMobile?: boolean
  onClose: () => void
  onMonthChange: (offset: number) => void
  onSelectDate: (value: string | null) => void
}

function resolveDateValue(target: DatePickerTarget, draft: string | null, editing: string, mobileDraft: string | null) {
  if (target === 'new') {
    return draft || ''
  }
  if (target === 'edit') {
    return editing || ''
  }
  if (target === 'draft') {
    return mobileDraft || ''
  }
  return ''
}

export default function TaskDatePickerOverlay({
  target,
  month,
  todayISO,
  tomorrowISO,
  draftDueDate,
  editingDueDate,
  mobileDraftDueDate,
  formatDateLabel,
  anchorEl = null,
  isMobile = false,
  onClose,
  onMonthChange,
  onSelectDate,
}: TaskDatePickerOverlayProps) {
  const { t } = useTranslations()
  const selectedDate = resolveDateValue(target, draftDueDate, editingDueDate, mobileDraftDueDate)
  const selectedDateLabel = selectedDate ? formatDateLabel(selectedDate) : t('datePicker.none')

  return (
    <DatePickerOverlay
      open={target !== null}
      mode={target || 'new'}
      month={month}
      todayISO={todayISO}
      tomorrowISO={tomorrowISO}
      selectedDate={selectedDate}
      selectedDateLabel={selectedDateLabel}
      formatDateLabel={formatDateLabel}
      anchorEl={anchorEl}
      isMobile={isMobile}
      onClose={onClose}
      onMonthChange={onMonthChange}
      onSelectDate={onSelectDate}
    />
  )
}
