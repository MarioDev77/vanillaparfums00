'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, MessageCircle, Search, ShoppingBag, X } from 'lucide-react'
import { backendImageUrl, fetchBackendProducts, type BackendProduct } from '@/lib/backend-api'
import { mapBackendProduct, favKey, GENDER_GROUPS, type CatalogProduct } from '@/lib/catalog'
import { useCart } from '@/lib/cart-context'
import { useFavorites } from '@/lib/favorites-context'
import SiteHeader, { whatsappLink } from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'


const slides = [
  { image: '/hero-feminino-goodgirl.png', eyebrow: 'Coleção feminina', title: 'A sua essência\ncomeça aqui.', text: 'Fragrâncias que traduzem presença, delicadeza e personalidade.', cta: 'Descobrir femininos' },
  { image: '/hero-contratipos.png', eyebrow: 'São contratipos', title: 'O luxo que você ama,\nagora ao seu alcance.', text: 'A mesma essência, por um preço justo. Conheça nossa seleção masculina.', cta: 'Explorar masculinos' },
  { image: '/hero-cremes-luiluci.png', eyebrow: 'Ritual de cuidado', title: 'Cuidado que\npermanece.', text: 'Texturas envolventes e fragrâncias que transformam o seu ritual.', cta: 'Ver cremes' },
]

const tabs: { label: string; key: string; products: CatalogProduct[] }[] = [
  { label: 'Perfumes femininos', key: 'femininos', products: [
    { name: 'Vanilla Royale', note: 'Baunilha · Âmbar · Sândalo', price: 'R$ 189,90', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
    { name: 'Lumière', note: 'Jasmim · Íris · Musk', price: 'R$ 169,90', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
    { name: 'Bloom No. 03', note: 'Pera · Peônia · Cedro', price: 'R$ 199,90', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
  ]},
  { label: 'Perfumes masculinos', key: 'masculinos', products: [
    { name: 'Noir Intense', note: 'Couro · Especiarias · Vetiver', price: 'R$ 199,90', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
    { name: 'Élan', note: 'Bergamota · Cedro · Musk', price: 'R$ 179,90', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
    { name: 'The One', note: 'Mandarina · Âmbar · Patchouli', price: 'R$ 189,90', image: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
  ]},
  { label: 'Unissex & cuidados', key: 'unissex', products: [
    { name: 'Creme Hidratante Vanilla', note: 'Baunilha · Manteiga de karité', price: 'R$ 89,90', image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=700&q=85', description: 'Textura envolvente que prolonga a fixação do seu perfume favorito.' },
    { name: 'Essência Unissex Wood', note: 'Cedro · Âmbar · Musk branco', price: 'R$ 179,90', image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&w=700&q=85', description: 'Fragrância contratipo inspirada em grandes clássicos internacionais.' },
  ]},
]

export default function Page() {
  const [slide, setSlide] = useState(0)
  const [activeTab, setActiveTab] = useState(1)
  const [selected, setSelected] = useState<CatalogProduct | null>(null)
  const [search, setSearch] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const cart = useCart()
  const { favorites, toggleFavorite } = useFavorites()
  const { data: backendProducts } = useSWR<BackendProduct[]>('catalog-products', fetchBackendProducts, { revalidateOnFocus: false })
  const current = slides[slide]
  const catalogTabs = useMemo(() => {
    if (!backendProducts?.length) return tabs
    const mapped = GENDER_GROUPS.map((group) => ({
      label: group.label,
      key: group.key,
      products: backendProducts.filter((product) => product.category_gender === group.gender).map(mapBackendProduct),
    }))
    // Evita mostrar uma aba (ex.: "Unissex & cuidados") vazia enquanto não houver produtos cadastrados nela
    const nonEmpty = mapped.filter((group) => group.products.length > 0)
    return nonEmpty.length > 0 ? nonEmpty : mapped
  }, [backendProducts])

  useEffect(() => {
    if (activeTab > catalogTabs.length - 1) setActiveTab(0)
  }, [catalogTabs, activeTab])

  useEffect(() => {
    const timer = setInterval(() => setSlide((value) => (value + 1) % slides.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const hasDetails = selected && (selected.description || selected.top_notes || selected.heart_notes || selected.base_notes)

  const isSearching = search.trim().length > 0

  const allProducts = useMemo(
    () => catalogTabs.flatMap((tab) => tab.products.map((product) => ({ ...product, tabLabel: tab.label }))),
    [catalogTabs]
  )

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase()
    // Favoritos e busca sempre olham o catálogo inteiro; sem eles, mostra só a aba selecionada
    let base = showFavoritesOnly ? allProducts.filter((product) => favorites.has(favKey(product)))
      : term ? allProducts
      : catalogTabs[activeTab]?.products ?? []
    if (term) {
      base = base.filter((product) => [product.name, product.note, product.olfactory_family, product.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)))
    }
    return base
  }, [catalogTabs, allProducts, activeTab, search, showFavoritesOnly, favorites])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section id="inicio" className="relative isolate min-h-[590px] overflow-hidden bg-primary lg:min-h-[640px]">
        {slides.map((item, index) => <Image key={item.image} src={item.image} alt={item.title.replace('\n', ' ')} fill priority={index === 0} className={`object-cover object-center transition-opacity duration-1000 ${index === slide ? 'opacity-100' : 'opacity-0'}`} />)}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/65 to-transparent" />
        <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-6 py-16 lg:min-h-[640px] lg:px-10"><div className="max-w-md text-primary-foreground"><p className="mb-5 text-[11px] uppercase tracking-[0.36em] text-accent">{current.eyebrow}</p><h1 className="whitespace-pre-line font-serif text-5xl leading-[0.98] tracking-tight text-balance md:text-7xl">{current.title}</h1><p className="mt-6 max-w-sm text-sm leading-6 text-primary-foreground/75">{current.text}</p><a href="#colecoes" className="mt-8 inline-flex items-center gap-3 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-transparent hover:text-primary-foreground">{current.cta}<ArrowRight size={15} /></a></div></div>
        <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between lg:left-10 lg:right-10"><div className="flex gap-2">{slides.map((_, index) => <button key={index} aria-label={`Ir para slide ${index + 1}`} onClick={() => setSlide(index)} className={`h-px transition-all ${index === slide ? 'w-12 bg-accent' : 'w-6 bg-primary-foreground/40'}`} />)}</div><div className="flex gap-2"><button aria-label="Slide anterior" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="border border-primary-foreground/30 p-2 text-primary-foreground transition hover:border-accent hover:text-accent"><ChevronLeft size={17} /></button><button aria-label="Próximo slide" onClick={() => setSlide((slide + 1) % slides.length)} className="border border-primary-foreground/30 p-2 text-primary-foreground transition hover:border-accent hover:text-accent"><ChevronRight size={17} /></button></div></div>
      </section>

      <section aria-label="Encontre sua fragrância" className="mx-auto max-w-7xl px-5 pt-20 lg:px-10">
        <div className="mb-10 text-center"><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encontre sua fragrância</p><h2 className="font-serif text-3xl md:text-4xl">Femininos, masculinos e unissex</h2><a href="/encontre-seu-perfume" className="mt-3 inline-block text-xs uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4">Não sabe por onde começar? Faça nosso quiz</a></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {catalogTabs.map((tab, index) => (
            <button key={tab.key} onClick={() => { setActiveTab(index); setShowFavoritesOnly(false); document.getElementById('colecoes')?.scrollIntoView({ behavior: 'smooth' }) }} className="group relative aspect-[4/3] overflow-hidden bg-secondary text-left sm:aspect-[3/4]">
              {tab.products[0] && <Image src={tab.products[0].image} alt={tab.label} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <span className="absolute bottom-5 left-5 font-serif text-xl text-white sm:text-2xl">{tab.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="colecoes" className="mx-auto max-w-7xl px-5 py-24 lg:px-10 lg:py-32">
        <div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encontre a sua assinatura</p><h2 className="font-serif text-4xl md:text-5xl">Escolha por essência</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">Descubra fragrâncias e cuidados pensados para fazer parte da sua história.</p></div>
        <div className="mb-10 flex flex-col gap-6 border-b border-border pb-0 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex gap-9 overflow-x-auto"><div className="flex min-w-max gap-9">{catalogTabs.map((tab, index) => <button key={tab.key} onClick={() => { setActiveTab(index); setShowFavoritesOnly(false) }} className={`relative pb-4 text-xs uppercase tracking-[0.16em] transition-colors ${!showFavoritesOnly && activeTab === index ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{tab.label}{!showFavoritesOnly && activeTab === index && <span className="absolute inset-x-0 -bottom-px h-px bg-primary" />}</button>)}</div></div>
          <label className="relative flex items-center pb-4 sm:w-64">
            <Search size={15} strokeWidth={1.5} className="pointer-events-none absolute left-0 text-muted-foreground" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setShowFavoritesOnly(false) }} type="text" placeholder="Buscar em todo o catálogo" className="w-full border-b border-border bg-transparent py-1 pl-6 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary" />
          </label>
        </div>
        {showFavoritesOnly && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {visibleProducts.length} favorito{visibleProducts.length === 1 ? '' : 's'}
            </p>
            <button onClick={() => setShowFavoritesOnly(false)} className="text-xs uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4">Ver catálogo completo</button>
          </div>
        )}
        {!showFavoritesOnly && isSearching && (
          <p className="mb-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {visibleProducts.length} resultado{visibleProducts.length === 1 ? '' : 's'} para "{search}" em todo o catálogo
          </p>
        )}
        {visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {showFavoritesOnly ? 'Você ainda não favoritou nenhum contratipo.' : `Nenhum contratipo encontrado para "${search}".`}
          </p>
        ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-4">
          {visibleProducts.map((product, index) => (
            <article key={`${product.tabLabel ?? ''}-${product.name}`} className="group cursor-pointer" onClick={() => setSelected(product)}>
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                <span className="absolute left-4 top-4 font-serif text-xs text-primary-foreground/80 mix-blend-difference">{String(index + 1).padStart(2, '0')}</span>
                <button
                  aria-label={favorites.has(favKey(product)) ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(product) }}
                  className={`absolute right-4 top-4 text-primary-foreground mix-blend-difference transition-opacity duration-300 ${favorites.has(favKey(product)) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <Heart size={17} strokeWidth={1.5} fill={favorites.has(favKey(product)) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between gap-2 bg-gradient-to-t from-black/55 to-transparent px-4 py-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {product.code ? (
                    <a href={`/produto/${product.code}`} onClick={(e) => e.stopPropagation()} className="text-[10px] uppercase tracking-[0.18em] text-white underline underline-offset-4">Ver perfume</a>
                  ) : <span className="text-[10px] uppercase tracking-[0.18em] text-white">Ver detalhes</span>}
                  <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white underline underline-offset-4"><MessageCircle size={13} /> Comprar</a>
                </div>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                {(product.best_seller || product.featured || ((isSearching || showFavoritesOnly) && product.tabLabel)) && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {product.best_seller && <span className="bg-accent px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-accent-foreground">Mais vendido</span>}
                    {product.featured && <span className="border border-accent px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-accent-foreground">Destaque</span>}
                    {(isSearching || showFavoritesOnly) && product.tabLabel && <span className="border border-border px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">{product.tabLabel}</span>}
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-serif text-lg sm:text-xl">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.note}</p></div>
                  <p className="whitespace-nowrap text-sm">{product.price}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        )}
      </section>

      <section id="ritual" className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-0 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[640px]">
            <Image src="/hero-cremes.png" alt="Coleção Contratipos" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
          </div>
          <div className="px-6 py-16 sm:px-10 lg:px-16 lg:py-0">
            <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-accent">Entenda o conceito</p>
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">O que é um contratipo?</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-primary-foreground/75">Um contratipo é uma releitura olfativa de um perfume de referência internacional. Nossos perfumistas estudam a composição original — as notas de saída, coração e fundo — e recriam a mesma essência com a maior fidelidade possível, sem usar o nome, o logotipo ou a embalagem da marca original.</p>
            <p className="mt-4 max-w-md text-sm leading-7 text-primary-foreground/75">Não é imitação barata nem falsificação: é a mesma experiência sensorial, com boa fixação e projeção, oferecida por um preço muito mais justo — porque você paga pela fragrância, não pela grife.</p>
            <div className="mt-8 grid max-w-md grid-cols-2 gap-6 border-t border-primary-foreground/20 pt-6 text-center">
              <div><p className="font-serif text-2xl text-accent">{allProducts.length}+</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">Contratipos no catálogo</p></div>
              <div><p className="font-serif text-2xl text-accent">50ml</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">Eau de parfum</p></div>
            </div>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#colecoes" className="inline-flex items-center gap-3 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-transparent hover:text-primary-foreground">Explorar o catálogo <ArrowRight size={15} /></a>
              <a href="/contratipos" className="inline-flex items-center gap-3 border border-primary-foreground/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:border-accent hover:text-accent">Saiba mais sobre contratipos</a>
            </div>
          </div>
        </div>
      </section>
      <section aria-label="Por que Vanilla Parfums" className="mx-auto max-w-7xl px-5 py-24 lg:px-10">
        <div className="mb-14 text-center"><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Por que Vanilla Parfums</p><h2 className="font-serif text-3xl md:text-4xl">O que nos move</h2></div>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Fragrâncias selecionadas', text: 'Uma curadoria pensada para diferentes estilos e personalidades.' },
            { title: 'Preço acessível', text: 'Uma alternativa para quem busca novas experiências olfativas.' },
            { title: 'Identidade própria', text: 'Cada fragrância possui apresentação e identidade próprias.' },
            { title: 'Atendimento', text: 'Conte com nossa equipe para encontrar uma fragrância que combine com você.' },
          ].map((item) => (
            <div key={item.title} className="border-t border-accent pt-5"><h3 className="font-serif text-lg">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-primary px-5 py-20 text-center text-primary-foreground lg:py-28"><p className="text-[10px] uppercase tracking-[0.3em] text-accent">Receba novidades Vanilla</p><h2 className="mt-4 font-serif text-3xl md:text-4xl">Uma essência especial está a caminho.</h2><div className="mx-auto mt-9 flex max-w-md border-b border-primary-foreground/30 transition-colors focus-within:border-accent"><input aria-label="Seu melhor e-mail" type="email" placeholder="Seu melhor e-mail" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-primary-foreground/50" /><button className="px-1 text-[10px] uppercase tracking-[0.18em] text-accent">Assinar</button></div></section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center lg:px-10">
        <h2 className="font-serif text-3xl md:text-4xl">Sua próxima fragrância pode estar aqui.</h2>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Descubra aromas que combinam com a sua presença.</p>
        <a href="#colecoes" className="mt-8 inline-flex items-center gap-3 border border-primary bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-transparent hover:text-primary">Explorar perfumes <ArrowRight size={15} /></a>
      </section>

      <SiteFooter />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8" onClick={() => setSelected(null)}>
          <div className="relative grid max-h-full w-full max-w-4xl grid-cols-1 overflow-y-auto bg-background sm:grid-cols-[1.1fr_1fr]" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar" onClick={() => setSelected(null)} className="absolute right-5 top-5 z-10 text-foreground/70 transition-colors hover:text-foreground"><X size={20} /></button>
            <div className="relative aspect-square sm:aspect-auto">
              <Image src={selected.image} alt={selected.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-5 p-8 sm:p-10">
              {selected.category_name && <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{selected.category_name}</p>}
              <div>
                <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{selected.name}</h2>
                {selected.olfactory_family && <p className="mt-2 text-xs uppercase tracking-[0.16em] text-accent-foreground/80">{selected.olfactory_family}</p>}
              </div>
              <p className="text-lg">{selected.price}</p>

              {selected.description && <p className="text-sm leading-7 text-muted-foreground">{selected.description}</p>}

              {(selected.top_notes || selected.heart_notes || selected.base_notes) && (
                <div className="grid gap-4 border-t border-border pt-5 text-sm">
                  {selected.top_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de saída</p><p className="mt-1">{selected.top_notes}</p></div>}
                  {selected.heart_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de coração</p><p className="mt-1">{selected.heart_notes}</p></div>}
                  {selected.base_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de fundo</p><p className="mt-1">{selected.base_notes}</p></div>}
                </div>
              )}

              {!hasDetails && <p className="text-sm text-muted-foreground">{selected.note}</p>}

              <a href={whatsappLink(selected.name)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 border border-primary bg-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-transparent hover:text-primary"><MessageCircle size={15} /> Comprar pelo WhatsApp</a>
              {selected.code && (
                <button onClick={() => { cart.addItem(selected); cart.openCart() }} className="inline-flex items-center justify-center gap-2 border border-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-primary-foreground"><ShoppingBag size={15} /> Adicionar ao carrinho</button>
              )}
              {selected.code && <a href={`/produto/${selected.code}`} className="text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4">Ver página completa do perfume</a>}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
