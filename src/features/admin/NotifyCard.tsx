import { useState } from 'react'
import { api, errorText } from '../../data/api'
import type { Resource } from '../../data/hooks'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Icon } from '../../ui/Icon'

export function NotifyCard({
  password,
  status,
}: {
  password: string
  status: Resource<{ configured: boolean; linked: boolean }>
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  if (!status.data) return null
  const { configured, linked } = status.data

  const run = async (action: () => Promise<string>) => {
    setBusy(true)
    setMessage(null)
    try {
      setMessage(await action())
      status.refresh()
    } catch (err) {
      setMessage(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  const link = () => run(async () => (await api.notifyLink(password), 'Готово! Проверьте сообщение от бота.'))
  const test = () =>
    run(async () => ((await api.notifyTest(password)).ok ? 'Отправили проверочное сообщение.' : 'Не удалось отправить.'))

  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${linked ? 'bg-success/15 text-success' : 'bg-surface-2 text-fg-2'}`}>
          <Icon name="send" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold">Уведомления в Telegram</p>
          <p className="pt-0.5 text-caption text-fg-2">
            {linked
              ? 'Включены: новые записи и отмены приходят вам в Telegram.'
              : configured
                ? 'Напишите своему боту /start в Telegram, затем нажмите «Подключить».'
                : 'Выключены. Чтобы включить, добавьте токен бота в настройки сайта (см. инструкцию).'}
          </p>
          {message && <p className="pt-1.5 text-caption text-fg-1">{message}</p>}
        </div>
      </div>
      {configured && (
        <div className="flex justify-end gap-2 pt-3">
          {linked && (
            <Button variant="secondary" onClick={test} disabled={busy}>
              Проверить
            </Button>
          )}
          <Button variant={linked ? 'ghost' : 'primary'} onClick={link} loading={busy}>
            {linked ? 'Переподключить' : 'Подключить'}
          </Button>
        </div>
      )}
    </Card>
  )
}
