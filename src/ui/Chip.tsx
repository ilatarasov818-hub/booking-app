import type { ReactNode } from 'react'

export function Chip({
  children,
  selected,
  disabled = false,
  onClick,
  label,
}: {
  children: ReactNode
  selected: boolean
  disabled?: boolean
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
      className={`flex w-full flex-col items-center justify-center rounded-control font-medium tabular-nums transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${selected ? 'bg-accent text-on-accent' : 'bg-surface text-fg-1 hover:bg-surface-2'}`}
    >
      {children}
    </button>
  )
}
