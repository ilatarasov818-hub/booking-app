import { describe, expect, it } from 'vitest'
import { clientState } from './manage'
import { BIZ, booking } from './test-fixtures'

// booking(): 2026-10-26 10:00–11:00, BIZ.minLeadMinutes = 60.
describe('clientState', () => {
  it('lets the client change a booking well ahead', () => {
    expect(clientState(booking(), BIZ, { date: '2026-10-25', minutes: 600 })).toBe('active')
  })

  it('locks changes inside the lead time', () => {
    expect(clientState(booking(), BIZ, { date: '2026-10-26', minutes: 541 })).toBe('locked')
    expect(clientState(booking(), BIZ, { date: '2026-10-26', minutes: 630 })).toBe('locked')
  })

  it('reports past and cancelled bookings', () => {
    expect(clientState(booking(), BIZ, { date: '2026-10-26', minutes: 660 })).toBe('past')
    expect(clientState(booking({ status: 'cancelled' }), BIZ, { date: '2026-10-20', minutes: 0 })).toBe('cancelled')
  })
})
