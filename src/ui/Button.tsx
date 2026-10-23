import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Loading'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-110',
  secondary: 'bg-surface-2 text-fg-1 hover:brightness-95 dark:hover:brightness-125',
  ghost: 'text-accent hover:bg-surface-2',
  danger: 'text-danger hover:bg-danger/10',
}

const SIZES = {
  md: 'h-10 px-4 text-body gap-1.5',
  lg: 'h-13 px-5 text-body font-semibold gap-2',
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  loading = false,
  disabled = false,
  type = 'button',
  label,
}: {
  children?: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: keyof typeof SIZES
  icon?: IconName
  block?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  label?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={label}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-control font-medium transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''}`}
    >
      {loading ? <Spinner /> : icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  )
}

export function IconButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full text-fg-2 transition hover:bg-surface-2 hover:text-fg-1 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-accent"
    >
      <Icon name={icon} size={22} />
    </button>
  )
}
