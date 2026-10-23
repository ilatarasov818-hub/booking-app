import { useCallback, useEffect, useRef, useState } from 'react'

export type Resource<T> = {
  data: T | null
  error: unknown
  loading: boolean
  refresh: () => void
}

/** Load once (and again whenever `key` changes); optionally poll every `intervalMs`. */
export function useResource<T>(key: string | null, load: () => Promise<T>, intervalMs?: number): Resource<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(key !== null)
  const loadRef = useRef(load)
  loadRef.current = load
  const seq = useRef(0)

  const refresh = useCallback(() => {
    if (key === null) return
    const id = ++seq.current
    setLoading(true)
    loadRef.current().then(
      (value) => {
        if (id !== seq.current) return
        setData(value)
        setError(null)
        setLoading(false)
      },
      (err) => {
        if (id !== seq.current) return
        setError(err)
        setLoading(false)
      },
    )
  }, [key])

  useEffect(() => {
    setData(null)
    refresh()
    if (key === null || !intervalMs) return
    const timer = setInterval(refresh, intervalMs)
    return () => clearInterval(timer)
  }, [key, intervalMs, refresh])

  return { data, error, loading, refresh }
}
