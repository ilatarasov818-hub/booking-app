import { addDays, daysBetween, minutesUntil, parseHm, weekdayOf } from './time'
import type { Booking, Business, DaySlots, Now } from './types'

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/** Start times (minutes of day) still free on `date` for a service of `duration` minutes. */
export function freeSlots(
  biz: Business,
  date: string,
  duration: number,
  bookings: Booking[],
  now: Now,
): number[] {
  const ahead = daysBetween(now.date, date)
  if (ahead < 0 || ahead >= biz.horizonDays) return []
  const hours = biz.hours[weekdayOf(date)]
  if (!hours) return []

  const open = parseHm(hours.start)
  const close = parseHm(hours.end)
  const busy = [
    ...biz.breaks.map((b) => [parseHm(b.start), parseHm(b.end)]),
    ...bookings
      .filter((b) => b.status === 'active' && b.date === date)
      .map((b) => [b.start, b.start + b.duration]),
  ]

  const slots: number[] = []
  for (let t = open; t + duration <= close; t += biz.slotStep) {
    if (minutesUntil(now, date, t) < biz.minLeadMinutes) continue
    if (busy.some(([s, e]) => overlaps(t, t + duration, s, e))) continue
    slots.push(t)
  }
  return slots
}

export function availability(
  biz: Business,
  duration: number,
  bookings: Booking[],
  now: Now,
): DaySlots[] {
  return Array.from({ length: biz.horizonDays }, (_, i) => {
    const date = addDays(now.date, i)
    return { date, slots: freeSlots(biz, date, duration, bookings, now) }
  })
}

export type SlotGroup = { label: string; slots: number[] }

export function groupSlots(slots: number[]): SlotGroup[] {
  const groups: SlotGroup[] = [
    { label: 'Утро', slots: slots.filter((t) => t < 12 * 60) },
    { label: 'День', slots: slots.filter((t) => t >= 12 * 60 && t < 17 * 60) },
    { label: 'Вечер', slots: slots.filter((t) => t >= 17 * 60) },
  ]
  return groups.filter((g) => g.slots.length > 0)
}
