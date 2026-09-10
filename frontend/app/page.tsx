'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Menu, MessageCircle, Search, X } from 'lucide-react'
import { backendImageUrl, fetchBackendProducts, type BackendProduct } from '@/lib/backend-api'

const whatsappLink = (productName?: string) => `https://wa.me/?text=${encodeURIComponent(productName ? `Olá! Tenho interesse no contratipo ${productName}.` : 'Olá! Gostaria de conhecer os contratipos disponíveis.')}`

type CatalogProduct = {
  name: string
  note: string
  price: string
  image: string
  description?: string
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  olfactory_family?: string
  category_name?: string
}

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
]

export default function Page() {
  const [slide, setSlide] = useState(0)
  const [activeTab, setActiveTab] = useState(1)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selected, setSelected] = useState<CatalogProduct | null>(null)
  const { data: backendProducts } = useSWR<BackendProduct[]>('catalog-products', fetchBackendProducts, { revalidateOnFocus: false })
  const current = slides[slide]
  const catalogTabs = useMemo(() => {
    if (!backendProducts?.length) return tabs
    const groups = [
      { label: 'Perfumes femininos', key: 'femininos', match: (product: BackendProduct) => product.category_gender === 'feminino' },
      { label: 'Perfumes masculinos', key: 'masculinos', match: (product: BackendProduct) => product.category_gender === 'masculino' },
    ]
    return groups.map((group) => ({
      label: group.label,
      key: group.key,
      products: backendProducts.filter(group.match).map((product) => ({
        name: product.name,
        note: product.olfactory_family || [product.top_notes, product.heart_notes, product.base_notes].filter(Boolean).join(' · ') || product.description || 'Fragrância contratipo',
        price: `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`,
        image: backendImageUrl(product.image_url),
        description: product.description,
        top_notes: product.top_notes,
        heart_notes: product.heart_notes,
        base_notes: product.base_notes,
        olfactory_family: product.olfactory_family,
        category_name: product.category_name,
      })),
    }))
  }, [backendProducts])

  useEffect(() => {
    const timer = setInterval(() => setSlide((value) => (value + 1) % slides.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const hasDetails = selected && (selected.description || selected.top_notes || selected.heart_notes || selected.base_notes)

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 lg:px-10">
          <button aria-label="Abrir menu" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          <a href="#inicio" className="flex items-center gap-3"><span className="font-serif text-lg tracking-[0.28em] sm:text-xl">CONTRATIPOS</span></a>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-[105px] z-20 w-full flex-col gap-5 border-b border-border bg-background px-5 py-6 text-xs uppercase tracking-[0.18em] lg:static lg:flex lg:w-auto lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}>
            <a href="#colecoes" className="transition-colors hover:text-primary">Coleções</a><a href="#mais-amados" className="transition-colors hover:text-primary">Mais amados</a><a href="#ritual" className="transition-colors hover:text-primary">O ritual Contratipos</a>
          </nav>
          <div className="flex items-center gap-4"><button aria-label="Buscar"><Search size={19} strokeWidth={1.5} /></button><a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Comprar pelo WhatsApp" className="text-accent"><MessageCircle size={20} strokeWidth={1.5} /></a></div>
        </div>
      </header>

      <section id="inicio" className="relative isolate min-h-[590px] overflow-hidden bg-primary lg:min-h-[640px]">
        {slides.map((item, index) => <Image key={item.image} src={item.image} alt={item.title.replace('\n', ' ')} fill priority={index === 0} className={`object-cover object-center transition-opacity duration-1000 ${index === slide ? 'opacity-100' : 'opacity-0'}`} />)}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/65 to-transparent" />
        <div className="relative mx-auto flex min-h-[590px] max-w-7xl items-center px-6 py-16 lg:min-h-[640px] lg:px-10"><div className="max-w-md text-primary-foreground"><p className="mb-5 text-[11px] uppercase tracking-[0.36em] text-accent">{current.eyebrow}</p><h1 className="whitespace-pre-line font-serif text-5xl leading-[0.98] tracking-tight text-balance md:text-7xl">{current.title}</h1><p className="mt-6 max-w-sm text-sm leading-6 text-primary-foreground/75">{current.text}</p><a href="#colecoes" className="mt-8 inline-flex items-center gap-3 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-transparent hover:text-primary-foreground">{current.cta}<ArrowRight size={15} /></a></div></div>
        <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between lg:left-10 lg:right-10"><div className="flex gap-2">{slides.map((_, index) => <button key={index} aria-label={`Ir para slide ${index + 1}`} onClick={() => setSlide(index)} className={`h-px transition-all ${index === slide ? 'w-12 bg-accent' : 'w-6 bg-primary-foreground/40'}`} />)}</div><div className="flex gap-2"><button aria-label="Slide anterior" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="border border-primary-foreground/30 p-2 text-primary-foreground transition hover:border-accent hover:text-accent"><ChevronLeft size={17} /></button><button aria-label="Próximo slide" onClick={() => setSlide((slide + 1) % slides.length)} className="border border-primary-foreground/30 p-2 text-primary-foreground transition hover:border-accent hover:text-accent"><ChevronRight size={17} /></button></div></div>
      </section>

      <section id="colecoes" className="mx-auto max-w-7xl px-5 py-20 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encontre a sua assinatura</p><h2 className="font-serif text-4xl md:text-5xl">Escolha por essência</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">Descubra fragrâncias e cuidados pensados para fazer parte da sua história.</p></div>
        <div className="mb-10 flex gap-7 overflow-x-auto border-b border-border"><div className="flex min-w-max gap-7">{catalogTabs.map((tab, index) => <button key={tab.key} onClick={() => setActiveTab(index)} className={`border-b-2 pb-4 text-xs uppercase tracking-[0.16em] transition ${activeTab === index ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>)}</div></div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          {catalogTabs[activeTab].products.map((product) => (
            <article key={product.name} className="group cursor-pointer" onClick={() => setSelected(product)}>
              <div className="relative aspect-square overflow-hidden bg-secondary">
                <Image src={product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
                <button aria-label={`Favoritar ${product.name}`} onClick={(e) => e.stopPropagation()} className="absolute right-4 top-4 bg-background/80 p-2 backdrop-blur"><Heart size={17} strokeWidth={1.5} /></button>
                <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 translate-y-full bg-primary py-3 text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition duration-300 group-hover:translate-y-0"><MessageCircle size={14} /> Comprar pelo WhatsApp</a>
              </div>
              <div className="flex items-start justify-between gap-3 pt-4">
                <div><h3 className="font-serif text-base sm:text-xl">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.note}</p></div>
                <p className="whitespace-nowrap text-sm font-medium">{product.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="ritual" className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-0 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-[560px]">
            <Image src="/hero-cremes.png" alt="Coleção Contratipos" fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
          </div>
          <div className="px-6 py-16 sm:px-10 lg:px-16 lg:py-0">
            <p className="mb-4 text-[10px] uppercase tracking-[0.36em] text-accent">O ritual Contratipos</p>
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">A mesma essência,<br />um preço justo.</h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-primary-foreground/75">Selecionamos as fragrâncias mais desejadas do mundo e recriamos cada uma com fidelidade — nas notas, na fixação e na projeção — para que você viva a mesma experiência olfativa por um valor justo.</p>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-primary-foreground/20 pt-6 text-center">
              <div><p className="font-serif text-2xl text-accent">36+</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">Contratipos</p></div>
              <div><p className="font-serif text-2xl text-accent">100%</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">Fidelidade olfativa</p></div>
              <div><p className="font-serif text-2xl text-accent">50ml</p><p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-primary-foreground/60">Eau de parfum</p></div>
            </div>
            <a href="#colecoes" className="mt-9 inline-flex items-center gap-3 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-transparent hover:text-primary-foreground">Explorar o catálogo <ArrowRight size={15} /></a>
          </div>
        </div>
      </section>
      <section className="bg-primary px-5 py-16 text-center text-primary-foreground"><p className="text-[10px] uppercase tracking-[0.3em] text-accent">Receba novidades Vanilla</p><h2 className="mt-4 font-serif text-3xl md:text-4xl">Uma essência especial está a caminho.</h2><div className="mx-auto mt-8 flex max-w-md border-b border-primary-foreground/40"><input aria-label="Seu melhor e-mail" type="email" placeholder="Seu melhor e-mail" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-primary-foreground/50" /><button className="px-1 text-[10px] uppercase tracking-[0.18em] text-accent">Assinar</button></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 Contratipos</span><span>A mesma essência. Um preço justo.</span><a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-accent"><MessageCircle size={14} /> Comprar pelo WhatsApp</a></footer>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={() => setSelected(null)}>
          <div className="relative grid max-h-full w-full max-w-3xl grid-cols-1 overflow-y-auto bg-background sm:grid-cols-2" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Fechar" onClick={() => setSelected(null)} className="absolute right-4 top-4 z-10 bg-background/80 p-2 backdrop-blur"><X size={18} /></button>
            <div className="relative aspect-square sm:aspect-auto">
              <Image src={selected.image} alt={selected.name} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-4 p-6 sm:p-8">
              {selected.category_name && <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{selected.category_name}</p>}
              <h2 className="font-serif text-3xl">{selected.name}</h2>
              <p className="text-lg font-medium">{selected.price}</p>
              {selected.olfactory_family && <p className="text-xs uppercase tracking-[0.16em] text-accent">{selected.olfactory_family}</p>}

              {selected.description && <p className="text-sm leading-6 text-muted-foreground">{selected.description}</p>}

              {(selected.top_notes || selected.heart_notes || selected.base_notes) && (
                <div className="grid gap-3 border-t border-border pt-4 text-sm">
                  {selected.top_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de saída</p><p className="mt-1">{selected.top_notes}</p></div>}
                  {selected.heart_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de coração</p><p className="mt-1">{selected.heart_notes}</p></div>}
                  {selected.base_notes && <div><p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Notas de fundo</p><p className="mt-1">{selected.base_notes}</p></div>}
                </div>
              )}

              {!hasDetails && <p className="text-sm text-muted-foreground">{selected.note}</p>}

              <a href={whatsappLink(selected.name)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 bg-primary py-3 text-[11px] uppercase tracking-[0.2em] text-primary-foreground transition hover:opacity-90"><MessageCircle size={15} /> Comprar pelo WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
