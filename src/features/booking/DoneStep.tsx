import { bookingIcs } from '../../lib/ics'
import type { Booking, Business } from '../../lib/types'
import { downloadText } from '../../platform/web/document'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { BookingSummary } from './ContactStep'

export function DoneStep({ business, booking, onAgain }: { business: Business; booking: Booking; onAgain: () => void }) {
  const addToCalendar = () =>
    downloadText('zapis.ics', bookingIcs(booking, business.name, business.address), 'text/calendar')

  return (
    <section className="flex animate-rise flex-col gap-5 pt-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
          <Icon name="check" size={34} />
        </span>
        <h1 className="text-display font-bold tracking-tight">Вы записаны!</h1>
        <p className="max-w-xs text-body text-fg-2">
          {booking.name}, ждём вас. Если планы изменятся, позвоните: {business.phone}
        </p>
      </div>
      <BookingSummary
        business={business}
        serviceName={booking.serviceName}
        price={booking.price}
        date={booking.date}
        start={booking.start}
        duration={booking.duration}
      />
      <div className="flex flex-col gap-2">
        <Button size="lg" block icon="calendar" onClick={addToCalendar}>
          Добавить в календарь
        </Button>
        <Button size="lg" block variant="ghost" onClick={onAgain}>
          Записаться ещё
        </Button>
      </div>
    </section>
  )
}
