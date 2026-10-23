import { local } from '../../platform/web/storage'

const KEY = 'my-bookings'

/** Tokens of bookings made on this device, newest first. */
export function savedTokens(): string[] {
  try {
    const value = JSON.parse(local.get(KEY) ?? '[]')
    return Array.isArray(value) ? value.filter((t) => typeof t === 'string') : []
  } catch {
    return []
  }
}

export function saveToken(token: string) {
  local.set(KEY, JSON.stringify([token, ...savedTokens().filter((t) => t !== token)].slice(0, 10)))
}

export function forgetTokens(tokens: string[]) {
  local.set(KEY, JSON.stringify(savedTokens().filter((t) => !tokens.includes(t))))
}
