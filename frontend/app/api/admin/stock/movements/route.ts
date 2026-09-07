import { backendFetch, relay } from '@/lib/admin-server'

export async function POST(request: Request) {
  const body = await request.text()
  const response = await backendFetch('/stock/movements', { method: 'POST', body })
  return relay(response)
}
