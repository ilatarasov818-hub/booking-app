import { useState } from 'react'
import { errorText } from '../../data/api'
import { formatPrice, formatRange } from '../../lib/format'
import { prettyPhone } from '../../lib/phone'
import { formatHm } from '../../lib/time'
import type { Booking } from '../../lib/types'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { ErrorText } from '../../ui/States'

export function BookingRow({
  booking,
  currency,
  onCancel,
}: {
  booking: Booking
  currency: string
  onCancel?: (id: string) => Promise<void>
}) {
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelled = booking.status === 'cancelled'

  const cancel = async () => {
    if (!onCancel) return
    setBusy(true)
    setError(null)
    try {
      await onCancel(booking.id)
      setConfirming(false)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li className="flex gap-4 px-4 py-3">
      <p className={`w-12 shrink-0 pt-0.5 tabular-nums ${cancelled ? 'text-fg-3 line-through' : ''}`}>
        <span className="block text-body font-semibold">{formatHm(booking.start)}</span>
        <span className="block text-caption text-fg-2">{formatHm(booking.start + booking.duration)}</span>
      </p>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold">{booking.name}</p>
        <p className="text-caption text-fg-2">
          {booking.serviceName} · {formatPrice(booking.price, currency)}
        </p>
        <a href={`tel:${booking.phone}`} className="mt-1 inline-flex items-center gap-1 text-caption whitespace-nowrap text-accent">
          <Icon name="phone" size={14} />
          {prettyPhone(booking.phone)}
        </a>
        {booking.comment && (
          <p className="mt-1 flex gap-1 text-caption text-fg-2">
            <Icon name="message" size={14} className="mt-0.5" />
            {booking.comment}
          </p>
        )}
      </div>
      {onCancel && !cancelled && (
        <div className="shrink-0">
          <Button variant="danger" onClick={() => setConfirming(true)}>
            Отменить
          </Button>
        </div>
      )}
      <Dialog open={confirming} onClose={() => setConfirming(false)} title="Отменить запись?">
        <p className="text-body text-fg-2">
          {booking.name}, {formatRange(booking.start, booking.duration)}. Время снова станет свободным. Клиенту
          лучше позвонить и предупредить.
        </p>
        {error && <ErrorText>{error}</ErrorText>}
        <div className="flex flex-col gap-2">
          <Button variant="danger" size="lg" block loading={busy} onClick={cancel}>
            Отменить запись
          </Button>
          <Button variant="secondary" size="lg" block onClick={() => setConfirming(false)}>
            Оставить
          </Button>
        </div>
      </Dialog>
    </li>
  )
}
