'use client'
import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { fetchBackendProducts, type BackendProduct } from '@/lib/backend-api'
import { mapBackendProduct, favKey, type CatalogProduct } from '@/lib/catalog'
import { useFavorites } from '@/lib/favorites-context'
import { useCart } from '@/lib/cart-context'
import { whatsappLink } from '@/lib/whatsapp'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const GENDER_OPTIONS: { value: '' | 'feminino' | 'masculino' | 'unissex'; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'unissex', label: 'Unissex' },
]

const SORT_OPTIONS = [
  { value: 'destaques', label: 'Destaques' },
  { value: 'mais_vendidos', label: 'Mais vendidos' },
  { value: 'menor_preco', label: 'Menor preço' },
  { value: 'maior_preco', label: 'Maior preço' },
  { value: 'az', label: 'A-Z' },
] as const

function priceNumber(product: CatalogProduct) {
  return Number(product.price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) || 0
}

function CatalogoContent() {
  const searchParams = useSearchParams()
  const { data: backendProducts, isLoading } = useSWR<BackendProduct[]>('catalog-products', fetchBackendProducts, { revalidateOnFocus: false })
  const { favorites, toggleFavorite } = useFavorites()
  const cart = useCart()

  const [gender, setGender] = useState<'' | 'feminino' | 'masculino' | 'unissex'>('')
  const [family, setFamily] = useState('')
  const [occasion, setOccasion] = useState('')
  const [intensity, setIntensity] = useState<'' | 'leve' | 'moderada' | 'intensa'>('')
  const [sort, setSort] = useState<typeof SORT_OPTIONS[number]['value']>('destaques')
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get('favoritos') === '1')

  const products = useMemo(() => (backendProducts ?? []).map(mapBackendProduct), [backendProducts])

  const families = useMemo(
    () => Array.from(new Set(products.map((p) => p.olfactory_family).filter(Boolean))) as string[],
    [products]
  )

  // Ocasião é um campo de texto livre no cadastro (ex.: "Dia, Trabalho"), então as opções do filtro
  // vêm só do que já foi cadastrado nos produtos — nada de inventar uma lista fixa sem dado real.
  const occasions = useMemo(() => {
    const values = products.flatMap((p) => (p.occasion ? p.occasion.split(',').map((v) => v.trim()) : []))
    return Array.from(new Set(values.filter(Boolean)))
  }, [products])

  const filtered = useMemo(() => {
    let list = products
    if (favoritesOnly) list = list.filter((p) => favorites.has(favKey(p)))
    if (gender) list = list.filter((p) => p.category_gender === gender)
    if (family) list = list.filter((p) => p.olfactory_family === family)
    if (occasion) list = list.filter((p) => p.occasion?.toLowerCase().split(',').map((v) => v.trim()).includes(occasion.toLowerCase()))
    if (intensity) list = list.filter((p) => p.intensity === intensity)
    const term = search.trim().toLowerCase()
    if (term) {
      list = list.filter((p) => [p.name, p.note, p.olfactory_family, p.description]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)))
    }
    const sorted = [...list]
    if (sort === 'destaques') sorted.sort((a, b) => (Number(b.featured) + Number(b.best_seller)) - (Number(a.featured) + Number(a.best_seller)))
    if (sort === 'mais_vendidos') sorted.sort((a, b) => Number(b.best_seller) - Number(a.best_seller))
    if (sort === 'menor_preco') sorted.sort((a, b) => priceNumber(a) - priceNumber(b))
    if (sort === 'maior_preco') sorted.sort((a, b) => priceNumber(b) - priceNumber(a))
    if (sort === 'az') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [products, favoritesOnly, gender, family, occasion, intensity, search, sort, favorites])

  function clearFilters() {
    setGender('')
    setFamily('')
    setOccasion('')
    setIntensity('')
    setSearch('')
    setFavoritesOnly(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Catálogo completo</p>
        <h1 className="font-serif text-4xl md:text-5xl">Todos os contratipos</h1>

        <div className="mt-10 flex flex-col gap-6 border-y border-border py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {GENDER_OPTIONS.map((option) => (
              <button key={option.value} onClick={() => setGender(option.value)} className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${gender === option.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>{option.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar por nome, notas..." className="border-b border-border bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" />
            <select value={family} onChange={(e) => setFamily(e.target.value)} className="border border-border bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
              <option value="">Família olfativa</option>
              {families.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            {occasions.length > 0 && (
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className="border border-border bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
                <option value="">Ocasião</option>
                {occasions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            <select value={intensity} onChange={(e) => setIntensity(e.target.value as typeof intensity)} className="border border-border bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
              <option value="">Intensidade</option>
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="intensa">Intensa</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="border border-border bg-transparent px-3 py-1.5 text-[11px] uppercase tracking-[0.1em]">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button onClick={() => setFavoritesOnly((v) => !v)} className={`flex items-center gap-1.5 border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${favoritesOnly ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}><Heart size={12} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favoritos</button>
          </div>
        </div>

        {isLoading && <p className="py-16 text-center text-sm text-muted-foreground">Carregando catálogo...</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm text-muted-foreground">Nenhum perfume encontrado.</p>
            <button onClick={clearFilters} className="mt-4 text-xs uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4">Limpar filtros</button>
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-4">
            {filtered.map((product) => (
              <article key={favKey(product)} className="group">
                <a href={product.code ? `/produto/${product.code}` : whatsappLink(product.name)} className="relative block aspect-[4/5] overflow-hidden bg-secondary">
                  <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                  {(product.best_seller || product.featured) && (
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {product.best_seller && <span className="bg-accent px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-accent-foreground">Mais vendido</span>}
                      {product.featured && <span className="border border-accent bg-background/80 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-accent-foreground">Destaque</span>}
                    </div>
                  )}
                  <button
                    aria-label={favorites.has(favKey(product)) ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
                    onClick={(e) => { e.preventDefault(); toggleFavorite(product) }}
                    className={`absolute right-4 top-4 text-primary-foreground mix-blend-difference transition-opacity duration-300 ${favorites.has(favKey(product)) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart size={17} strokeWidth={1.5} fill={favorites.has(favKey(product)) ? 'currentColor' : 'none'} />
                  </button>
                </a>
                <div className="mt-5 border-t border-border pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl">{product.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{product.note}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm">{product.price}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    {product.code && <a href={`/produto/${product.code}`} className="text-[10px] uppercase tracking-[0.16em] underline underline-offset-4">Ver perfume</a>}
                    {product.code && <button onClick={() => { cart.addItem(product); cart.openCart() }} className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4">Adicionar ao carrinho</button>}
                    <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4"><WhatsAppIcon size={11} /> WhatsApp</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}

export default function CatalogoClient() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <CatalogoContent />
    </Suspense>
  )
}
