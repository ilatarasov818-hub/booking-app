import type { Booking, Business } from './types'

export const BIZ: Business = {
  name: 'Тест',
  master: 'Мастер',
  tagline: '',
  address: 'Адрес',
  phone: '+7 900 000-00-00',
  accent: '#0a84ff',
  timezone: 'Europe/Moscow',
  currency: '₽',
  slotStep: 30,
  horizonDays: 7,
  minLeadMinutes: 60,
  hours: {
    mon: { start: '10:00', end: '14:00' },
    tue: { start: '10:00', end: '14:00' },
    wed: { start: '10:00', end: '14:00' },
    thu: { start: '10:00', end: '14:00' },
    fri: { start: '10:00', end: '14:00' },
    sat: null,
    sun: null,
  },
  breaks: [{ start: '12:00', end: '12:30' }],
  services: [
    { id: 'short', name: 'Короткая', duration: 30, price: 1000 },
    { id: 'long', name: 'Длинная', duration: 60, price: 2500 },
  ],
}

export function booking(over: Partial<Booking> = {}): Booking {
  return {
    id: 'b1',
    serviceId: 'long',
    serviceName: 'Длинная',
    price: 2500,
    date: '2026-10-26',
    start: 600,
    duration: 60,
    name: 'Иван',
    phone: '+79001234567',
    comment: '',
    status: 'active',
    createdAt: '2026-10-23T10:00:00.000Z',
    ...over,
  }
}
