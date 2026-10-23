import type { Booking, BookingInput, Business, DaySlots, Now } from '../lib/types'
import type { FieldErrors } from '../lib/validate'

const BASE = import.meta.env.VITE_API_BASE ?? ''

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields: FieldErrors = {},
  ) {
    super(code)
  }
}

async function request<T>(path: string, init: RequestInit & { password?: string } = {}): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (init.password) headers.authorization = `Bearer ${init.password}`
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'offline')
  }
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body.error ?? 'error', body.fields)
  return body as T
}

export const api = {
  business: () => request<{ business: Business; today: string }>('/api/business'),
  availability: (serviceId: string) =>
    request<{ days: DaySlots[] }>(`/api/availability?service=${encodeURIComponent(serviceId)}`),
  book: (input: BookingInput) =>
    request<{ booking: Booking }>('/api/bookings', { method: 'POST', body: JSON.stringify(input) }),

  adminBookings: (password: string) => request<{ bookings: Booking[]; now: Now }>('/api/admin/bookings', { password }),
  cancel: (password: string, id: string) =>
    request<{ booking: Booking }>(`/api/admin/bookings/${id}/cancel`, { method: 'POST', password }),
  notifyStatus: (password: string) =>
    request<{ configured: boolean; linked: boolean }>('/api/admin/notify', { password }),
  notifyLink: (password: string) => request<{ linked: boolean }>('/api/admin/notify/link', { method: 'POST', password }),
  notifyTest: (password: string) => request<{ ok: boolean }>('/api/admin/notify/test', { method: 'POST', password }),
}

export function errorText(err: unknown): string {
  if (!(err instanceof ApiError)) return 'Что-то пошло не так. Попробуйте ещё раз.'
  switch (err.code) {
    case 'offline':
      return 'Нет связи. Проверьте интернет и попробуйте ещё раз.'
    case 'slot_taken':
      return 'Это время только что заняли. Выберите другое.'
    case 'unauthorized':
      return 'Неверный пароль.'
    case 'no_token':
      return 'Сначала добавьте токен бота в настройки сайта.'
    case 'no_messages':
      return 'Бот пока не получил от вас сообщений. Напишите ему /start и нажмите ещё раз.'
    default:
      return 'Что-то пошло не так. Попробуйте ещё раз.'
  }
}
