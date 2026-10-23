import { describe, expect, it } from 'vitest'
import { addDays, daysBetween, formatHm, isDate, nowIn, parseHm, weekdayOf } from './time'

describe('time', () => {
  it('converts hh:mm', () => {
    expect(parseHm('09:30')).toBe(570)
    expect(formatHm(570)).toBe('09:30')
  })

  it('does date math across months', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(daysBetween('2026-10-25', '2026-11-01')).toBe(7)
    expect(weekdayOf('2026-10-26')).toBe('mon')
  })

  it('validates dates', () => {
    expect(isDate('2026-02-28')).toBe(true)
    expect(isDate('2026-02-30')).toBe(false)
    expect(isDate('26-10-2026')).toBe(false)
  })

  it('reads the clock in the business time zone', () => {
    expect(nowIn('Europe/Moscow', new Date('2026-10-25T21:30:00Z'))).toEqual({ date: '2026-10-26', minutes: 30 })
  })
})
