import type { Booking, Now } from './types'

export type AgendaFilter = 'upcoming' | 'past' | 'cancelled'

export type AgendaDay = { date: string; bookings: Booking[] }

function isPast(b: Booking, now: Now): boolean {
  return b.date < now.date || (b.date === now.date && b.start + b.duration <= now.minutes)
}

/** Bookings for one admin tab, grouped by day. Past days newest first. */
export function agenda(bookings: Booking[], now: Now, filter: AgendaFilter): AgendaDay[] {
  const picked = bookings.filter((b) =>
    filter === 'cancelled' ? b.status === 'cancelled' : b.status === 'active' && isPast(b, now) === (filter === 'past'),
  )
  picked.sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
  const days: AgendaDay[] = []
  for (const b of picked) {
    const last = days.at(-1)
    if (last?.date === b.date) last.bookings.push(b)
    else days.push({ date: b.date, bookings: [b] })
  }
  return filter === 'upcoming' ? days : days.reverse()
}

export function upcomingRevenue(bookings: Booking[], now: Now): { count: number; sum: number } {
  const days = agenda(bookings, now, 'upcoming')
  const all = days.flatMap((d) => d.bookings)
  return { count: all.length, sum: all.reduce((s, b) => s + b.price, 0) }
}
