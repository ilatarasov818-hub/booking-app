import { describe, expect, it } from 'vitest'
import { maskPhone, normalizePhone, prettyPhone } from './phone'

describe('phone', () => {
  it('normalizes Russian numbers', () => {
    expect(normalizePhone('8 (912) 345-67-89')).toBe('+79123456789')
    expect(normalizePhone('+7 912 345 67 89')).toBe('+79123456789')
    expect(normalizePhone('9123456789')).toBe('+79123456789')
    expect(normalizePhone('12345')).toBeNull()
  })

  it('masks while typing', () => {
    expect(maskPhone('9')).toBe('+7 (9')
    expect(maskPhone('912345')).toBe('+7 (912) 345')
    expect(maskPhone('89123456789')).toBe('+7 (912) 345-67-89')
    expect(maskPhone('')).toBe('')
    expect(prettyPhone('+79123456789')).toBe('+7 (912) 345-67-89')
  })
})
