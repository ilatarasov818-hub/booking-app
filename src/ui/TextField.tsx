import { useId } from 'react'

export function TextField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  placeholder,
  multiline = false,
  autoFocus = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'tel' | 'password'
  inputMode?: 'text' | 'tel'
  autoComplete?: string
  placeholder?: string
  multiline?: boolean
  autoFocus?: boolean
}) {
  const id = useId()
  const cls = `w-full rounded-control bg-surface px-4 text-body text-fg-1 placeholder:text-fg-3 outline-none ring-inset transition focus:ring-2 focus:ring-accent ${error ? 'ring-2 ring-danger' : 'ring-1 ring-line'}`
  return (
    <div>
      <label htmlFor={id} className="block px-1 pb-1.5 text-caption font-medium text-fg-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          aria-invalid={Boolean(error)}
          className={`${cls} resize-none py-3`}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          className={`${cls} h-12`}
        />
      )}
      {error && <p className="px-1 pt-1.5 text-caption text-danger">{error}</p>}
    </div>
  )
}
