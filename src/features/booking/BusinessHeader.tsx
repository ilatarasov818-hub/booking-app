import { Icon } from '../../ui/Icon'
import type { Business } from '../../lib/types'

export function BusinessHeader({ business, compact }: { business: Business; compact: boolean }) {
  const initials = business.name.replace(/[«»"]/g, '').split(/\s+/).slice(-1)[0].slice(0, 1)
  if (compact) {
    return <p className="truncate text-body font-semibold">{business.name}</p>
  }
  return (
    <header className="flex flex-col items-center gap-3 pt-4 pb-2 text-center">
      <span className="flex size-18 items-center justify-center rounded-full bg-accent text-display font-semibold text-on-accent">
        {initials}
      </span>
      <div>
        <h1 className="text-display font-bold tracking-tight">{business.name}</h1>
        <p className="pt-1 text-body text-fg-2">{business.master}</p>
      </div>
      <p className="max-w-xs text-body text-fg-2">{business.tagline}</p>
      <p className="flex items-center gap-1 text-caption text-fg-3">
        <Icon name="pin" size={14} />
        {business.address}
      </p>
    </header>
  )
}
