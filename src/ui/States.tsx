import type { ReactNode } from 'react'
import { Button } from './Button'
import { Icon, type IconName } from './Icon'

export function ErrorText({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-card bg-danger/10 p-4 text-center text-body text-danger">
      {children}
      {onRetry && (
        <Button variant="secondary" icon="refresh" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-fg-2">
        <Icon name={icon} size={24} />
      </span>
      <p className="text-body font-semibold">{title}</p>
      {children && <p className="text-caption text-fg-2">{children}</p>}
    </div>
  )
}
