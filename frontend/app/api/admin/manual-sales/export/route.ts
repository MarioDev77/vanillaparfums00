import { backendFetch } from '@/lib/admin-server'

export async function GET() {
  const response = await backendFetch('/manual-sales/export')
  const buffer = await response.arrayBuffer()
  return new Response(buffer, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'text/csv; charset=utf-8',
      'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="relatorio-vendas.csv"',
    },
  })
}
