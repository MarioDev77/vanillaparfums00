import type { Metadata } from 'next'
import { fetchBackendProductByCode } from '@/lib/backend-api'
import { mapBackendProduct } from '@/lib/catalog'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ProductDetail from '@/components/ProductDetail'

type Props = { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const backendProduct = await fetchBackendProductByCode(code)
  if (!backendProduct) return { title: 'Perfume não encontrado | Vanilla Parfums' }

  const product = mapBackendProduct(backendProduct)
  const title = `${product.name} | Vanilla Parfums`
  const description = product.description || `Contratipo ${product.name}${product.olfactory_family ? ` — ${product.olfactory_family}` : ''}. Disponível na Vanilla Parfums, ${product.price}.`

  return {
    title,
    description,
    openGraph: { title, description, images: product.image ? [{ url: product.image }] : undefined },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const { code } = await params
  const backendProduct = await fetchBackendProductByCode(code)

  if (!backendProduct) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">Este perfume não foi encontrado ou não está mais disponível.</p>
          <a href="/catalogo" className="mt-4 inline-block text-xs uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4">Ver catálogo completo</a>
        </div>
        <SiteFooter />
      </main>
    )
  }

  const product = mapBackendProduct(backendProduct)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: product.image || undefined,
    category: product.category_name || undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: Number(product.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || undefined,
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <ProductDetail product={product} />
      <SiteFooter />
    </main>
  )
}
