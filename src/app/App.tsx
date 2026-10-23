import { useEffect, useState } from 'react'
import { api, errorText } from '../data/api'
import { useResource } from '../data/hooks'
import { currentPath, onPop } from '../platform/web/history'
import { setBrandColor, setTitle } from '../platform/web/document'
import { AdminScreen } from '../features/admin/AdminScreen'
import { BookingScreen } from '../features/booking/BookingScreen'
import { ManageScreen } from '../features/booking/ManageScreen'
import { Loading } from '../ui/Loading'
import { ErrorText } from '../ui/States'
import { routeFromPath, type Route } from './routes'

export function App() {
  const [route, setRoute] = useState<Route>(() => routeFromPath(currentPath()))
  const biz = useResource('business', api.business)

  useEffect(() => onPop((path) => setRoute(routeFromPath(path))), [])

  useEffect(() => {
    if (!biz.data) return
    setBrandColor(biz.data.business.accent)
    setTitle(`${route.name === 'admin' ? 'Кабинет' : 'Запись'} — ${biz.data.business.name}`)
  }, [biz.data, route.name])

  return (
    <main className="h-full overflow-y-auto overscroll-contain">
      {biz.error != null && (
        <div className="mx-auto max-w-md p-4 pt-[20vh]">
          <ErrorText onRetry={biz.refresh}>{errorText(biz.error)}</ErrorText>
        </div>
      )}
      {!biz.data && !biz.error && <Loading />}
      {biz.data && route.name === 'book' && <BookingScreen business={biz.data.business} today={biz.data.today} />}
      {biz.data && route.name === 'my' && (
        <ManageScreen key={route.token} business={biz.data.business} today={biz.data.today} token={route.token} />
      )}
      {biz.data && route.name === 'admin' && <AdminScreen business={biz.data.business} />}
    </main>
  )
}
