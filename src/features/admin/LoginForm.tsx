import { useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { TextField } from '../../ui/TextField'

export function LoginForm({ onLogin, error, checking }: { onLogin: (p: string) => void; error: string | null; checking: boolean }) {
  const [value, setValue] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (value) onLogin(value)
  }
  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-sm animate-rise flex-col gap-4 px-4 pt-[20vh]">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface text-accent">
        <Icon name="lock" size={26} />
      </span>
      <h1 className="text-center text-display font-bold tracking-tight">Кабинет мастера</h1>
      <TextField label="Пароль" type="password" autoComplete="current-password" value={value} onChange={setValue} error={error ?? undefined} autoFocus />
      <Button type="submit" size="lg" block loading={checking} disabled={!value}>
        Войти
      </Button>
    </form>
  )
}
