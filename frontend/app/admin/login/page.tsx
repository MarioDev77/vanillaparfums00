'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) setError(data.error || 'E-mail ou senha inválidos.')
    else router.push('/admin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5">
      <form onSubmit={submit} className="w-full max-w-md bg-background p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Vanilla Parfums</p>
        <h1 className="mt-4 font-serif text-4xl">Painel administrativo</h1>
        <div className="mt-8 grid gap-4">
          <label className="text-xs uppercase tracking-widest">
            E-mail
            <input name="email" type="email" required autoComplete="username" className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">
            Senha
            <input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <button disabled={loading} className="mt-7 w-full bg-accent p-3 text-xs uppercase tracking-widest text-accent-foreground disabled:opacity-50">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
