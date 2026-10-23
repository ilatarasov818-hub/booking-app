import { WEEK, type Settings } from '../../lib/settings'
import type { Span, Weekday } from '../../lib/types'

/** Form state: numbers as typed strings, days keep their times while switched off. */
export type DraftService = { key: string; id: string; name: string; description: string; duration: string; price: string }
export type DraftDay = { on: boolean; start: string; end: string }
export type Draft = {
  name: string
  master: string
  tagline: string
  address: string
  phone: string
  hours: Record<Weekday, DraftDay>
  breaks: Span[]
  services: DraftService[]
}

let seq = 0
export const draftKey = () => `k${++seq}`

export function emptyService(): DraftService {
  return { key: draftKey(), id: '', name: '', description: '', duration: '60', price: '' }
}

export function toDraft(s: Settings): Draft {
  const hours = {} as Record<Weekday, DraftDay>
  for (const day of WEEK) {
    const span = s.hours[day]
    hours[day] = span ? { on: true, ...span } : { on: false, start: '10:00', end: '19:00' }
  }
  return {
    name: s.name,
    master: s.master,
    tagline: s.tagline,
    address: s.address,
    phone: s.phone,
    hours,
    breaks: s.breaks.map((b) => ({ ...b })),
    services: s.services.map((sv) => ({
      key: draftKey(),
      id: sv.id,
      name: sv.name,
      description: sv.description ?? '',
      duration: String(sv.duration),
      price: String(sv.price),
    })),
  }
}

const num = (v: string) => (v.trim() ? Number(v.replace(/\s/g, '')) : NaN)

/** Shape `parseSettings` and the server expect. */
export function fromDraft(d: Draft) {
  const hours = {} as Record<Weekday, Span | null>
  for (const day of WEEK) hours[day] = d.hours[day].on ? { start: d.hours[day].start, end: d.hours[day].end } : null
  return {
    name: d.name,
    master: d.master,
    tagline: d.tagline,
    address: d.address,
    phone: d.phone,
    hours,
    breaks: d.breaks,
    services: d.services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      duration: num(s.duration),
      price: num(s.price),
    })),
  }
}
