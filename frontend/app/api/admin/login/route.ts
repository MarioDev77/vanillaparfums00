import { NextResponse } from 'next/server'
import { backendFetch, ADMIN_COOKIE } from '@/lib/admin-server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
  }

  const backendResponse = await backendFetch(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
    null // login não usa token ainda
  )
  const data = await backendResponse.json().catch(() => ({}))

  if (!backendResponse.ok) {
    return NextResponse.json({ error: data.error || 'Não foi possível entrar.' }, { status: backendResponse.status })
  }

  const response = NextResponse.json({ user: data.user })
  response.cookies.set(ADMIN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8h — mesmo prazo do JWT emitido pelo backend
  })
  return response
}
