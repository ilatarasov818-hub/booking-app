import { useEffect } from 'react'
import { api, errorText } from '../../data/api'
import { useResource } from '../../data/hooks'
import { dayNumber, dayShort, formatDateLong, relativeDay } from '../../lib/format'
import { groupSlots } from '../../lib/slots'
import { formatHm } from '../../lib/time'
import type { Service } from '../../lib/types'
import { SectionTitle } from '../../ui/Card'
import { Chip } from '../../ui/Chip'
import { Loading } from '../../ui/Loading'
import { EmptyState, ErrorText } from '../../ui/States'

export function TimeStep({
  service,
  today,
  date,
  notice,
  onDate,
  onTime,
}: {
  service: Service
  today: string
  date?: string
  notice: string | null
  onDate: (date: string) => void
  onTime: (date: string, start: number) => void
}) {
  const avail = useResource(`avail:${service.id}`, () => api.availability(service.id))
  const days = avail.data?.days ?? []
  const firstOpen = days.find((d) => d.slots.length > 0)?.date
  const selected = days.find((d) => d.date === date && d.slots.length > 0) ?? days.find((d) => d.date === firstOpen)

  useEffect(() => {
    if (selected && selected.date !== date) onDate(selected.date)
  }, [selected, date, onDate])

  if (avail.loading && !avail.data) return <Loading label="Ищем свободное время…" />
  if (avail.error) return <ErrorText onRetry={avail.refresh}>{errorText(avail.error)}</ErrorText>
  if (!selected) {
    return (
      <EmptyState icon="calendar" title="Свободного времени пока нет">
        Все окна на ближайшие дни заняты. Загляните позже или позвоните нам.
      </EmptyState>
    )
  }

  return (
    <section className="flex animate-rise flex-col gap-5">
      {notice && <ErrorText>{notice}</ErrorText>}
      <div>
        <SectionTitle>Дата</SectionTitle>
        <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {days.map((d) => (
            <div key={d.date} className="w-14 shrink-0 snap-start">
              <Chip
                selected={d.date === selected.date}
                disabled={d.slots.length === 0}
                onClick={() => onDate(d.date)}
                label={formatDateLong(d.date)}
              >
                <span className="flex h-16 flex-col items-center justify-center">
                  <span className="text-caption opacity-70">{dayShort(d.date)}</span>
                  <span className="text-title">{dayNumber(d.date)}</span>
                </span>
              </Chip>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>
          {relativeDay(selected.date, today) ? `${relativeDay(selected.date, today)}, ` : ''}
          {formatDateLong(selected.date)}
        </SectionTitle>
        <div className="flex flex-col gap-4">
          {groupSlots(selected.slots).map((g) => (
            <div key={g.label}>
              <p className="px-1 pb-2 text-caption text-fg-2">{g.label}</p>
              <div className="grid grid-cols-4 gap-2">
                {g.slots.map((t) => (
                  <Chip key={t} selected={false} onClick={() => onTime(selected.date, t)}>
                    <span className="flex h-11 items-center text-body">{formatHm(t)}</span>
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
