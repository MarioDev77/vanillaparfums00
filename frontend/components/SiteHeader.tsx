'use client'
import { useState } from 'react'
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { useCart } from '@/lib/cart-context'
import { useFavorites } from '@/lib/favorites-context'
import { whatsappLink } from '@/lib/whatsapp'
import CartPanel from '@/components/CartPanel'

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const cart = useCart()
  const { favorites } = useFavorites()

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 lg:px-10">
          <button aria-label="Abrir menu" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          <a href="/" className="flex items-center gap-3"><span className="font-serif text-lg tracking-[0.28em] sm:text-xl">VANILLA PARFUMS</span></a>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-[105px] z-20 w-full flex-col gap-5 border-b border-border bg-background px-5 py-6 text-xs uppercase tracking-[0.18em] lg:static lg:flex lg:w-auto lg:flex-row lg:items-center lg:gap-8 lg:border-0 lg:bg-transparent lg:p-0`}>
            <a href="/catalogo" className="transition-colors hover:text-primary">Catálogo</a>
            <a href="/#colecoes" className="transition-colors hover:text-primary">Coleções</a>
            <a href="/contratipos" className="transition-colors hover:text-primary">O que são contratipos</a>
            <a href="/encontre-seu-perfume" className="transition-colors hover:text-primary">Encontre seu perfume</a>
            <a href="/sobre" className="transition-colors hover:text-primary">Sobre nós</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/catalogo" aria-label="Buscar no catálogo"><Search size={19} strokeWidth={1.5} /></a>
            <a href="/catalogo?favoritos=1" aria-label="Ver favoritos" className="relative">
              <Heart size={19} strokeWidth={1.5} fill={favorites.size > 0 ? 'currentColor' : 'none'} />
              {favorites.size > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] text-accent-foreground">{favorites.size}</span>}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Comprar pelo WhatsApp"><WhatsAppIcon size={18} /></a>
            <button aria-label="Abrir carrinho" onClick={() => cart.openCart()} className="relative">
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cart.count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] text-accent-foreground">{cart.count}</span>}
            </button>
          </div>
        </div>
      </header>
      <CartPanel open={cart.isOpen} onClose={() => cart.closeCart()} />
      <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Falar no WhatsApp" className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-black/20 transition hover:opacity-90">
        <WhatsAppIcon size={26} />
      </a>
    </>
  )
}
