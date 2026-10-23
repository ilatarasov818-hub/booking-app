import { minutesUntil } from './time'
import type { Booking, Business, Now } from './types'

export type ClientState = 'active' | 'locked' | 'past' | 'cancelled'

export type ClientView = { booking: Booking; state: ClientState }

export function myPath(token: string): string {
  return `/my/${token}`
}

/**
 * What the client may do with their own booking. Changes close at the same lead time
 * new bookings need, so the master is never surprised at the last minute.
 */
export function clientState(booking: Booking, biz: Business, now: Now): ClientState {
  if (booking.status === 'cancelled') return 'cancelled'
  const left = minutesUntil(now, booking.date, booking.start)
  if (left + booking.duration <= 0) return 'past'
  return left < biz.minLeadMinutes ? 'locked' : 'active'
}
