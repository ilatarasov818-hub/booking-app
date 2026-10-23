import { useEffect, useState } from 'react'
import { api, ApiError, errorText } from '../../data/api'
import { useResource } from '../../data/hooks'
import { focusFirstInvalid } from '../../platform/web/document'
import { parseSettings, type SettingsErrors } from '../../lib/settings'
import { fromDraft, toDraft, type Draft } from './settingsDraft'

const same = (a: Draft, b: Draft) => JSON.stringify(fromDraft(a)) === JSON.stringify(fromDraft(b))

export function useSettings(password: string, onSaved: () => void) {
  const res = useResource(`${password}:settings`, () => api.settings(password))
  const [saved, setSaved] = useState<Draft | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!res.data) return
    const d = toDraft(res.data.settings)
    setSaved(d)
    setDraft(d)
  }, [res.data])

  useEffect(() => {
    if (Object.keys(errors).length) focusFirstInvalid()
  }, [errors])

  const update = (fn: (d: Draft) => Draft) => {
    setDraft((d) => d && fn(d))
    setMessage(null)
  }

  const dirty = Boolean(draft && saved && !same(draft, saved))

  const save = async () => {
    if (!draft) return
    const body = fromDraft(draft)
    const check = parseSettings(body, () => 'new')
    if (!check.ok) {
      setErrors(check.errors)
      setMessage({ ok: false, text: errorText(new ApiError(400, 'bad_settings')) })
      return
    }
    setSaving(true)
    setErrors({})
    try {
      const { settings } = await api.saveSettings(password, body)
      const d = toDraft(settings)
      setSaved(d)
      setDraft(d)
      setMessage({ ok: true, text: 'Сохранено. Клиенты уже видят изменения.' })
      onSaved()
    } catch (err) {
      if (err instanceof ApiError) setErrors(err.fields)
      setMessage({ ok: false, text: errorText(err) })
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setDraft(saved)
    setErrors({})
    setMessage(null)
  }

  return { res, draft, update, errors, dirty, saving, message, save, reset }
}
