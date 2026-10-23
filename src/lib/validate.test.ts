import { describe, expect, it } from 'vitest'
import { contactErrors, parseBookingInput } from './validate'

const ok = { serviceId: 'long', date: '2026-10-26', start: 600, name: ' Иван ', phone: '8 912 345 67 89' }

describe('validate', () => {
  it('flags bad contacts', () => {
    expect(contactErrors('И', '123')).toEqual({ name: 'Укажите имя', phone: 'Нужен номер из 10 цифр после +7' })
    expect(contactErrors('Иван', '9123456789')).toEqual({})
  })

  it('parses and normalizes a booking body', () => {
    expect(parseBookingInput(ok)).toEqual({
      ok: true,
      input: { ...ok, name: 'Иван', phone: '+79123456789', comment: '' },
    })
  })

  it('rejects broken slots', () => {
    expect(parseBookingInput({ ...ok, date: 'tomorrow' })).toMatchObject({ ok: false, message: 'bad_slot' })
    expect(parseBookingInput({ ...ok, start: 10.5 })).toMatchObject({ ok: false, message: 'bad_slot' })
    expect(parseBookingInput(null)).toMatchObject({ ok: false })
  })
})
