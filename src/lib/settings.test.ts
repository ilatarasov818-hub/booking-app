import { describe, expect, it } from 'vitest'
import { parseSettings, pickSettings } from './settings'
import { BIZ } from './test-fixtures'

let n = 0
const newId = () => `new-${++n}`

describe('parseSettings', () => {
  it('accepts the current settings unchanged', () => {
    const result = parseSettings(pickSettings(BIZ), newId)
    expect(result).toEqual({ ok: true, settings: pickSettings(BIZ) })
  })

  it('keeps existing service ids and gives new ones an id', () => {
    const body = { ...pickSettings(BIZ), services: [...BIZ.services, { name: 'Новая', duration: 90, price: 3000 }] }
    const result = parseSettings(body, newId)
    if (!result.ok) throw new Error(JSON.stringify(result.errors))
    expect(result.settings.services.map((s) => s.id)).toEqual(['short', 'long', 'new-1'])
  })

  it('reports each bad field', () => {
    const result = parseSettings(
      {
        ...pickSettings(BIZ),
        name: ' ',
        hours: { ...BIZ.hours, mon: { start: '18:00', end: '09:00' }, tue: { start: '9', end: '10:00' } },
        breaks: [{ start: '13:00', end: '12:00' }],
        services: [{ id: 'x', name: '', duration: 7, price: -1 }],
      },
      newId,
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(
      ['breaks.0', 'hours.mon', 'hours.tue', 'name', 'services.0.duration', 'services.0.name', 'services.0.price'].sort(),
    )
  })

  it('needs a working day and a service', () => {
    const closed = Object.fromEntries(Object.keys(BIZ.hours).map((d) => [d, null]))
    const result = parseSettings({ ...pickSettings(BIZ), hours: closed, services: [] }, newId)
    expect(result.ok ? {} : result.errors).toMatchObject({ hours: expect.any(String), services: expect.any(String) })
  })
})
