export function Spinner() {
  return <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
}

export function Loading({ label = 'Загрузка…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-body text-fg-2">
      <Spinner />
      {label}
    </div>
  )
}
