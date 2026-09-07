import { backendFetch, relay } from '@/lib/admin-server'

export async function GET() {
  // Sem available_only=true: o admin precisa ver também os produtos esgotados/inativos.
  const response = await backendFetch('/products')
  return relay(response)
}

export async function POST(request: Request) {
  const body = await request.text()
  const response = await backendFetch('/products', { method: 'POST', body })
  return relay(response)
}
