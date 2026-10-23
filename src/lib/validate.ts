import { normalizePhone } from './phone'
import { isDate } from './time'
import type { BookingInput } from './types'

export type FieldErrors = Partial<Record<'name' | 'phone' | 'comment', string>>

export function contactErrors(name: string, phone: string, comment = ''): FieldErrors {
  const errors: FieldErrors = {}
  const trimmed = name.trim()
  if (trimmed.length < 2) errors.name = 'Укажите имя'
  else if (trimmed.length > 60) errors.name = 'Слишком длинное имя'
  if (!normalizePhone(phone)) errors.phone = 'Нужен номер из 10 цифр после +7'
  if (comment.length > 500) errors.comment = 'Не больше 500 символов'
  return errors
}

export type ParsedInput = { ok: true; input: Required<BookingInput> } | { ok: false; errors: FieldErrors; message: string }

/** Validate an untrusted booking body (server side). */
export function parseBookingInput(body: unknown): ParsedInput {
  const b = (body ?? {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v : '')
  const input = {
    serviceId: str(b.serviceId),
    date: str(b.date),
    start: typeof b.start === 'number' && Number.isInteger(b.start) ? b.start : -1,
    name: str(b.name).trim(),
    phone: str(b.phone),
    comment: str(b.comment).trim(),
  }
  if (!input.serviceId || !isDate(input.date) || input.start < 0 || input.start >= 1440) {
    return { ok: false, errors: {}, message: 'bad_slot' }
  }
  const errors = contactErrors(input.name, input.phone, input.comment)
  if (Object.keys(errors).length > 0) return { ok: false, errors, message: 'bad_contact' }
  return { ok: true, input: { ...input, phone: normalizePhone(input.phone)! } }
}
