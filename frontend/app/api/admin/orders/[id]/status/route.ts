import { backendFetch, relay } from '@/lib/admin-server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.text()
  const response = await backendFetch(`/orders/${id}/status`, { method: 'PATCH', body })
  return relay(response)
}
