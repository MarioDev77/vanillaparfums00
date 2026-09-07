import { backendFetch, relay } from '@/lib/admin-server'

export async function GET(request: Request) {
  // Sem available_only=true: o admin precisa ver também os produtos esgotados/inativos.
  // Repassa os filtros (q, category_id, gender, sort) que o backend já suporta.
  const { search } = new URL(request.url)
  const response = await backendFetch(`/products${search}`)
  return relay(response)
}

export async function POST(request: Request) {
  const body = await request.text()
  const response = await backendFetch('/products', { method: 'POST', body })
  return relay(response)
}
