import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'
import { formatDateLong, formatPrice, formatRange } from '../src/lib/format'
import { prettyPhone } from '../src/lib/phone'
import { availability, freeSlots } from '../src/lib/slots'
import { nowIn } from '../src/lib/time'
import type { Booking, Business } from '../src/lib/types'
import { parseBookingInput } from '../src/lib/validate'
import type { Notifier } from './notifier'
import type { Store } from './store'

export type Deps = {
  business: Business
  store: Store
  notifier: Notifier
  adminPassword: string
  clock?: () => Date
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!)
}

function sameSecret(a: string, b: string): boolean {
  const hash = (s: string) => createHash('sha256').update(s).digest()
  return timingSafeEqual(hash(a), hash(b))
}

export function bookingMessage(title: string, b: Booking, currency: string): string {
  const lines = [
    `<b>${title}</b>`,
    `${escapeHtml(b.serviceName)} · ${formatPrice(b.price, currency)}`,
    `${formatDateLong(b.date)}, ${formatRange(b.start, b.duration)}`,
    `${escapeHtml(b.name)}, ${prettyPhone(b.phone)}`,
  ]
  if (b.comment) lines.push(`💬 ${escapeHtml(b.comment)}`)
  return lines.join('\n')
}

export function createApp({ business, store, notifier, adminPassword, clock = () => new Date() }: Deps) {
  const app = new Hono()
  const now = () => nowIn(business.timezone, clock())
  const service = (id: string) => business.services.find((s) => s.id === id)

  const notify = async (text: string) => {
    const chatId = store.notifyChatId()
    if (chatId) await notifier.send(chatId, text)
  }

  app.get('/api/business', (c) => c.json({ business, today: now().date }))

  app.get('/api/availability', (c) => {
    const svc = service(c.req.query('service') ?? '')
    if (!svc) return c.json({ error: 'unknown_service' }, 404)
    return c.json({ days: availability(business, svc.duration, store.bookings(), now()) })
  })

  app.post('/api/bookings', async (c) => {
    const body = await c.req.json().catch(() => null)
    // Hidden field only bots fill in.
    if (body?.website) return c.json({ error: 'bad_request' }, 400)
    const parsed = parseBookingInput(body)
    if (!parsed.ok) return c.json({ error: parsed.message, fields: parsed.errors }, 400)
    const { input } = parsed
    const svc = service(input.serviceId)
    if (!svc) return c.json({ error: 'unknown_service' }, 404)
    if (!freeSlots(business, input.date, svc.duration, store.bookings(), now()).includes(input.start)) {
      return c.json({ error: 'slot_taken' }, 409)
    }
    const booking: Booking = {
      id: randomUUID(),
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      date: input.date,
      start: input.start,
      duration: svc.duration,
      name: input.name,
      phone: input.phone,
      comment: input.comment,
      status: 'active',
      createdAt: clock().toISOString(),
    }
    store.addBooking(booking)
    await notify(bookingMessage('🆕 Новая запись', booking, business.currency))
    return c.json({ booking }, 201)
  })

  const admin = new Hono()
  admin.use(async (c, next) => {
    const token = c.req.header('authorization')?.replace(/^Bearer /, '') ?? ''
    if (!sameSecret(token, adminPassword)) return c.json({ error: 'unauthorized' }, 401)
    await next()
  })

  admin.get('/bookings', (c) => {
    const bookings = store.bookings().sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)
    return c.json({ bookings, now: now() })
  })

  admin.post('/bookings/:id/cancel', async (c) => {
    const booking = store.updateBooking(c.req.param('id'), { status: 'cancelled' })
    if (!booking) return c.json({ error: 'not_found' }, 404)
    await notify(bookingMessage('❌ Запись отменена', booking, business.currency))
    return c.json({ booking })
  })

  admin.get('/notify', (c) =>
    c.json({ configured: notifier.configured, linked: Boolean(store.notifyChatId()) }),
  )

  admin.post('/notify/link', async (c) => {
    if (!notifier.configured) return c.json({ error: 'no_token' }, 400)
    const chatId = await notifier.latestChat()
    if (!chatId) return c.json({ error: 'no_messages' }, 400)
    store.setNotifyChatId(chatId)
    await notifier.send(chatId, '✅ Готово! Сюда будут приходить новые записи и отмены.')
    return c.json({ linked: true })
  })

  admin.post('/notify/test', async (c) => {
    const chatId = store.notifyChatId()
    const ok = chatId ? await notifier.send(chatId, '🔔 Проверка: уведомления работают.') : false
    return c.json({ ok })
  })

  app.route('/api/admin', admin)
  return app
}
