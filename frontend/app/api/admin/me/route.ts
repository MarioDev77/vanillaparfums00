import { NextResponse } from 'next/server'
import { backendFetch, ADMIN_COOKIE } from '@/lib/admin-server'

export async function GET() {
  const backendResponse = await backendFetch('/auth/me')
  if (!backendResponse.ok) {
    const response = NextResponse.json({ error: 'Sessão inválida.' }, { status: backendResponse.status })
    response.cookies.delete(ADMIN_COOKIE)
    return response
  }
  const data = await backendResponse.json()
  return NextResponse.json(data)
}
