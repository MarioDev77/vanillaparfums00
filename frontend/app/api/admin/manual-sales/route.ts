import { backendFetch, relay } from '@/lib/admin-server'

export async function GET() {
  const response = await backendFetch('/manual-sales')
  return relay(response)
}

export async function POST(request: Request) {
  const body = await request.text()
  const response = await backendFetch('/manual-sales', { method: 'POST', body })
  return relay(response)
}
