import { useState } from 'react'
import { errorText } from '../../data/api'
import { agenda, upcomingRevenue, type AgendaFilter } from '../../lib/agenda'
import { formatDateLong, formatPrice, relativeDay } from '../../lib/format'
import type { Business } from '../../lib/types'
import { IconButton } from '../../ui/Button'
import { SectionTitle } from '../../ui/Card'
import { Loading } from '../../ui/Loading'
import { Segmented } from '../../ui/Segmented'
import { EmptyState, ErrorText } from '../../ui/States'
import { BookingRow } from './BookingRow'
import { LoginForm } from './LoginForm'
import { NotifyCard } from './NotifyCard'
import { SettingsForm } from './SettingsForm'
import { useAdmin } from './useAdmin'

const TABS: { id: AgendaFilter; label: string }[] = [
  { id: 'upcoming', label: 'Предстоящие' },
  { id: 'past', label: 'Прошедшие' },
  { id: 'cancelled', label: 'Отменённые' },
]

const EMPTY = {
  upcoming: 'Новых записей пока нет',
  past: 'Здесь появятся прошедшие визиты',
  cancelled: 'Отменённых записей нет',
}

type View = 'bookings' | 'settings'

const VIEWS: { id: View; label: string }[] = [
  { id: 'bookings', label: 'Записи' },
  { id: 'settings', label: 'Настройки' },
]

export function AdminScreen({ business, onBusinessChange }: { business: Business; onBusinessChange: () => void }) {
  const a = useAdmin()
  const [view, setView] = useState<View>('bookings')
  const [tab, setTab] = useState<AgendaFilter>('upcoming')

  if (!a.password) return <LoginForm onLogin={a.login} error={a.loginError} checking={a.checking} />

  const data = a.bookings.data
  const days = data && view === 'bookings' ? agenda(data.bookings, data.now, tab) : []
  const stats = data ? upcomingRevenue(data.bookings, data.now) : null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-2 pt-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-display font-bold tracking-tight">Кабинет</h1>
          <p className="truncate text-body text-fg-2">{business.name}</p>
        </div>
        {view === 'bookings' && <IconButton icon="refresh" label="Обновить" onClick={a.bookings.refresh} />}
        <IconButton icon="logout" label="Выйти" onClick={a.logout} />
      </header>

      <Segmented options={VIEWS} value={view} onChange={setView} />

      {view === 'settings' && <SettingsForm password={a.password} onSaved={onBusinessChange} />}

      {view === 'bookings' && stats && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-card bg-surface p-4">
            <p className="text-caption text-fg-2">Впереди записей</p>
            <p className="pt-1 text-display font-bold tabular-nums">{stats.count}</p>
          </div>
          <div className="rounded-card bg-surface p-4">
            <p className="text-caption text-fg-2">На сумму</p>
            <p className="pt-1 text-display font-bold tabular-nums">{formatPrice(stats.sum, business.currency)}</p>
          </div>
        </div>
      )}

      {view === 'bookings' && (
        <>
          <NotifyCard password={a.password} status={a.notify} />
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </>
      )}

      {view === 'bookings' && !data && a.bookings.loading && <Loading />}
      {view === 'bookings' && a.bookings.error != null && <ErrorText onRetry={a.bookings.refresh}>{errorText(a.bookings.error)}</ErrorText>}
      {view === 'bookings' && data && days.length === 0 && <EmptyState icon="calendar" title={EMPTY[tab]} />}

      {days.map((d) => (
        <section key={d.date} className="animate-rise">
          <SectionTitle>
            {relativeDay(d.date, data!.now.date) ? `${relativeDay(d.date, data!.now.date)}, ` : ''}
            {formatDateLong(d.date)}
          </SectionTitle>
          <ul className="divide-y divide-line overflow-hidden rounded-card bg-surface">
            {d.bookings.map((b) => (
              <BookingRow key={b.id} booking={b} currency={business.currency} onCancel={tab === 'upcoming' ? a.cancel : undefined} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
