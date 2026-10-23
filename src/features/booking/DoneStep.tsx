import { useState } from 'react'
import { bookingIcs } from '../../lib/ics'
import { myPath } from '../../lib/manage'
import type { Booking, Business } from '../../lib/types'
import { copyText, downloadText } from '../../platform/web/document'
import { absoluteUrl, navigate } from '../../platform/web/history'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Icon } from '../../ui/Icon'
import { BookingSummary } from './ContactStep'

export function DoneStep({ business, booking, onAgain }: { business: Business; booking: Booking; onAgain: () => void }) {
  const link = booking.token ? absoluteUrl(myPath(booking.token)) : null
  const [copied, setCopied] = useState(false)

  const addToCalendar = () =>
    downloadText('zapis.ics', bookingIcs(booking, business.name, business.address, link ?? undefined), 'text/calendar')

  const copy = async () => {
    if (link && (await copyText(link))) setCopied(true)
  }

  return (
    <section className="flex animate-rise flex-col gap-5 pt-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
          <Icon name="check" size={34} />
        </span>
        <h1 className="text-display font-bold tracking-tight">Вы записаны!</h1>
        <p className="max-w-xs text-body text-fg-2">{booking.name}, ждём вас.</p>
      </div>
      <BookingSummary
        business={business}
        serviceName={booking.serviceName}
        price={booking.price}
        date={booking.date}
        start={booking.start}
        duration={booking.duration}
      />
      {link && (
        <Card>
          <p className="text-body font-semibold">Планы изменились?</p>
          <p className="pt-1 text-caption text-fg-2">
            Перенести или отменить запись можно по вашей личной ссылке. Она сохранена на этом устройстве и в
            файле календаря.
          </p>
          <div className="flex gap-2 pt-3">
            <Button variant="secondary" icon={copied ? 'check' : 'link'} onClick={copy}>
              {copied ? 'Скопировано' : 'Скопировать ссылку'}
            </Button>
            <Button variant="ghost" onClick={() => navigate(myPath(booking.token!))}>
              Открыть
            </Button>
          </div>
        </Card>
      )}
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
