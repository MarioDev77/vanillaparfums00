'use client'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function AdminLogin() {
  const router = useRouter()
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const form = new FormData(event.currentTarget)
    const result = await authClient.signIn.email({ email: String(form.get('email')), password: String(form.get('password')) })
    if (result.error) setError('E-mail ou senha inválidos.')
    else router.push('/admin')
  }
  return <main className="flex min-h-screen items-center justify-center bg-primary px-5"><form onSubmit={submit} className="w-full max-w-md bg-background p-8"><p className="text-xs uppercase tracking-[0.3em] text-accent">Contratipos</p><h1 className="mt-4 font-serif text-4xl">Painel administrativo</h1><div className="mt-8 grid gap-4"><label className="text-xs uppercase tracking-widest">E-mail<input name="email" type="email" required className="mt-2 w-full border border-border bg-transparent p-3" /></label><label className="text-xs uppercase tracking-widest">Senha<input name="password" type="password" required className="mt-2 w-full border border-border bg-transparent p-3" /></label></div>{error && <p className="mt-4 text-sm text-red-700">{error}</p>}<button className="mt-7 w-full bg-accent p-3 text-xs uppercase tracking-widest text-accent-foreground">Entrar</button></form></main>
}
