export function setBrandColor(color: string) {
  document.documentElement.style.setProperty('--brand', color)
}

export function setTitle(title: string) {
  document.title = title
}

export function scrollToTop(el: HTMLElement | null) {
  el?.scrollTo({ top: 0 })
}

/** Bring the first field marked invalid into view and focus it (after the next paint). */
export function focusFirstInvalid() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    el?.focus({ preventScroll: true })
  })
}

export function downloadText(fileName: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
