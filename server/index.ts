import 'dotenv/config'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { createApp } from './app'
import { loadBusiness } from './config'
import { createNotifier } from './notifier'
import { Store } from './store'

const port = Number(process.env.PORT ?? 3000)
const adminPassword = process.env.ADMIN_PASSWORD || 'demo'
if (!process.env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD не задан в .env — пароль кабинета: demo')

const app = createApp({
  business: loadBusiness(process.env.CONFIG_PATH ?? 'config.json'),
  store: new Store(process.env.DATA_DIR ?? 'data'),
  notifier: createNotifier(process.env.TELEGRAM_BOT_TOKEN || undefined),
  adminPassword,
})

app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

serve({ fetch: app.fetch, port }, () => {
  console.log(`Запись клиентов: http://localhost:${port}`)
  console.log(`Кабинет мастера: http://localhost:${port}/admin`)
})
