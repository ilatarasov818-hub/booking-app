import { useState } from 'react'
import { api, ApiError } from '../../data/api'
import { useResource } from '../../data/hooks'
import { formatDateLong, formatRange } from '../../lib/format'
import { myPath, type ClientView } from '../../lib/manage'
import { navigate } from '../../platform/web/history'
import { CardButton, SectionTitle } from '../../ui/Card'
import { Icon } from '../../ui/Icon'
import { forgetTokens, savedTokens } from './savedLinks'

/** Upcoming bookings made on this device, so the client can find them again without the link. */
async function loadUpcoming(tokens: string[]): Promise<ClientView[]> {
  const results = await Promise.allSettled(tokens.map((t) => api.my(t)))
  const stale = tokens.filter((_, i) => {
    const r = results[i]
    if (r.status === 'rejected') return r.reason instanceof ApiError && r.reason.code === 'not_found'
    return r.value.state === 'past' || r.value.state === 'cancelled'
  })
  if (stale.length) forgetTokens(stale)
  return results
    .flatMap((r) => (r.status === 'fulfilled' && (r.value.state === 'active' || r.value.state === 'locked') ? [r.value] : []))
    .sort((a, b) => a.booking.date.localeCompare(b.booking.date) || a.booking.start - b.booking.start)
}

export function MyBookings() {
  const [tokens] = useState(savedTokens)
  const upcoming = useResource(tokens.length ? `my:${tokens.join(',')}` : null, () => loadUpcoming(tokens))
  if (!upcoming.data?.length) return null

  return (
    <section className="animate-rise">
      <SectionTitle>Ваши записи</SectionTitle>
      <ul className="flex flex-col gap-2">
        {upcoming.data.map(({ booking }) => (
          <li key={booking.id}>
            <CardButton onClick={() => navigate(myPath(booking.token!))}>
              <span className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Icon name="calendar" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold">{booking.serviceName}</span>
                  <span className="block text-caption text-fg-2">
                    {formatDateLong(booking.date)}, {formatRange(booking.start, booking.duration)}
                  </span>
                </span>
                <Icon name="chevron-right" size={18} className="text-fg-3" />
              </span>
            </CardButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
