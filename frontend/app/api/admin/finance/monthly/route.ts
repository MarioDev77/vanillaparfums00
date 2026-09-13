import { backendFetch, relay } from '@/lib/admin-server'

export async function GET(request: Request) {
  const { search } = new URL(request.url)
  const response = await backendFetch(`/finance/monthly${search}`)
  return relay(response)
}
