import { useState, type FormEvent } from 'react'
import { formatDateLong, formatDuration, formatPrice, formatRange } from '../../lib/format'
import { maskPhone } from '../../lib/phone'
import type { Business, Service } from '../../lib/types'
import { contactErrors, type FieldErrors } from '../../lib/validate'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Icon } from '../../ui/Icon'
import { ErrorText } from '../../ui/States'
import { TextField } from '../../ui/TextField'

export function BookingSummary({
  business,
  serviceName,
  price,
  date,
  start,
  duration,
}: {
  business: Business
  serviceName: string
  price: number
  date: string
  start: number
  duration: number
}) {
  return (
    <Card>
      <p className="text-body font-semibold">{serviceName}</p>
      <ul className="flex flex-col gap-1.5 pt-2 text-body text-fg-2">
        <li className="flex items-center gap-2">
          <Icon name="calendar" size={16} />
          {formatDateLong(date)}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="clock" size={16} />
          {formatRange(start, duration)} · {formatDuration(duration)}
        </li>
        <li className="flex items-center gap-2">
          <Icon name="pin" size={16} />
          {business.address}
        </li>
      </ul>
      <p className="mt-3 flex justify-between border-t border-line pt-3 text-body">
        <span className="text-fg-2">К оплате на месте</span>
        <span className="font-semibold tabular-nums">{formatPrice(price, business.currency)}</span>
      </p>
    </Card>
  )
}

export function ContactStep({
  business,
  service,
  date,
  start,
  submitting,
  submitError,
  serverErrors,
  onSubmit,
}: {
  business: Business
  service: Service
  date: string
  start: number
  submitting: boolean
  submitError: string | null
  serverErrors: FieldErrors
  onSubmit: (contact: { name: string; phone: string; comment: string; website: string }) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('')
  const [touched, setTouched] = useState(false)
  const errors = touched ? { ...serverErrors, ...contactErrors(name, phone, comment) } : serverErrors

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(contactErrors(name, phone, comment)).length > 0) return
    onSubmit({ name: name.trim(), phone, comment: comment.trim(), website })
  }

  return (
    <form onSubmit={submit} noValidate className="flex animate-rise flex-col gap-4">
      <BookingSummary
        business={business}
        serviceName={service.name}
        price={service.price}
        date={date}
        start={start}
        duration={service.duration}
      />
      <TextField label="Ваше имя" value={name} onChange={setName} error={errors.name} autoComplete="given-name" placeholder="Как к вам обращаться" />
      <TextField
        label="Телефон"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(v) => setPhone(maskPhone(v))}
        error={errors.phone}
        placeholder="+7 (900) 123-45-67"
      />
      <TextField label="Комментарий (необязательно)" value={comment} onChange={setComment} error={errors.comment} multiline placeholder="Например, цель или пожелания" />
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] size-px opacity-0"
      />
      {submitError && <ErrorText>{submitError}</ErrorText>}
      <Button type="submit" size="lg" block loading={submitting}>
        Записаться
      </Button>
      <p className="px-2 text-center text-caption text-fg-3">
        Нажимая «Записаться», вы соглашаетесь на обработку персональных данных для связи по записи.
      </p>
    </form>
  )
}
