import { backendFetch } from '@/lib/admin-server'

export async function GET(request: Request) {
  const { search } = new URL(request.url)
  const response = await backendFetch(`/finance/export/pdf${search}`)
  const buffer = await response.arrayBuffer()
  return new Response(buffer, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
      'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="relatorio-financeiro.pdf"',
    },
  })
}
