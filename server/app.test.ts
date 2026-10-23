import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { BIZ } from '../src/lib/test-fixtures'
import { createApp } from './app'
import type { Notifier } from './notifier'
import { Store } from './store'

// Sunday 2026-10-25, 12:00 Moscow.
const clock = () => new Date('2026-10-25T09:00:00Z')

function setup() {
  const sent: string[] = []
  const notifier: Notifier = {
    configured: true,
    send: async (_chat, text) => (sent.push(text), true),
    latestChat: async () => '42',
  }
  const store = new Store(mkdtempSync(join(tmpdir(), 'booking-')))
  const app = createApp({ business: BIZ, store, notifier, adminPassword: 'secret', clock })
  return { app, store, sent }
}

const body = { serviceId: 'long', date: '2026-10-26', start: 600, name: 'Иван', phone: '89123456789', comment: '<b>hi</b>' }
const post = (_path: string, json: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(json),
})
const auth = { authorization: 'Bearer secret' }

describe('API', () => {
  let t: ReturnType<typeof setup>
  beforeEach(() => {
    t = setup()
  })

  it('serves business info and availability', async () => {
    const biz = await (await t.app.request('/api/business')).json()
    expect(biz.today).toBe('2026-10-25')
    const res = await t.app.request('/api/availability?service=long')
    const { days } = await res.json()
    expect(days[1]).toMatchObject({ date: '2026-10-26' })
    expect(days[1].slots).toContain(600)
    expect((await t.app.request('/api/availability?service=nope')).status).toBe(404)
  })

  it('books a free slot once, then refuses the same slot', async () => {
    const first = await t.app.request('/api/bookings', post('', body))
    expect(first.status).toBe(201)
    const { booking } = await first.json()
    expect(booking).toMatchObject({ phone: '+79123456789', serviceName: 'Длинная', status: 'active' })

    const again = await t.app.request('/api/bookings', post('', { ...body, start: 630 }))
    expect(again.status).toBe(409)

    const { days } = await (await t.app.request('/api/availability?service=long')).json()
    expect(days[1].slots).not.toContain(600)
  })

  it('validates input and drops bots', async () => {
    const bad = await t.app.request('/api/bookings', post('', { ...body, phone: '123' }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).fields.phone).toBeTruthy()
    expect((await t.app.request('/api/bookings', post('', { ...body, website: 'x' }))).status).toBe(400)
    expect((await t.app.request('/api/bookings', post('', { ...body, start: 9 * 60 }))).status).toBe(409)
  })

  it('protects the admin API', async () => {
    expect((await t.app.request('/api/admin/bookings')).status).toBe(401)
    expect((await t.app.request('/api/admin/bookings', { headers: { authorization: 'Bearer nope' } })).status).toBe(401)
    expect((await t.app.request('/api/admin/bookings', { headers: auth })).status).toBe(200)
  })

  it('notifies the master once linked, and cancel frees the slot', async () => {
    await t.app.request('/api/bookings', post('', body))
    expect(t.sent).toEqual([])

    const link = await t.app.request('/api/admin/notify/link', post('', {}, auth))
    expect(await link.json()).toEqual({ linked: true })
    expect(t.store.notifyChatId()).toBe('42')

    const second = await (await t.app.request('/api/bookings', post('', { ...body, start: 720 + 30 }))).json()
    expect(t.sent.at(-1)).toContain('Новая запись')
    expect(t.sent.at(-1)).toContain('&lt;b&gt;hi&lt;/b&gt;')

    const cancel = await t.app.request(`/api/admin/bookings/${second.booking.id}/cancel`, post('', {}, auth))
    expect((await cancel.json()).booking.status).toBe('cancelled')
    expect(t.sent.at(-1)).toContain('отменена')
    const { days } = await (await t.app.request('/api/availability?service=long')).json()
    expect(days[1].slots).toContain(750)
  })

  it('lets the client reschedule and cancel by their own link', async () => {
    const { booking } = await (await t.app.request('/api/bookings', post('', body))).json()
    expect(booking.token).toMatch(/^[\w-]{20,}$/)
    expect((await t.app.request('/api/my/wrong')).status).toBe(404)

    const view = await (await t.app.request(`/api/my/${booking.token}`)).json()
    expect(view.state).toBe('active')
    const { days } = await (await t.app.request(`/api/my/${booking.token}/availability`)).json()
    expect(days[1].slots).toContain(600)

    await t.app.request('/api/admin/notify/link', post('', {}, auth))
    const other = await (await t.app.request('/api/bookings', post('', { ...body, start: 780 }))).json()
    const taken = await t.app.request(`/api/my/${booking.token}/reschedule`, post('', { date: '2026-10-26', start: 780 }))
    expect(taken.status).toBe(409)

    const moved = await t.app.request(`/api/my/${booking.token}/reschedule`, post('', { date: '2026-10-27', start: 660 }))
    expect((await moved.json()).booking).toMatchObject({ date: '2026-10-27', start: 660, status: 'active' })
    expect(t.sent.at(-1)).toContain('перенёс')
    expect(t.sent.at(-1)).toContain('Было:')

    const cancel = await t.app.request(`/api/my/${booking.token}/cancel`, post('', {}))
    expect(await cancel.json()).toMatchObject({ state: 'cancelled', booking: { cancelledBy: 'client' } })
    expect(t.sent.at(-1)).toContain('Клиент отменил')
    expect((await t.app.request(`/api/my/${booking.token}/cancel`, post('', {}))).status).toBe(409)
    expect(other.booking.token).not.toBe(booking.token)
  })

  it('lets the master edit services and hours', async () => {
    const put = (json: unknown) => ({ ...post('', json, auth), method: 'PUT' })
    expect((await t.app.request('/api/admin/settings')).status).toBe(401)
    const { settings } = await (await t.app.request('/api/admin/settings', { headers: auth })).json()
    expect(settings.services).toHaveLength(2)

    const bad = await t.app.request('/api/admin/settings', put({ ...settings, services: [] }))
    expect(bad.status).toBe(400)
    expect((await bad.json()).fields.services).toBeTruthy()

    const next = {
      ...settings,
      name: 'Новое имя',
      hours: { ...settings.hours, mon: null, sun: { start: '15:00', end: '18:00' } },
      services: [{ ...settings.services[1], price: 3000 }, { name: 'Массаж', duration: 30, price: 1500 }],
    }
    const saved = await (await t.app.request('/api/admin/settings', put(next))).json()
    expect(saved.settings.services[1].id).toMatch(/^[\w-]+$/)

    const { business } = await (await t.app.request('/api/business')).json()
    expect(business).toMatchObject({ name: 'Новое имя', timezone: 'Europe/Moscow' })
    expect(business.services.map((s: { price: number }) => s.price)).toEqual([3000, 1500])
    // Monday is now closed, Sunday (today, 12:00) open from 15:00.
    const { days } = await (await t.app.request('/api/availability?service=long')).json()
    expect(days[1].slots).toEqual([])
    expect(days[0].slots[0]).toBe(900)
    expect((await t.app.request('/api/availability?service=short')).status).toBe(404)
  })
})
