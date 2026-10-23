import { describe, expect, it } from 'vitest'
import { formatDateLong, formatDuration, formatPrice, formatRange, relativeDay } from './format'

describe('format', () => {
  it('formats money and time', () => {
    expect(formatPrice(12500, '₽')).toBe('12 500 ₽')
    expect(formatDuration(45)).toBe('45 мин')
    expect(formatDuration(90)).toBe('1 ч 30 мин')
    expect(formatDuration(120)).toBe('2 ч')
    expect(formatRange(600, 90)).toBe('10:00–11:30')
  })

  it('formats dates in Russian', () => {
    expect(formatDateLong('2026-10-24')).toBe('суббота, 24 октября')
    expect(relativeDay('2026-10-24', '2026-10-23')).toBe('Завтра')
    expect(relativeDay('2026-10-26', '2026-10-23')).toBeNull()
  })
})
