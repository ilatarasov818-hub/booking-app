import { useEffect, useState } from 'react'
import { api, ApiError, errorText } from '../../data/api'
import { useResource } from '../../data/hooks'
import type { ClientView } from '../../lib/manage'
import { goBack, onPop, pushState } from '../../platform/web/history'

type Mode = 'view' | 'reschedule'
type Slot = { date: string; start: number }

/** The client's own booking: view, move to another time, cancel. Rescheduling is a history entry. */
export function useManage(token: string) {
  const loaded = useResource(`my-view:${token}`, () => api.my(token))
  const [updated, setUpdated] = useState<ClientView | null>(null)
  const view = updated ?? loaded.data

  const [mode, setMode] = useState<Mode>('view')
  const [date, setDate] = useState<string | undefined>()
  const [pending, setPending] = useState<Slot | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [slotNotice, setSlotNotice] = useState<string | null>(null)
  const [availVersion, setAvailVersion] = useState(0)

  useEffect(() => onPop((_, state) => setMode(state === 'reschedule' ? 'reschedule' : 'view')), [])

  const startReschedule = () => {
    setNotice(null)
    setSlotNotice(null)
    setAvailVersion((v) => v + 1)
    pushState('reschedule')
    setMode('reschedule')
  }

  const pickTime = (d: string, start: number) => {
    setError(null)
    setPending({ date: d, start })
  }

  const run = async (action: () => Promise<ClientView>, done: string | null) => {
    setBusy(true)
    setError(null)
    try {
      setUpdated(await action())
      setNotice(done)
      return true
    } catch (err) {
      if (err instanceof ApiError && err.code === 'slot_taken') {
        setPending(null)
        setSlotNotice(errorText(err))
        setAvailVersion((v) => v + 1)
      } else {
        setError(errorText(err))
      }
      return false
    } finally {
      setBusy(false)
    }
  }

  const confirmReschedule = async () => {
    if (!pending) return
    if (await run(() => api.myReschedule(token, pending.date, pending.start), 'Готово, запись перенесена.')) {
      setPending(null)
      goBack()
    }
  }

  const confirmCancel = async () => {
    if (await run(() => api.myCancel(token), null)) setCancelling(false)
  }

  return {
    loaded,
    view,
    mode,
    date,
    setDate,
    pending,
    closePending: () => setPending(null),
    cancelling,
    askCancel: () => (setError(null), setCancelling(true)),
    closeCancel: () => setCancelling(false),
    busy,
    error,
    notice,
    slotNotice,
    availKey: `my-avail:${token}:${availVersion}`,
    startReschedule,
    pickTime,
    confirmReschedule,
    confirmCancel,
  }
}
