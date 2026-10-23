export type Route = { name: 'book' } | { name: 'admin' } | { name: 'my'; token: string }

export function routeFromPath(path: string): Route {
  const clean = path.replace(/\/+$/, '')
  if (clean === '/admin') return { name: 'admin' }
  const my = clean.match(/^\/my\/([\w-]+)$/)
  return my ? { name: 'my', token: my[1] } : { name: 'book' }
}
