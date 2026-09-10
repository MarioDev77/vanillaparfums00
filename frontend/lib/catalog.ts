import { backendImageUrl, type BackendProduct } from './backend-api'

export type CatalogProduct = {
  code?: string
  name: string
  note: string
  price: string
  image: string
  description?: string
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  olfactory_family?: string
  fixation?: string
  projection?: string
  size_ml?: number
  category_name?: string
  category_gender?: 'masculino' | 'feminino' | 'unissex'
  featured?: boolean
  best_seller?: boolean
  tabLabel?: string
  id?: number
}

export function formatPrice(price: number | string) {
  return `R$ ${Number(price).toFixed(2).replace('.', ',')}`
}

export function mapBackendProduct(product: BackendProduct): CatalogProduct {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    note: product.olfactory_family || [product.top_notes, product.heart_notes, product.base_notes].filter(Boolean).join(' · ') || product.description || 'Fragrância contratipo',
    price: formatPrice(product.price),
    image: backendImageUrl(product.image_url),
    description: product.description,
    top_notes: product.top_notes,
    heart_notes: product.heart_notes,
    base_notes: product.base_notes,
    olfactory_family: product.olfactory_family,
    fixation: product.fixation,
    projection: product.projection,
    size_ml: product.size_ml,
    category_name: product.category_name,
    category_gender: product.category_gender,
    featured: product.featured,
    best_seller: product.best_seller,
  }
}

export const FAVORITES_KEY = 'vanilla-parfums:favoritos'
export const favKey = (product: CatalogProduct) => String(product.id ?? product.name)

export const GENDER_GROUPS: { label: string; key: string; gender: 'feminino' | 'masculino' | 'unissex' }[] = [
  { label: 'Perfumes femininos', key: 'femininos', gender: 'feminino' },
  { label: 'Perfumes masculinos', key: 'masculinos', gender: 'masculino' },
  { label: 'Unissex & cuidados', key: 'unissex', gender: 'unissex' },
]
