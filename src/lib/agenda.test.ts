import { describe, expect, it } from 'vitest'
import { agenda, upcomingRevenue } from './agenda'
import { booking } from './test-fixtures'

const now = { date: '2026-10-26', minutes: 11 * 60 }
const list = [
  booking({ id: 'old', date: '2026-10-20' }),
  booking({ id: 'done-today', start: 600, duration: 60 }),
  booking({ id: 'later-today', start: 13 * 60 }),
  booking({ id: 'tomorrow', date: '2026-10-27', price: 1000 }),
  booking({ id: 'cancelled', date: '2026-10-27', status: 'cancelled' }),
]
const ids = (days: ReturnType<typeof agenda>) => days.map((d) => d.bookings.map((b) => b.id))

describe('agenda', () => {
  it('splits upcoming, past and cancelled', () => {
    expect(ids(agenda(list, now, 'upcoming'))).toEqual([['later-today'], ['tomorrow']])
    expect(ids(agenda(list, now, 'past'))).toEqual([['done-today'], ['old']])
    expect(ids(agenda(list, now, 'cancelled'))).toEqual([['cancelled']])
  })

  it('sums upcoming visits', () => {
    expect(upcomingRevenue(list, now)).toEqual({ count: 2, sum: 3500 })
  })
})
