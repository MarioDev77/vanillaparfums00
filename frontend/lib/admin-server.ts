import { cookies } from 'next/headers'

// URL do backend Express (a mesma usada pelo catálogo público em lib/backend-api.ts)
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/$/, '')

export const ADMIN_COOKIE = 'admin_token'

export async function getAdminToken() {
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value ?? null
}

/**
 * Encaminha uma requisição para o backend Express real (`/backend`), anexando
 * o JWT salvo no cookie httpOnly. Usado pelas rotas em app/api/admin/*, que
 * funcionam como um proxy — assim o token nunca fica exposto ao JS do navegador.
 */
export async function backendFetch(path: string, init: RequestInit = {}, token?: string | null) {
  const authToken = token !== undefined ? token : await getAdminToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (authToken) headers.set('Authorization', `Bearer ${authToken}`)

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers, cache: 'no-store' })
  return response
}

/** Repassa a resposta do backend Express como um NextResponse, preservando status e corpo. */
export async function relay(response: Response) {
  const text = await response.text()
  return new Response(text || null, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  })
}
