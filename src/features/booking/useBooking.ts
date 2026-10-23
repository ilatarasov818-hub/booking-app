import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, errorText } from '../../data/api'
import { onPop, pushState, replaceState } from '../../platform/web/history'
import type { Booking, Service } from '../../lib/types'
import type { FieldErrors } from '../../lib/validate'

export type Step =
  | { name: 'service' }
  | { name: 'time'; serviceId: string; date?: string }
  | { name: 'contact'; serviceId: string; date: string; start: number }
  | { name: 'done'; booking: Booking }

function isStep(value: unknown): value is Step {
  return typeof value === 'object' && value !== null && 'name' in value
}

/** Booking wizard. Each step is a history entry, so the phone's Back goes one step back. */
export function useBooking(services: Service[]) {
  const [step, setStep] = useState<Step>({ name: 'service' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    replaceState({ name: 'service' } satisfies Step)
    return onPop((_, state) => {
      setSubmitError(null)
      setStep(isStep(state) && state.name !== 'done' ? state : { name: 'service' })
    })
  }, [])

  const go = useCallback((next: Step) => {
    setSubmitError(null)
    setNotice(null)
    pushState(next)
    setStep(next)
  }, [])

  const service = 'serviceId' in step ? services.find((s) => s.id === step.serviceId) : undefined

  const chooseService = (serviceId: string) => go({ name: 'time', serviceId })

  const chooseDate = (date: string) => {
    if (step.name !== 'time') return
    const next = { ...step, date }
    replaceState(next)
    setStep(next)
  }

  const chooseTime = (date: string, start: number) => {
    if (step.name !== 'time') return
    replaceState({ ...step, date })
    go({ name: 'contact', serviceId: step.serviceId, date, start })
  }

  const submit = async (contact: { name: string; phone: string; comment: string; website: string }) => {
    if (step.name !== 'contact') return
    setSubmitting(true)
    setSubmitError(null)
    setFieldErrors({})
    try {
      const { booking } = await api.book({ serviceId: step.serviceId, date: step.date, start: step.start, ...contact })
      replaceState({ name: 'service' } satisfies Step)
      setStep({ name: 'done', booking })
    } catch (err) {
      if (err instanceof ApiError && err.code === 'slot_taken') {
        const back: Step = { name: 'time', serviceId: step.serviceId, date: step.date }
        replaceState(back)
        setStep(back)
        setNotice(errorText(err))
      } else {
        if (err instanceof ApiError) setFieldErrors(err.fields)
        setSubmitError(errorText(err))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const restart = () => go({ name: 'service' })

  return { step, service, chooseService, chooseDate, chooseTime, submit, restart, submitting, submitError, fieldErrors, notice }
}
