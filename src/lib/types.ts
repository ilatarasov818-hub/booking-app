export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export type Span = { start: string; end: string }

export type Service = {
  id: string
  name: string
  description?: string
  duration: number
  price: number
}

export type Business = {
  name: string
  master: string
  tagline: string
  address: string
  phone: string
  accent: string
  timezone: string
  currency: string
  slotStep: number
  horizonDays: number
  minLeadMinutes: number
  hours: Record<Weekday, Span | null>
  breaks: Span[]
  services: Service[]
}

export type BookingStatus = 'active' | 'cancelled'

export type Booking = {
  id: string
  serviceId: string
  serviceName: string
  price: number
  date: string
  start: number
  duration: number
  name: string
  phone: string
  comment: string
  status: BookingStatus
  createdAt: string
  /** Secret for the client's own link (/my/<token>). Missing on bookings made before it existed. */
  token?: string
  cancelledBy?: 'client' | 'master'
}

export type BookingInput = {
  serviceId: string
  date: string
  start: number
  name: string
  phone: string
  comment?: string
}

export type DaySlots = { date: string; slots: number[] }

export type Now = { date: string; minutes: number }
