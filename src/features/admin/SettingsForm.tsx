import { errorText } from '../../data/api'
import { weekdayName } from '../../lib/format'
import { WEEK } from '../../lib/settings'
import type { Span } from '../../lib/types'
import { Button } from '../../ui/Button'
import { Card, SectionTitle } from '../../ui/Card'
import { Loading } from '../../ui/Loading'
import { ErrorText } from '../../ui/States'
import { Switch } from '../../ui/Switch'
import { TextField } from '../../ui/TextField'
import { TimeInput } from '../../ui/TimeInput'
import { emptyService, type Draft, type DraftService } from './settingsDraft'
import { useSettings } from './useSettings'

const PROFILE: { key: 'name' | 'master' | 'tagline' | 'address' | 'phone'; label: string; type?: 'tel' }[] = [
  { key: 'name', label: 'Название' },
  { key: 'master', label: 'Мастер' },
  { key: 'tagline', label: 'Коротко о вас' },
  { key: 'address', label: 'Адрес' },
  { key: 'phone', label: 'Телефон', type: 'tel' },
]

export function SettingsForm({ password, onSaved }: { password: string; onSaved: () => void }) {
  const s = useSettings(password, onSaved)
  const { draft, errors, update } = s

  if (s.res.error != null) return <ErrorText onRetry={s.res.refresh}>{errorText(s.res.error)}</ErrorText>
  if (!draft) return <Loading />

  const setService = (i: number, patch: Partial<DraftService>) =>
    update((d) => ({ ...d, services: d.services.map((sv, j) => (j === i ? { ...sv, ...patch } : sv)) }))
  const setDay = (day: (typeof WEEK)[number], patch: Partial<Draft['hours'][typeof day]>) =>
    update((d) => ({ ...d, hours: { ...d.hours, [day]: { ...d.hours[day], ...patch } } }))
  const setBreak = (i: number, patch: Partial<Span>) =>
    update((d) => ({ ...d, breaks: d.breaks.map((b, j) => (j === i ? { ...b, ...patch } : b)) }))

  return (
    <div className="flex flex-col gap-6 pb-24">
      <section>
        <SectionTitle>Профиль</SectionTitle>
        <Card>
          <div className="flex flex-col gap-4">
            {PROFILE.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                type={f.type}
                value={draft[f.key]}
                onChange={(v) => update((d) => ({ ...d, [f.key]: v }))}
                error={errors[f.key]}
              />
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle>Услуги</SectionTitle>
        <div className="flex flex-col gap-3">
          {draft.services.map((sv, i) => (
            <Card key={sv.key}>
              <div className="flex flex-col gap-4">
                <TextField label="Название" value={sv.name} onChange={(v) => setService(i, { name: v })} error={errors[`services.${i}.name`]} />
                <TextField
                  label="Описание"
                  value={sv.description}
                  onChange={(v) => setService(i, { description: v })}
                  error={errors[`services.${i}.description`]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextField
                    label="Длительность"
                    inputMode="numeric"
                    suffix="мин"
                    value={sv.duration}
                    onChange={(v) => setService(i, { duration: v })}
                    error={errors[`services.${i}.duration`]}
                  />
                  <TextField
                    label="Цена"
                    inputMode="numeric"
                    suffix="₽"
                    value={sv.price}
                    onChange={(v) => setService(i, { price: v })}
                    error={errors[`services.${i}.price`]}
                  />
                </div>
                <div>
                  <Button
                    variant="danger"
                    icon="trash"
                    onClick={() => update((d) => ({ ...d, services: d.services.filter((_, j) => j !== i) }))}
                  >
                    Удалить услугу
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {errors.services && <p className="px-1 text-caption text-danger">{errors.services}</p>}
          {draft.services.length < 30 && (
            <Button variant="secondary" icon="plus" block onClick={() => update((d) => ({ ...d, services: [...d.services, emptyService()] }))}>
              Добавить услугу
            </Button>
          )}
        </div>
      </section>

      <section>
        <SectionTitle>Часы работы</SectionTitle>
        <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface">
          {WEEK.map((day) => {
            const h = draft.hours[day]
            const err = errors[`hours.${day}`]
            return (
              <li key={day} className="px-4 py-3">
                <div className="flex min-h-10 items-center gap-3">
                  <Switch checked={h.on} onChange={(on) => setDay(day, { on })} label={weekdayName(day)} />
                  <span className={`flex-1 text-body ${h.on ? 'text-fg-1' : 'text-fg-3'}`}>{weekdayName(day)}</span>
                  {h.on ? (
                    <div className="flex items-center gap-1.5">
                      <TimeInput label={`${weekdayName(day)}, начало`} value={h.start} onChange={(v) => setDay(day, { start: v })} invalid={Boolean(err)} />
                      <span className="text-fg-3">–</span>
                      <TimeInput label={`${weekdayName(day)}, конец`} value={h.end} onChange={(v) => setDay(day, { end: v })} invalid={Boolean(err)} />
                    </div>
                  ) : (
                    <span className="text-body text-fg-3">Выходной</span>
                  )}
                </div>
                {err && <p className="pt-1.5 text-right text-caption text-danger">{err}</p>}
              </li>
            )
          })}
        </ul>
        {errors.hours && <p className="px-1 pt-1.5 text-caption text-danger">{errors.hours}</p>}
      </section>

      <section>
        <SectionTitle>Перерывы</SectionTitle>
        <div className="flex flex-col gap-3">
          {draft.breaks.length > 0 && (
            <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface">
              {draft.breaks.map((b, i) => (
                <li key={i} className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="flex-1 text-body whitespace-nowrap">Ежедневно</span>
                    <TimeInput label="Перерыв, начало" value={b.start} onChange={(v) => setBreak(i, { start: v })} invalid={Boolean(errors[`breaks.${i}`])} />
                    <span className="text-fg-3">–</span>
                    <TimeInput label="Перерыв, конец" value={b.end} onChange={(v) => setBreak(i, { end: v })} invalid={Boolean(errors[`breaks.${i}`])} />
                    <Button
                      variant="danger"
                      icon="trash"
                      label="Удалить перерыв"
                      onClick={() => update((d) => ({ ...d, breaks: d.breaks.filter((_, j) => j !== i) }))}
                    />
                  </div>
                  {errors[`breaks.${i}`] && <p className="pt-1.5 text-right text-caption text-danger">{errors[`breaks.${i}`]}</p>}
                </li>
              ))}
            </ul>
          )}
          {draft.breaks.length < 5 && (
            <Button
              variant="secondary"
              icon="plus"
              block
              onClick={() => update((d) => ({ ...d, breaks: [...d.breaks, { start: '13:00', end: '14:00' }] }))}
            >
              Добавить перерыв
            </Button>
          )}
        </div>
      </section>

      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-line bg-bg/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        {s.message && (
          <p role="status" className={`text-center text-caption ${s.message.ok ? 'text-success' : 'text-danger'}`}>
            {s.message.text}
          </p>
        )}
        <div className="flex gap-2">
          {s.dirty && (
            <Button variant="secondary" size="lg" onClick={s.reset}>
              Отменить
            </Button>
          )}
          <div className="flex-1">
            <Button size="lg" block onClick={s.save} loading={s.saving} disabled={!s.dirty}>
              Сохранить
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
