'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Heart, Link2, Share2, ShoppingBag } from 'lucide-react'
import { favKey, type CatalogProduct } from '@/lib/catalog'
import { useFavorites } from '@/lib/favorites-context'
import { useCart } from '@/lib/cart-context'
import { whatsappLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'

export default function ProductDetail({ product }: { product: CatalogProduct }) {
  const { favorites, toggleFavorite } = useFavorites()
  const cart = useCart()
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const shareBoxRef = useRef<HTMLDivElement>(null)
  const isFav = favorites.has(favKey(product))
  const hasPyramid = product.top_notes || product.heart_notes || product.base_notes

  // navigator só existe no cliente; checar depois de montar evita mismatch de hidratação
  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  // fecha o menu ao clicar fora dele
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (shareBoxRef.current && !shareBoxRef.current.contains(e.target as Node)) setShareOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const shareText = `Olha esse perfume: ${product.name} da Vanilla Parfums.`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShareOpen(false)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: product.name, text: shareText, url: shareUrl })
      setShareOpen(false)
    } catch {
      // painel nativo do sistema falhou ou foi cancelado — deixa o menu aberto
      // pra pessoa usar WhatsApp ou copiar o link normalmente
    }
  }

  return (
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
          <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 border border-primary bg-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-transparent hover:text-primary"><WhatsAppIcon size={15} /> Comprar pelo WhatsApp</a>
          <button onClick={() => { cart.addItem(product); cart.openCart() }} className="flex flex-1 items-center justify-center gap-2 border border-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"><ShoppingBag size={15} /> Adicionar ao carrinho</button>
        </div>

        <div ref={shareBoxRef} className="relative mt-4 inline-block">
          <button
            onClick={() => setShareOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={shareOpen}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <Share2 size={15} /> {copied ? 'Link copiado' : 'Compartilhar perfume'}
          </button>

          {shareOpen && (
            <div role="menu" className="absolute left-0 top-full z-20 mt-2 w-48 border border-border bg-background py-1 shadow-lg">
              <a
                href={`/api/whatsapp?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setShareOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs text-foreground transition hover:bg-secondary"
              >
                <WhatsAppIcon size={14} /> WhatsApp
              </a>
              <button
                onClick={copyLink}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-foreground transition hover:bg-secondary"
              >
                <Link2 size={14} /> Copiar link
              </button>
              {canNativeShare && (
                <button
                  onClick={nativeShare}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-foreground transition hover:bg-secondary"
                >
                  <Share2 size={14} /> Mais opções
                </button>
              )}
            </div>
          )}
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

        {(product.fixation || product.projection || product.occasion || product.intensity) && (
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
            {product.fixation && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Fixação</p><p className="mt-1">{product.fixation}</p></div>}
            {product.projection && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Projeção</p><p className="mt-1">{product.projection}</p></div>}
            {product.intensity && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Intensidade</p><p className="mt-1 capitalize">{product.intensity}</p></div>}
            {product.occasion && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ocasião</p><p className="mt-1">{product.occasion}</p></div>}
          </div>
        )}
      </div>
    </section>
  )
}
