'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Heart, MessageCircle, ShoppingBag } from 'lucide-react'
import { fetchBackendProductByCode, type BackendProduct } from '@/lib/backend-api'
import { mapBackendProduct, favKey, type CatalogProduct } from '@/lib/catalog'
import { useFavorites } from '@/lib/favorites-context'
import { useCart } from '@/lib/cart-context'
import { whatsappLink } from '@/components/SiteHeader'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export default function ProdutoPage() {
  const params = useParams<{ code: string }>()
  const [product, setProduct] = useState<CatalogProduct | null | undefined>(undefined)
  const { favorites, toggleFavorite } = useFavorites()
  const cart = useCart()

  useEffect(() => {
    let active = true
    fetchBackendProductByCode(params.code).then((result: BackendProduct | null) => {
      if (active) setProduct(result ? mapBackendProduct(result) : null)
    }).catch(() => { if (active) setProduct(null) })
    return () => { active = false }
  }, [params.code])

  if (product === undefined) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <p className="py-24 text-center text-sm text-muted-foreground">Carregando perfume...</p>
        <SiteFooter />
      </main>
    )
  }

  if (product === null) {
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

  const isFav = favorites.has(favKey(product))
  const hasPyramid = product.top_notes || product.heart_notes || product.base_notes

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-14 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-20">
        <div className="relative aspect-square overflow-hidden bg-secondary lg:aspect-[4/5]">
          <Image src={product.image} alt={product.name} fill className="object-cover" priority />
          <button
            aria-label={isFav ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            onClick={() => toggleFavorite(product)}
            className="absolute right-5 top-5 text-primary-foreground mix-blend-difference"
          >
            <Heart size={22} strokeWidth={1.5} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div>
          {product.category_name && <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{product.category_name}</p>}
          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>
          {product.olfactory_family && <p className="mt-3 text-xs uppercase tracking-[0.16em] text-accent-foreground/80">{product.olfactory_family}</p>}
          <p className="mt-6 text-2xl">{product.price}</p>
          {product.size_ml && <p className="mt-1 text-xs text-muted-foreground">{product.size_ml}ml · Eau de Parfum</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 border border-primary bg-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-transparent hover:text-primary"><MessageCircle size={15} /> Comprar pelo WhatsApp</a>
            <button onClick={() => { cart.addItem(product); cart.openCart() }} className="flex flex-1 items-center justify-center gap-2 border border-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"><ShoppingBag size={15} /> Adicionar ao carrinho</button>
          </div>

          {product.description && <p className="mt-8 text-sm leading-7 text-muted-foreground">{product.description}</p>}

          {hasPyramid && (
            <div className="mt-10 border-t border-border pt-8">
              <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pirâmide olfativa</p>
              <div className="grid gap-5 text-sm">
                {product.top_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de saída</p><p className="mt-1">{product.top_notes}</p></div>}
                {product.heart_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de coração</p><p className="mt-1">{product.heart_notes}</p></div>}
                {product.base_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de fundo</p><p className="mt-1">{product.base_notes}</p></div>}
              </div>
            </div>
          )}

          {(product.fixation || product.projection) && (
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
              {product.fixation && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fixação</p><p className="mt-1">{product.fixation}</p></div>}
              {product.projection && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Projeção</p><p className="mt-1">{product.projection}</p></div>}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
