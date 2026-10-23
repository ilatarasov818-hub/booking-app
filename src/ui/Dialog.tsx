import { useEffect, useRef, type ReactNode } from 'react'

/** Modal on the native <dialog>: top layer, focus trap, Escape. Sheet on phones, centred on desktop. */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className="m-0 mt-auto w-full max-w-none rounded-t-card bg-surface p-0 text-fg-1 sm:m-auto sm:max-w-sm sm:rounded-card"
    >
      <div className="flex flex-col gap-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <h2 className="text-title font-semibold">{title}</h2>
        {children}
      </div>
    </dialog>
  )
}
