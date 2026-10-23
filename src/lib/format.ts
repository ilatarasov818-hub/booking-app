import { addDays, formatHm, weekdayOf } from './time'

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const DAY_FULL = { mon: 'понедельник', tue: 'вторник', wed: 'среда', thu: 'четверг', fri: 'пятница', sat: 'суббота', sun: 'воскресенье' }
const DAY_SHORT = { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс' }

export function formatPrice(amount: number, currency: string): string {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return `${grouped}\u00a0${currency}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} мин`
  return m ? `${h} ч ${m} мин` : `${h} ч`
}

export function dayNumber(date: string): number {
  return Number(date.slice(8, 10))
}

export function dayShort(date: string): string {
  return DAY_SHORT[weekdayOf(date)]
}

/** "Сегодня" / "Завтра" / null relative to `today`. */
export function relativeDay(date: string, today: string): string | null {
  if (date === today) return 'Сегодня'
  if (date === addDays(today, 1)) return 'Завтра'
  return null
}

/** "суббота, 24 октября" */
export function formatDateLong(date: string): string {
  const month = MONTHS[Number(date.slice(5, 7)) - 1]
  return `${DAY_FULL[weekdayOf(date)]}, ${dayNumber(date)} ${month}`
}

export function formatRange(start: number, duration: number): string {
  return `${formatHm(start)}–${formatHm(start + duration)}`
}
