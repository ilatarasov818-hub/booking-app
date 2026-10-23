import { useEffect, useState } from 'react'
import { api, ApiError, errorText } from '../../data/api'
import { useResource } from '../../data/hooks'
import { session } from '../../platform/web/storage'

const KEY = 'admin-password'

export function useAdmin() {
  const [password, setPassword] = useState<string | null>(() => session.get(KEY))
  const [loginError, setLoginError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const bookings = useResource(password, () => api.adminBookings(password!), 30_000)
  const notify = useResource(password && `${password}:notify`, () => api.notifyStatus(password!))

  const expired = bookings.error instanceof ApiError && bookings.error.code === 'unauthorized'
  useEffect(() => {
    if (!expired) return
    session.set(KEY, null)
    setPassword(null)
  }, [expired])

  const login = async (value: string) => {
    setChecking(true)
    setLoginError(null)
    try {
      await api.adminBookings(value)
      session.set(KEY, value)
      setPassword(value)
    } catch (err) {
      setLoginError(errorText(err))
    } finally {
      setChecking(false)
    }
  }

  const logout = () => {
    session.set(KEY, null)
    setPassword(null)
  }

  const cancel = async (id: string) => {
    await api.cancel(password!, id)
    bookings.refresh()
  }

  return { password, login, logout, loginError, checking, bookings, notify, cancel }
}
