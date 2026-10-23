export type Route = { name: 'book' } | { name: 'admin' }

export function routeFromPath(path: string): Route {
  return path.replace(/\/+$/, '') === '/admin' ? { name: 'admin' } : { name: 'book' }
}
