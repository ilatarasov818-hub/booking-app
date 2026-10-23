import { readFileSync } from 'node:fs'
import { parseHm } from '../src/lib/time'
import type { Business } from '../src/lib/types'

export function loadBusiness(path: string): Business {
  const biz = JSON.parse(readFileSync(path, 'utf8')) as Business
  for (const span of [...Object.values(biz.hours), ...biz.breaks]) {
    if (span && parseHm(span.end) <= parseHm(span.start)) {
      throw new Error(`${path}: часы ${span.start}–${span.end}: конец раньше начала`)
    }
  }
  if (!biz.services.length) throw new Error(`${path}: нет ни одной услуги`)
  if (biz.slotStep <= 0) throw new Error(`${path}: slotStep должен быть больше 0`)
  return biz
}
