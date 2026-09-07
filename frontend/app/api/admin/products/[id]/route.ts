import { backendFetch, relay } from '@/lib/admin-server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.text()
  const response = await backendFetch(`/products/${id}`, { method: 'PUT', body })
  return relay(response)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const response = await backendFetch(`/products/${id}`, { method: 'DELETE' })
  return relay(response)
}
