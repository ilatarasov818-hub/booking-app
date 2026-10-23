export function currentPath(): string {
  return window.location.pathname
}

export function pushPath(path: string, state: unknown = null) {
  window.history.pushState(state, '', path)
}

/** Go to another screen inside the app (listeners of `onPop` see it like Back/Forward). */
export function navigate(path: string) {
  window.history.pushState(null, '', path)
  window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
}

export function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).href
}

export function pushState(state: unknown) {
  window.history.pushState(state, '')
}

export function replaceState(state: unknown) {
  window.history.replaceState(state, '')
}

export function goBack() {
  window.history.back()
}

/** Subscribe to Back/Forward. Returns unsubscribe. */
export function onPop(handler: (path: string, state: unknown) => void): () => void {
  const listener = (e: PopStateEvent) => handler(window.location.pathname, e.state)
  window.addEventListener('popstate', listener)
  return () => window.removeEventListener('popstate', listener)
}
