'use client'

import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Menu, MessageCircle, Search, X } from 'lucide-react'
import { backendImageUrl, fetchBackendProducts, type BackendProduct } from '@/lib/backend-api'

const whatsappLink = (productName?: string) => `https://wa.me/?text=${encodeURIComponent(productName ? `Olá! Tenho interesse no contratipo ${productName}.` : 'Olá! Gostaria de conhecer os contratipos disponíveis.')}`

const slides = [
  { image: '/hero-feminino-goodgirl.png', eyebrow: 'Coleção feminina', title: 'A sua essência\ncomeça aqui.', text: 'Fragrâncias que traduzem presença, delicadeza e personalidade.', cta: 'Descobrir femininos' },
  { image: '/hero-contratipos.png', eyebrow: 'São contratipos', title: 'O luxo que você ama,\nagora ao seu alcance.', text: 'A mesma essência, por um preço justo. Conheça nossa seleção masculina.', cta: 'Explorar masculinos' },
  { image: '/hero-cremes-luiluci.png', eyebrow: 'Ritual de cuidado', title: 'Cuidado que\npermanece.', text: 'Texturas envolventes e fragrâncias que transformam o seu ritual.', cta: 'Ver cremes' },
]

type CatalogProduct = {
  name: string
  note: string
  price: string
  image: string
  inspiredBy?: string
  family?: string
  description?: string
  top?: string
  heart?: string
  base?: string
}

const tabs: { label: string; key: string; products: CatalogProduct[] }[] = [
  { label: 'Perfumes femininos', key: 'femininos', products: [
    { name: 'Vanilla Royale', note: 'Baunilha · Âmbar · Sândalo', price: 'R$ 189,90', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85' },
    { name: 'Lumière', note: 'Jasmim · Íris · Musk', price: 'R$ 169,90', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85' },
    { name: 'Bloom No. 03', note: 'Pera · Peônia · Cedro', price: 'R$ 199,90', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=85' },
  ]},
  // Catálogo real em estoque (LC01–LC13) — mesmos produtos do seed backend/src/migrations/seedCatalogFinal.js
  { label: 'Perfumes masculinos', key: 'masculinos', products: [
    { name: 'K', inspiredBy: 'K — Dolce & Gabbana', family: 'Amadeirado Aromático', note: 'Toranja · Sálvia · Patchouli', price: 'R$ 69,90', image: '/products/LC01-K.jpg',
      description: 'Contratipo intenso e especiado, com frescor cítrico na abertura e uma base amadeirada quente.',
      top: 'Toranja, Zimbro, Cardamomo', heart: 'Sálvia, Folha de Gerânio', base: 'Patchouli, Fava Tonka, Vetiver' },
    { name: 'Sauvage Elixir', inspiredBy: 'Sauvage Elixir — Dior', family: 'Oriental Especiado', note: 'Canela · Lavanda · Baunilha', price: 'R$ 69,90', image: '/products/LC02-SauvageElixir.jpg',
      description: 'Versão concentrada e envolvente, com abertura picante e fundo adocicado e amadeirado. Alta fixação.',
      top: 'Canela, Cardamomo, Noz-moscada, Anis-estrelado', heart: 'Lavanda', base: 'Amberwood, Sândalo, Baunilha, Fava Tonka' },
    { name: 'Bleu', inspiredBy: 'Bleu de Chanel', family: 'Amadeirado Aromático', note: 'Toranja · Jasmim · Incenso', price: 'R$ 69,90', image: '/products/LC03-Bleu.jpg',
      description: 'Cítrico e vibrante na abertura, com coração especiado e base amadeirada levemente incensada.',
      top: 'Toranja, Limão-siciliano, Hortelã, Pimenta-rosa', heart: 'Gengibre, Noz-moscada, Jasmim', base: 'Incenso, Vetiver, Cedro, Sândalo, Almíscar branco' },
    { name: 'Kouros', inspiredBy: 'Kouros — Yves Saint Laurent', family: 'Oriental Amadeirado', note: 'Coentro · Cravo · Couro', price: 'R$ 69,90', image: '/products/LC04-Kouros.jpg',
      description: 'Caráter forte e clássico, com abertura herbal marcante e base âmbar e almiscarada.',
      top: 'Artemísia, Coentro, Sálvia esclareia', heart: 'Cravo, Íris, Jasmim', base: 'Mel, Âmbar, Musgo de carvalho, Couro, Almíscar' },
    { name: 'Silver', inspiredBy: 'Silver Scent — Jacques Bogart', family: 'Fougère Oriental Amadeirado', note: 'Limão · Cardamomo · Fava Tonka', price: 'R$ 69,90', image: '/products/LC05-Silver.jpg',
      description: 'Contrastes de frescor e calor: cítrico com flor de laranjeira e uma base amadeirada envolvente.',
      top: 'Limão, Laranja amarga, Flor de laranjeira', heart: 'Noz-moscada, Alecrim, Coentro, Cardamomo, Gerânio, Lavanda', base: 'Madeira de teca, Vetiver, Fava tonka, Líquen' },
    { name: 'Beau', inspiredBy: '"Le Beau" — Jean Paul Gaultier', family: 'Amadeirado Aromático', note: 'Hortelã · Cedro · Coco', price: 'R$ 69,90', image: '/products/LC06-Beau.jpg',
      description: 'Fresco e sensual, com abertura mentolada e fundo quente de madeiras adocicadas.',
      top: 'Mandarina verde, Hortelã, Bergamota', heart: 'Sálvia, Folha de cedro', base: 'Madeira de coco, Fava tonka, Ambroxan' },
    { name: '212 Sexy', inspiredBy: '212 Men Sexy — Carolina Herrera', family: 'Oriental Especiado', note: 'Cardamomo · Tabaco · Almíscar', price: 'R$ 69,90', image: '/products/LC07-212Sexy.jpg',
      description: 'Especiarias quentes na abertura, coração de tabaco e base amadeirada e adocicada.',
      top: 'Cardamomo, Pimenta-preta', heart: 'Folha de tabaco, Cacau', base: 'Fava tonka, Almíscar, Madeira loira' },
    { name: '212 NYC', inspiredBy: '212 Men NYC — Carolina Herrera', family: 'Cítrico Amadeirado', note: 'Toranja · Gengibre · Almíscar', price: 'R$ 69,90', image: '/products/LC08-212NYC.jpg',
      description: 'Clássico urbano e moderno: cítrico, levemente especiado, com base limpa de madeiras e almíscar.',
      top: 'Toranja, Bergamota', heart: 'Gengibre, Sálvia', base: 'Almíscar, Patchouli, Madeiras' },
    { name: 'Scuderia Black', inspiredBy: 'Scuderia Ferrari Black', family: 'Fougère Aromático', note: 'Ameixa · Canela · Âmbar', price: 'R$ 69,90', image: '/products/LC09-ScuderiaBlack.jpg',
      description: 'Esportivo e envolvente, com abertura frutada vibrante e base amadeirada e adocicada.',
      top: 'Limão, Maçã, Ameixa, Bergamota', heart: 'Canela, Cardamomo, Jasmim, Rosa', base: 'Baunilha, Âmbar, Cedro, Almíscar' },
    { name: 'Animale', inspiredBy: 'Animale For Men', family: 'Aromático Amadeirado', note: 'Menta · Rosa · Sândalo', price: 'R$ 69,90', image: '/products/LC10-Animale.jpg',
      description: 'Sofisticado e potente, com abertura fresca e mentolada e base amadeirada e almiscarada.',
      top: 'Menta, Cítricos, Bergamota, Lavanda, Melão', heart: 'Rosa fresca, Gerânio, Flor de laranjeira', base: 'Almíscar, Âmbar, Sândalo, Madeiras exóticas' },
    { name: 'Polo Blue', inspiredBy: 'Polo Ralph Lauren Blue', family: 'Aquático Aromático', note: 'Melão · Gerânio · Almíscar', price: 'R$ 69,90', image: '/products/LC11-PoloBlue.jpg',
      description: 'Leve, fresco e elegante. Abertura verde e suculenta, com base limpa de couro suave e almíscar.',
      top: 'Melão, Pepino, Tangerina', heart: 'Gerânio, Manjericão, Sálvia', base: 'Camurça, Musgo, Almíscar' },
    { name: 'Million', inspiredBy: '1 Million — Paco Rabanne', family: 'Oriental Especiado', note: 'Canela · Rosa · Couro', price: 'R$ 69,90', image: '/products/LC12-Million.jpg',
      description: 'Ousado e luxuoso, com abertura frutada e picante e base de couro e âmbar.',
      top: 'Laranja sanguínea, Hortelã, Toranja', heart: 'Canela, Rosa, Especiarias', base: 'Couro, Âmbar, Patchouli' },
    { name: 'Invictus', inspiredBy: 'Invictus — Paco Rabanne', family: 'Aquático Amadeirado', note: 'Notas marinhas · Louro · Âmbar-cinza', price: 'R$ 69,90', image: '/products/LC13-Invictus.jpg',
      description: 'Energia de vitória: abertura marinha e cítrica, coração amadeirado e base âmbar profunda.',
      top: 'Toranja, Notas marinhas', heart: 'Louro, Jasmim de água', base: 'Madeira de guaiaco, Musgo de carvalho, Âmbar-cinza' },
  ]},
  { label: 'Cremes', key: 'cremes', products: [
    { name: 'Creme Vanilla Silk', note: 'Hidratação · Baunilha · Vitamina E', price: 'R$ 79,90', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=700&q=85' },
    { name: 'Body Butter Gold', note: 'Manteiga · Jasmim · Ouro', price: 'R$ 89,90', image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=700&q=85' },
    { name: 'Loção Lumière', note: 'Maciez · Íris · Musk', price: 'R$ 69,90', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=85' },
  ]},
]

export default function Page() {
  const [slide, setSlide] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const { data: backendProducts } = useSWR<BackendProduct[]>('catalog-products', fetchBackendProducts, { revalidateOnFocus: false })
  const current = slides[slide]
  const catalogTabs = useMemo(() => {
    if (!backendProducts?.length) return tabs
    const groups = [
      { label: 'Perfumes femininos', key: 'femininos', match: (product: BackendProduct) => product.category_gender === 'feminino' },
      { label: 'Perfumes masculinos', key: 'masculinos', match: (product: BackendProduct) => product.category_gender === 'masculino' },
      { label: 'Cremes', key: 'cremes', match: (product: BackendProduct) => product.category_name?.toLowerCase().includes('creme') || product.category_name?.toLowerCase().includes('cosmético') },
    ]
    return groups.map((group) => ({
      label: group.label,
      key: group.key,
      products: backendProducts.filter(group.match).map((product) => ({
        name: product.name,
        note: product.olfactory_family || [product.top_notes, product.heart_notes, product.base_notes].filter(Boolean).join(' · ') || product.description || 'Fragrância contratipo',
        price: `R$ ${Number(product.price).toFixed(2).replace('.', ',')}`,
        image: backendImageUrl(product.image_url),
        family: product.olfactory_family,
        description: product.description,
        top: product.top_notes,
        heart: product.heart_notes,
        base: product.base_notes,
      })),
    }))
  }, [backendProducts])

  useEffect(() => {
    const timer = setInterval(() => setSlide((value) => (value + 1) % slides.length), 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 lg:px-10">
          <button aria-label="Abrir menu" className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          <a href="#inicio" className="flex items-center gap-3"><span className="font-serif text-lg tracking-[0.28em] sm:text-xl">CONTRATIPOS</span></a>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-[105px] z-20 w-full flex-col gap-5 border-b border-border bg-background px-5 py-6 text-xs uppercase tracking-[0.18em] lg:static lg:flex lg:w-auto lg:flex-row lg:border-0 lg:bg-transparent lg:p-0`}>
            <a href="#colecoes" className="transition-colors hover:text-primary">Coleções</a><a href="#mais-amados" className="transition-colors hover:text-primary">Mais amados</a><a href="#ritual" className="transition-colors hover:text-primary">O ritual Vanilla</a>
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

      <section id="colecoes" className="mx-auto max-w-7xl px-5 py-20 lg:px-10"><div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encontre a sua assinatura</p><h2 className="font-serif text-4xl md:text-5xl">Escolha por essência</h2></div><p className="max-w-xs text-sm leading-6 text-muted-foreground">Descubra fragrâncias e cuidados pensados para fazer parte da sua história.</p></div><div className="mb-10 flex gap-7 overflow-x-auto border-b border-border"><div className="flex min-w-max gap-7">{catalogTabs.map((tab, index) => <button key={tab.key} onClick={() => setActiveTab(index)} className={`border-b-2 pb-4 text-xs uppercase tracking-[0.16em] transition ${activeTab === index ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>)}</div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">{catalogTabs[activeTab].products.map((product) => { const hasDetails = Boolean(product.top || product.heart || product.base || product.description); return <article key={product.name} className="group"><div className="relative aspect-square overflow-hidden bg-secondary"><Image src={product.image} alt={product.name} fill onClick={() => hasDetails && setSelectedProduct(product)} className={`object-cover transition duration-700 group-hover:scale-105 ${hasDetails ? 'cursor-pointer' : ''}`} /><button aria-label={`Favoritar ${product.name}`} className="absolute right-4 top-4 bg-background/80 p-2 backdrop-blur"><Heart size={17} strokeWidth={1.5} /></button><a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 translate-y-full bg-primary py-3 text-[10px] uppercase tracking-[0.2em] text-primary-foreground transition duration-300 group-hover:translate-y-0"><MessageCircle size={14} /> Comprar pelo WhatsApp</a></div><div className="flex items-start justify-between gap-3 pt-4"><div><h3 className="font-serif text-base sm:text-xl">{product.name}</h3><p className="mt-1 text-xs text-muted-foreground">{product.note}</p>{hasDetails && <button type="button" onClick={() => setSelectedProduct(product)} className="mt-1 text-[10px] uppercase tracking-[0.14em] text-accent underline underline-offset-4">Ver composição</button>}</div><p className="whitespace-nowrap text-sm font-medium">{product.price}</p></div></article> })}</div></section>

      {selectedProduct && (
        <div role="dialog" aria-modal="true" aria-label={`Composição de ${selectedProduct.name}`} className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 px-4 py-8 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}>
          <div className="relative flex w-full max-w-3xl flex-col overflow-hidden bg-background sm:flex-row" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Fechar" onClick={() => setSelectedProduct(null)} className="absolute right-4 top-4 z-10 bg-background/80 p-2 backdrop-blur"><X size={18} /></button>
            <div className="relative h-64 w-full flex-none sm:h-auto sm:w-2/5"><Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" /></div>
            <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
              <h3 className="font-serif text-3xl">{selectedProduct.name}</h3>
              {selectedProduct.inspiredBy && <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">Inspiração: <span className="text-accent">{selectedProduct.inspiredBy}</span></p>}
              {selectedProduct.family && <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{selectedProduct.family}</p>}
              <p className="mt-5 text-sm font-medium">{selectedProduct.price}</p>
              {selectedProduct.description && <p className="mt-4 text-sm leading-6 text-muted-foreground">{selectedProduct.description}</p>}
              {(selectedProduct.top || selectedProduct.heart || selectedProduct.base) && (
                <div className="mt-6 space-y-4 border-t border-border pt-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pirâmide olfativa</p>
                  {selectedProduct.top && <div><p className="text-[10px] uppercase tracking-[0.16em] text-accent">Topo</p><p className="font-serif text-lg">{selectedProduct.top}</p></div>}
                  {selectedProduct.heart && <div><p className="text-[10px] uppercase tracking-[0.16em] text-accent">Coração</p><p className="font-serif text-lg">{selectedProduct.heart}</p></div>}
                  {selectedProduct.base && <div><p className="text-[10px] uppercase tracking-[0.16em] text-accent">Fundo</p><p className="font-serif text-lg">{selectedProduct.base}</p></div>}
                </div>
              )}
              <a href={whatsappLink(selectedProduct.name)} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 bg-primary px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-primary-foreground"><MessageCircle size={14} /> Comprar pelo WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      <section id="ritual" className="border-y border-border bg-secondary"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:px-10 lg:py-24"><div className="relative aspect-[4/3] overflow-hidden"><Image src="/hero-cremes.png" alt="Ritual de cuidado Vanilla" fill className="object-cover" /></div><div className="max-w-md"><p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">O ritual Vanilla</p><h2 className="font-serif text-4xl leading-tight md:text-5xl">Perfume também é cuidado.</h2><p className="mt-5 text-sm leading-7 text-muted-foreground">Mais do que uma fragrância, criamos momentos. Texturas, notas e sensações para acompanhar todos os seus dias com presença.</p><a href="#colecoes" className="mt-7 inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] underline underline-offset-8">Conheça a linha de cuidados <ArrowRight size={15} /></a></div></div></section>
      <section className="bg-primary px-5 py-16 text-center text-primary-foreground"><p className="text-[10px] uppercase tracking-[0.3em] text-accent">Receba novidades Vanilla</p><h2 className="mt-4 font-serif text-3xl md:text-4xl">Uma essência especial está a caminho.</h2><div className="mx-auto mt-8 flex max-w-md border-b border-primary-foreground/40"><input aria-label="Seu melhor e-mail" type="email" placeholder="Seu melhor e-mail" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm outline-none placeholder:text-primary-foreground/50" /><button className="px-1 text-[10px] uppercase tracking-[0.18em] text-accent">Assinar</button></div></section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 Contratipos</span><span>A mesma essência. Um preço justo.</span><a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-accent"><MessageCircle size={14} /> Comprar pelo WhatsApp</a></footer>
    </main>
  )
}
