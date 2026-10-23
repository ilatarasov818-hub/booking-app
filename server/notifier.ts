/** Messages to the master in Telegram through the master's own bot. */
export type Notifier = {
  configured: boolean
  send(chatId: string, text: string): Promise<boolean>
  /** Chat id of the latest private message sent to the bot, if any. */
  latestChat(): Promise<string | null>
}

export function createNotifier(token: string | undefined): Notifier {
  const call = async (method: string, body: unknown) => {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    })
    return (await res.json()) as { ok: boolean; result?: unknown; description?: string }
  }

  return {
    configured: Boolean(token),
    async send(chatId, text) {
      if (!token) return false
      try {
        const res = await call('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML' })
        if (!res.ok) console.error('Telegram:', res.description)
        return res.ok
      } catch (err) {
        console.error('Telegram недоступен:', (err as Error).message)
        return false
      }
    },
    async latestChat() {
      if (!token) return null
      const res = await call('getUpdates', { limit: 100 })
      const updates = (res.result ?? []) as { message?: { chat: { id: number; type: string } } }[]
      const chats = updates.map((u) => u.message?.chat).filter((c) => c?.type === 'private')
      const last = chats.at(-1)
      return last ? String(last.id) : null
    },
  }
}
