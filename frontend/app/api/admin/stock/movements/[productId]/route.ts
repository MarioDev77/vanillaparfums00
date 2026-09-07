import { backendFetch, relay } from '@/lib/admin-server'

export async function GET(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params
  const response = await backendFetch(`/stock/movements/${productId}`)
  return relay(response)
}
