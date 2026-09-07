import { backendFetch, relay } from '@/lib/admin-server'

export async function GET() {
  const response = await backendFetch('/orders/stats/summary')
  return relay(response)
}
