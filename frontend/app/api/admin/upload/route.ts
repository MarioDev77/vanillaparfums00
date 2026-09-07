import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { getAdminToken } from '@/lib/admin-server'

export async function POST(request: Request) {
  const token = await getAdminToken()
  if (!token) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  if (!file.type.startsWith('image/') || file.size > 5_000_000) {
    return NextResponse.json({ error: 'Envie uma imagem de até 5MB.' }, { status: 400 })
  }

  const blob = await put(`products/${Date.now()}-${file.name}`, file, { access: 'public' })
  return NextResponse.json({ url: blob.url })
}
