export function setBrandColor(color: string) {
  document.documentElement.style.setProperty('--brand', color)
}

export function setTitle(title: string) {
  document.title = title
}

export function scrollToTop(el: HTMLElement | null) {
  el?.scrollTo({ top: 0 })
}

export function downloadText(fileName: string, text: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
