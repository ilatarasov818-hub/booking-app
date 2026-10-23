import type { ReactNode } from 'react'

const BASE = 'block w-full rounded-card bg-surface text-left'

export function Card({ children, padded = true }: { children: ReactNode; padded?: boolean }) {
  return <div className={`${BASE} ${padded ? 'p-4' : ''}`}>{children}</div>
}

export function CardButton({
  children,
  onClick,
  selected = false,
}: {
  children: ReactNode
  onClick: () => void
  selected?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${BASE} p-4 ring-inset transition active:scale-[0.97] hover:ring-1 hover:ring-line focus-visible:outline-2 focus-visible:outline-accent ${selected ? 'ring-2 ring-accent hover:ring-2 hover:ring-accent' : ''}`}
    >
      {children}
    </button>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="px-1 pb-2 text-caption font-semibold tracking-wide text-fg-2 uppercase">{children}</h2>
}
