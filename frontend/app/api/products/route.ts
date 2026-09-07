import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { desc } from 'drizzle-orm'

export async function GET() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await request.json()
  if (!body.name || !['masculino', 'feminino', 'cremes'].includes(body.category)) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  const [product] = await db.insert(products).values({ name: body.name, category: body.category, description: body.description ?? '', imageUrl: body.imageUrl ?? '', notes: body.notes ?? '', price: String(body.price ?? 0) }).returning()
  return NextResponse.json(product, { status: 201 })
}
