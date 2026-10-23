import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Settings } from '../src/lib/settings'
import type { Booking } from '../src/lib/types'

/** JSON files in one folder. Sync I/O keeps check-then-write atomic in a single process. */
export class Store {
  constructor(private dir: string) {
    mkdirSync(dir, { recursive: true })
  }

  private read<T>(file: string, fallback: T): T {
    const path = join(this.dir, file)
    return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : fallback
  }

  private write(file: string, value: unknown) {
    const path = join(this.dir, file)
    writeFileSync(`${path}.tmp`, JSON.stringify(value, null, 2))
    renameSync(`${path}.tmp`, path)
  }

  bookings(): Booking[] {
    return this.read<Booking[]>('bookings.json', [])
  }

  addBooking(booking: Booking) {
    this.write('bookings.json', [...this.bookings(), booking])
  }

  updateBooking(id: string, patch: Partial<Booking>): Booking | null {
    const all = this.bookings()
    const i = all.findIndex((b) => b.id === id)
    if (i < 0) return null
    all[i] = { ...all[i], ...patch }
    this.write('bookings.json', all)
    return all[i]
  }

  notifyChatId(): string | null {
    return this.read<{ chatId: string | null }>('notify.json', { chatId: null }).chatId
  }

  setNotifyChatId(chatId: string) {
    this.write('notify.json', { chatId })
  }

  /** What the master changed in the cabinet; overrides config.json. */
  settings(): Partial<Settings> {
    return this.read<Partial<Settings>>('business.json', {})
  }

  setSettings(settings: Settings) {
    this.write('business.json', settings)
  }
}
