import { maskTime } from '../lib/time'

export function TimeInput({
  value,
  onChange,
  label,
  invalid = false,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  invalid?: boolean
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder="00:00"
      maxLength={5}
      value={value}
      onChange={(e) => onChange(maskTime(e.target.value))}
      onFocus={(e) => e.target.select()}
      aria-label={label}
      aria-invalid={invalid}
      className={`h-10 w-[4.5rem] rounded-control bg-surface-2 px-2 text-center text-body text-fg-1 tabular-nums placeholder:text-fg-3 outline-none ring-inset transition focus:ring-2 focus:ring-accent ${invalid ? 'ring-2 ring-danger' : ''}`}
    />
  )
}
