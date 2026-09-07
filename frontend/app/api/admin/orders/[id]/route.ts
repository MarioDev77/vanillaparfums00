import { backendFetch, relay } from '@/lib/admin-server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const response = await backendFetch(`/orders/${id}`)
  return relay(response)
}
