import { describe, expect, it } from 'vitest'
import { availability, freeSlots, groupSlots } from './slots'
import { BIZ, booking } from './test-fixtures'
import { formatHm } from './time'

// 2026-10-26 is a Monday.
const MON = '2026-10-26'
const SUNDAY_NIGHT = { date: '2026-10-25', minutes: 23 * 60 }
const hm = (slots: number[]) => slots.map(formatHm)

describe('freeSlots', () => {
  it('fills working hours around the break', () => {
    expect(hm(freeSlots(BIZ, MON, 30, [], SUNDAY_NIGHT))).toEqual([
      '10:00', '10:30', '11:00', '11:30', '12:30', '13:00', '13:30',
    ])
  })

  it('needs the whole service to fit before the break and closing', () => {
    expect(hm(freeSlots(BIZ, MON, 60, [], SUNDAY_NIGHT))).toEqual(['10:00', '10:30', '11:00', '12:30', '13:00'])
  })

  it('skips times that overlap an active booking', () => {
    const taken = [booking({ start: 10 * 60 + 30, duration: 60 })]
    expect(hm(freeSlots(BIZ, MON, 30, taken, SUNDAY_NIGHT))).toEqual(['10:00', '11:30', '12:30', '13:00', '13:30'])
  })

  it('ignores cancelled bookings and other days', () => {
    const others = [booking({ status: 'cancelled' }), booking({ date: '2026-10-27' })]
    expect(freeSlots(BIZ, MON, 30, others, SUNDAY_NIGHT)).toHaveLength(7)
  })

  it('keeps the minimum lead time today', () => {
    expect(hm(freeSlots(BIZ, MON, 30, [], { date: MON, minutes: 10 * 60 + 20 }))).toEqual([
      '11:30', '12:30', '13:00', '13:30',
    ])
  })

  it('keeps the lead time across midnight', () => {
    const lead = { ...BIZ, minLeadMinutes: 12 * 60 }
    expect(hm(freeSlots(lead, MON, 30, [], SUNDAY_NIGHT))).toEqual(['11:00', '11:30', '12:30', '13:00', '13:30'])
  })

  it('returns nothing on days off, in the past or beyond the horizon', () => {
    expect(freeSlots(BIZ, '2026-10-31', 30, [], SUNDAY_NIGHT)).toEqual([])
    expect(freeSlots(BIZ, '2026-10-23', 30, [], SUNDAY_NIGHT)).toEqual([])
    expect(freeSlots(BIZ, '2026-11-02', 30, [], SUNDAY_NIGHT)).toEqual([])
  })
})

describe('availability', () => {
  it('lists every day of the horizon from today', () => {
    const days = availability(BIZ, 30, [], SUNDAY_NIGHT)
    expect(days.map((d) => d.date)).toEqual([
      '2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31',
    ])
    expect(days[0].slots).toEqual([])
    expect(days[1].slots).toHaveLength(7)
  })
})

describe('groupSlots', () => {
  it('splits into morning, day and evening and drops empty groups', () => {
    expect(groupSlots([600, 780, 1080])).toEqual([
      { label: 'Утро', slots: [600] },
      { label: 'День', slots: [780] },
      { label: 'Вечер', slots: [1080] },
    ])
    expect(groupSlots([600]).map((g) => g.label)).toEqual(['Утро'])
  })
})
