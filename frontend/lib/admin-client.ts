'use client'

export async function adminFetch(path: string, init: RequestInit = {}) {
  // Não força Content-Type em uploads (FormData) — o navegador define o boundary sozinho.
  const isFormData = init.body instanceof FormData
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: isFormData ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
  })
  if (response.status === 401) {
    window.location.assign('/admin/login')
    throw new Error('Sessão expirada.')
  }
  return response
}

export async function adminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(path, init)
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error || 'Erro ao processar a solicitação.')
  return data as T
}
