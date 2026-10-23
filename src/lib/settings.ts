import { parseHm } from './time'
import type { Business, Service, Span, Weekday } from './types'

/** The part of the business the master edits in the cabinet. The rest stays in config.json. */
export type Settings = Pick<Business, 'name' | 'master' | 'tagline' | 'address' | 'phone' | 'hours' | 'breaks' | 'services'>

export const SETTINGS_KEYS = ['name', 'master', 'tagline', 'address', 'phone', 'hours', 'breaks', 'services'] as const

export const WEEK: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function pickSettings(biz: Business): Settings {
  const { name, master, tagline, address, phone, hours, breaks, services } = biz
  return { name, master, tagline, address, phone, hours, breaks, services }
}

/** Errors keyed by field path, e.g. `name`, `hours.mon`, `services.2.price`. */
export type SettingsErrors = Record<string, string>

const HM = /^([01]\d|2[0-3]):[0-5]\d$/

function spanError(span: Span): string | null {
  if (!HM.test(span.start) || !HM.test(span.end)) return 'Время в формате ЧЧ:ММ'
  if (parseHm(span.end) <= parseHm(span.start)) return 'Конец должен быть позже начала'
  return null
}

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const asSpan = (v: unknown): Span => {
  const o = (v ?? {}) as Record<string, unknown>
  return { start: str(o.start), end: str(o.end) }
}

/**
 * Validate untrusted settings (server) or the form (client). Services without an id get
 * `newId()`; existing ids are kept so past bookings still match their service.
 */
export function parseSettings(
  body: unknown,
  newId: () => string,
): { ok: true; settings: Settings } | { ok: false; errors: SettingsErrors } {
  const b = (body ?? {}) as Record<string, unknown>
  const errors: SettingsErrors = {}

  const text = (key: 'name' | 'master' | 'tagline' | 'address' | 'phone', max: number, required: boolean) => {
    const value = str(b[key])
    if (required && !value) errors[key] = 'Заполните поле'
    else if (value.length > max) errors[key] = `Не больше ${max} символов`
    return value
  }
  const name = text('name', 80, true)
  const master = text('master', 120, false)
  const tagline = text('tagline', 160, false)
  const address = text('address', 160, false)
  const phone = text('phone', 40, false)

  const rawHours = (b.hours ?? {}) as Record<string, unknown>
  const hours = {} as Record<Weekday, Span | null>
  for (const day of WEEK) {
    hours[day] = rawHours[day] ? asSpan(rawHours[day]) : null
    const err = hours[day] && spanError(hours[day])
    if (err) errors[`hours.${day}`] = err
  }
  if (WEEK.every((d) => !hours[d])) errors.hours = 'Нужен хотя бы один рабочий день'

  const breaks = (Array.isArray(b.breaks) ? b.breaks : []).slice(0, 5).map(asSpan)
  breaks.forEach((span, i) => {
    const err = spanError(span)
    if (err) errors[`breaks.${i}`] = err
  })

  const rawServices = Array.isArray(b.services) ? b.services : []
  if (!rawServices.length) errors.services = 'Нужна хотя бы одна услуга'
  if (rawServices.length > 30) errors.services = 'Не больше 30 услуг'
  const seen = new Set<string>()
  const services: Service[] = rawServices.slice(0, 30).map((raw, i) => {
    const o = (raw ?? {}) as Record<string, unknown>
    let id = str(o.id)
    if (!/^[\w-]{1,40}$/.test(id) || seen.has(id)) id = newId()
    seen.add(id)
    const s: Service = {
      id,
      name: str(o.name),
      duration: typeof o.duration === 'number' ? o.duration : NaN,
      price: typeof o.price === 'number' ? o.price : NaN,
    }
    const description = str(o.description)
    if (description) s.description = description
    if (!s.name) errors[`services.${i}.name`] = 'Укажите название'
    else if (s.name.length > 80) errors[`services.${i}.name`] = 'Не больше 80 символов'
    if (description.length > 200) errors[`services.${i}.description`] = 'Не больше 200 символов'
    if (!Number.isInteger(s.duration) || s.duration < 5 || s.duration > 600 || s.duration % 5) {
      errors[`services.${i}.duration`] = 'От 5 до 600 минут, кратно 5'
    }
    if (!Number.isInteger(s.price) || s.price < 0 || s.price > 10_000_000) errors[`services.${i}.price`] = 'Цена в рублях'
    return s
  })

  if (Object.keys(errors).length) return { ok: false, errors }
  return { ok: true, settings: { name, master, tagline, address, phone, hours, breaks, services } }
}
