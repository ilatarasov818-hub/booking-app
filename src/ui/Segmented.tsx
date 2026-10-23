/** iOS-style segmented control for switching tabs. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div role="tablist" className="grid auto-cols-fr grid-flow-col gap-1 rounded-control bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-9 rounded-[0.625rem] text-caption font-semibold transition focus-visible:outline-2 focus-visible:outline-accent ${value === o.id ? 'bg-surface text-fg-1 shadow-sm' : 'text-fg-2'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
