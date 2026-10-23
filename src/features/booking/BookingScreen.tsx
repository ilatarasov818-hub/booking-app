import type { Business } from '../../lib/types'
import { IconButton } from '../../ui/Button'
import { goBack } from '../../platform/web/history'
import { BusinessHeader } from './BusinessHeader'
import { ContactStep } from './ContactStep'
import { DoneStep } from './DoneStep'
import { ServiceStep } from './ServiceStep'
import { TimeStep } from './TimeStep'
import { useBooking } from './useBooking'

const STEP_TITLES = { time: 'Дата и время', contact: 'Ваши контакты' }

export function BookingScreen({ business, today }: { business: Business; today: string }) {
  const b = useBooking(business.services)
  const { step, service } = b
  const inWizard = step.name === 'time' || step.name === 'contact'

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      {inWizard ? (
        <div className="sticky top-0 z-10 -mx-4 flex items-center gap-1 bg-bg/85 px-2 py-2 backdrop-blur-xl">
          <IconButton icon="chevron-left" label="Назад" onClick={goBack} />
          <div className="min-w-0 flex-1">
            <BusinessHeader business={business} compact />
            <p className="text-caption text-fg-2">
              Шаг {step.name === 'time' ? 2 : 3} из 3 · {STEP_TITLES[step.name]}
            </p>
          </div>
        </div>
      ) : (
        step.name === 'service' && <BusinessHeader business={business} compact={false} />
      )}

      {step.name === 'service' && <ServiceStep business={business} onChoose={b.chooseService} />}
      {step.name === 'time' && service && (
        <TimeStep service={service} today={today} date={step.date} notice={b.notice} onDate={b.chooseDate} onTime={b.chooseTime} />
      )}
      {step.name === 'contact' && service && (
        <ContactStep
          business={business}
          service={service}
          date={step.date}
          start={step.start}
          submitting={b.submitting}
          submitError={b.submitError}
          serverErrors={b.fieldErrors}
          onSubmit={b.submit}
        />
      )}
      {step.name === 'done' && <DoneStep business={business} booking={step.booking} onAgain={b.restart} />}
    </div>
  )
}
