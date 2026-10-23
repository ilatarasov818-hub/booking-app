import type { Booking } from './types'

function stamp(date: string, minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${date.replace(/-/g, '')}T${h}${m}00`
}

function escape(text: string): string {
  return text.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}

/** Calendar file for a booking, in the business's local (floating) time. */
export function bookingIcs(booking: Booking, businessName: string, address: string, manageUrl?: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//booking-app//RU',
    'BEGIN:VEVENT',
    `UID:${booking.id}@booking-app`,
    `DTSTAMP:${booking.createdAt.replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART:${stamp(booking.date, booking.start)}`,
    `DTEND:${stamp(booking.date, booking.start + booking.duration)}`,
    `SUMMARY:${escape(`${booking.serviceName} — ${businessName}`)}`,
    `LOCATION:${escape(address)}`,
  ]
  if (manageUrl) lines.push(`DESCRIPTION:${escape(`Перенести или отменить: ${manageUrl}`)}`, `URL:${manageUrl}`)
  return [...lines, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
}
