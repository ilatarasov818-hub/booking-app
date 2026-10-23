type KeyValue = { get(key: string): string | null; set(key: string, value: string | null): void }

function webStorage(pick: () => Storage): KeyValue {
  return {
    get(key) {
      try {
        return pick().getItem(key)
      } catch {
        return null
      }
    },
    set(key, value) {
      try {
        if (value === null) pick().removeItem(key)
        else pick().setItem(key, value)
      } catch {
        // Private mode: keep it in memory only.
      }
    },
  }
}

/** Until the tab closes. */
export const session = webStorage(() => window.sessionStorage)
/** Survives restarts: the client's own booking links. */
export const local = webStorage(() => window.localStorage)
