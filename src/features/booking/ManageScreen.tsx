import { api, errorText } from '../../data/api'
import { formatDateLong, formatDuration, formatRange } from '../../lib/format'
import type { ClientState } from '../../lib/manage'
import type { Booking, Business } from '../../lib/types'
import { goBack, navigate } from '../../platform/web/history'
import { Button, IconButton } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { Loading } from '../../ui/Loading'
import { EmptyState, ErrorText } from '../../ui/States'
import { BusinessHeader } from './BusinessHeader'
import { BookingSummary } from './ContactStep'
import { TimeStep } from './TimeStep'
import { useManage } from './useManage'

function StatusNote({ state, booking, business }: { state: ClientState; booking: Booking; business: Business }) {
  const phone = (
    <a href={`tel:${business.phone}`} className="inline-flex items-center gap-1 whitespace-nowrap text-accent">
      <Icon name="phone" size={14} />
      {business.phone}
    </a>
  )
  if (state === 'active') return null
  const text = {
    locked: <>До визита меньше {formatDuration(business.minLeadMinutes)}, поэтому изменить запись можно только по телефону: {phone}</>,
    past: <>Эта запись уже прошла. Будем рады видеть вас снова!</>,
    cancelled:
      booking.cancelledBy === 'master' ? (
        <>Мастер отменил эту запись. Позвоните, чтобы подобрать другое время: {phone}</>
      ) : (
        <>Запись отменена. Время освободилось для других клиентов.</>
      ),
  }[state]
  return (
    <Card>
      <p className="text-body text-fg-2">{text}</p>
    </Card>
  )
}

export function ManageScreen({ business, today, token }: { business: Business; today: string; token: string }) {
  const m = useManage(token)
  const v = m.view
  const rescheduling = m.mode === 'reschedule' && v?.state === 'active'

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-1 bg-bg/85 px-2 py-2 backdrop-blur-xl">
        <IconButton
          icon="chevron-left"
          label={rescheduling ? 'Назад' : 'На главную'}
          onClick={rescheduling ? goBack : () => navigate('/')}
        />
        <div className="min-w-0 flex-1">
          <BusinessHeader business={business} compact />
          <p className="text-caption text-fg-2">{rescheduling ? 'Перенос записи' : 'Ваша запись'}</p>
        </div>
      </div>

      {!v && m.loaded.loading && <Loading />}
      {!v && m.loaded.error != null && (
        <EmptyState icon="calendar" title="Запись не найдена">
          {errorText(m.loaded.error)}
        </EmptyState>
      )}

      {v && !rescheduling && (
        <section className="flex animate-rise flex-col gap-4">
          {m.notice && (
            <p role="status" className="flex items-center justify-center gap-2 rounded-card bg-success/10 p-4 text-body text-success">
              <Icon name="check" size={18} />
              {m.notice}
            </p>
          )}
          <StatusNote state={v.state} booking={v.booking} business={business} />
          <BookingSummary
            business={business}
            serviceName={v.booking.serviceName}
            price={v.booking.price}
            date={v.booking.date}
            start={v.booking.start}
            duration={v.booking.duration}
          />
          {v.state === 'active' && (
            <div className="flex flex-col gap-2">
              <Button size="lg" block icon="calendar" onClick={m.startReschedule}>
                Перенести
              </Button>
              <Button size="lg" block variant="danger" onClick={m.askCancel}>
                Отменить запись
              </Button>
            </div>
          )}
          {(v.state === 'past' || v.state === 'cancelled') && (
            <Button size="lg" block onClick={() => navigate('/')}>
              Записаться снова
            </Button>
          )}
        </section>
      )}

      {v && rescheduling && (
        <>
          <p className="px-1 text-caption text-fg-2">
            Сейчас: {formatDateLong(v.booking.date)}, {formatRange(v.booking.start, v.booking.duration)}. Выберите
            новое время.
          </p>
          <TimeStep
            availKey={m.availKey}
            loadDays={() => api.myAvailability(token)}
            today={today}
            date={m.date}
            notice={m.slotNotice}
            onDate={m.setDate}
            onTime={m.pickTime}
          />
        </>
      )}

      <Dialog open={m.pending !== null} onClose={m.closePending} title="Перенести запись?">
        {m.pending && v && (
          <p className="text-body text-fg-2">
            {v.booking.serviceName}: {formatDateLong(m.pending.date)}, {formatRange(m.pending.start, v.booking.duration)}.
            Мастер получит уведомление.
          </p>
        )}
        {m.error && <ErrorText>{m.error}</ErrorText>}
        <div className="flex flex-col gap-2">
          <Button size="lg" block loading={m.busy} onClick={m.confirmReschedule}>
            Перенести
          </Button>
          <Button variant="secondary" size="lg" block onClick={m.closePending}>
            Выбрать другое время
          </Button>
        </div>
      </Dialog>

      <Dialog open={m.cancelling} onClose={m.closeCancel} title="Отменить запись?">
        <p className="text-body text-fg-2">Время освободится для других клиентов. Мастер получит уведомление.</p>
        {m.error && <ErrorText>{m.error}</ErrorText>}
        <div className="flex flex-col gap-2">
          <Button variant="danger" size="lg" block loading={m.busy} onClick={m.confirmCancel}>
            Отменить запись
          </Button>
          <Button variant="secondary" size="lg" block onClick={m.closeCancel}>
            Оставить
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
