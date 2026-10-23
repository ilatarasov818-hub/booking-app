/** Russian phone to +7XXXXXXXXXX, or null when it is not a valid number. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) digits = digits.slice(1)
  if (digits.length !== 10) return null
  return `+7${digits}`
}

/** Mask as the user types: +7 (912) 345-67-89. */
export function maskPhone(input: string): string {
  let digits = input.replace(/\D/g, '')
  if (digits[0] === '7' || digits[0] === '8') digits = digits.slice(1)
  digits = digits.slice(0, 10)
  if (!digits) return ''
  let out = `+7 (${digits.slice(0, 3)}`
  if (digits.length >= 3) out += ')'
  if (digits.length > 3) out += ` ${digits.slice(3, 6)}`
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`
  if (digits.length > 8) out += `-${digits.slice(8, 10)}`
  return out
}

export function prettyPhone(normalized: string): string {
  return maskPhone(normalized.slice(2))
}
