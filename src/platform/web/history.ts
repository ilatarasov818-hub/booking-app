export function currentPath(): string {
  return window.location.pathname
}

export function pushPath(path: string, state: unknown = null) {
  window.history.pushState(state, '', path)
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
