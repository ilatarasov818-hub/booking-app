import { formatDuration, formatPrice } from '../../lib/format'
import type { Business } from '../../lib/types'
import { CardButton, SectionTitle } from '../../ui/Card'
import { Icon } from '../../ui/Icon'

export function ServiceStep({ business, onChoose }: { business: Business; onChoose: (id: string) => void }) {
  return (
    <section className="animate-rise">
      <SectionTitle>Выберите услугу</SectionTitle>
      <ul className="flex flex-col gap-2">
        {business.services.map((s) => (
          <li key={s.id}>
            <CardButton onClick={() => onChoose(s.id)}>
              <span className="flex items-center gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold">{s.name}</span>
                  {s.description && <span className="block pt-0.5 text-caption text-fg-2">{s.description}</span>}
                  <span className="flex items-center gap-1 pt-2 text-caption text-fg-2">
                    <Icon name="clock" size={14} />
                    {formatDuration(s.duration)}
                  </span>
                </span>
                <span className="text-body font-semibold tabular-nums">{formatPrice(s.price, business.currency)}</span>
                <Icon name="chevron-right" size={18} className="text-fg-3" />
              </span>
            </CardButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
