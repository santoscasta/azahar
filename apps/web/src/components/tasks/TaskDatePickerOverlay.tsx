import DatePickerOverlay from './DatePickerOverlay.js'
import { useTranslations } from '../../App.js'

type DatePickerTarget = 'new' | 'edit' | 'draft' | null
type DatePickerIntent = 'when' | 'deadline'

interface TaskDatePickerOverlayProps {
  target: DatePickerTarget
  intent: DatePickerIntent
  month: Date
  todayISO: string
  tomorrowISO: string
  draftDueDate: string | null
  draftDeadlineDate: string | null
  editingDueDate: string
  editingDeadlineDate: string
  mobileDraftDueDate: string | null
  mobileDraftDeadlineDate: string | null
  formatDateLabel: (value: string) => string
  anchorEl?: HTMLElement | null
  isMobile?: boolean
  onClose: () => void
  onMonthChange: (offset: number) => void
  onSelectDate: (value: string | null) => void
}

function resolveDateValue(
  target: DatePickerTarget,
  intent: DatePickerIntent,
  draftDue: string | null,
  draftDeadline: string | null,
  editingDue: string,
  editingDeadline: string,
  mobileDraftDue: string | null,
  mobileDraftDeadline: string | null
) {
  if (intent === 'deadline') {
    if (target === 'new') {
      return draftDeadline || ''
    }
    if (target === 'edit') {
      return editingDeadline || ''
    }
    if (target === 'draft') {
      return mobileDraftDeadline || ''
    }
    return ''
  }
  if (target === 'new') {
    return draftDue || ''
  }
  if (target === 'edit') {
    return editingDue || ''
  }
  if (target === 'draft') {
    return mobileDraftDue || ''
  }
  return ''
}

export default function TaskDatePickerOverlay({
  target,
  intent,
  month,
  todayISO,
  tomorrowISO,
  draftDueDate,
  draftDeadlineDate,
  editingDueDate,
  editingDeadlineDate,
  mobileDraftDueDate,
  mobileDraftDeadlineDate,
  formatDateLabel,
  anchorEl = null,
  isMobile = false,
  onClose,
  onMonthChange,
  onSelectDate,
}: TaskDatePickerOverlayProps) {
  const { t } = useTranslations()
  const selectedDate = resolveDateValue(
    target,
    intent,
    draftDueDate,
    draftDeadlineDate,
    editingDueDate,
    editingDeadlineDate,
    mobileDraftDueDate,
    mobileDraftDeadlineDate
  )
  const selectedDateLabel = selectedDate ? formatDateLabel(selectedDate) : t('datePicker.none')

  return (
    <DatePickerOverlay
      open={target !== null}
      mode={target || 'new'}
      intent={intent}
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
