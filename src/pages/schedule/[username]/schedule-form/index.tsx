import { useState } from 'react'
import { CalendarStep } from './calendar-step'
import { ConfirmStep } from './confirm-step'

export function ScheduleForm() {
  const [selectDateTime, setSelectDateTime] = useState<Date | null>()

  function handleClearSelectedDateTime() {
    setSelectDateTime(null)
  }

  if (selectDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectDateTime}
        onCancelConfirmation={handleClearSelectedDateTime}
      />
    )
  }

  return <CalendarStep onSelectDateTime={setSelectDateTime} />
}
