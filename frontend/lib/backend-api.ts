const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export type BackendProduct = {
  id: number
  code: string
  name: string
  price: number | string
  image_url?: string
  description?: string
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  olfactory_family?: string
  fixation?: string
  projection?: string
  occasion?: string
  intensity?: 'leve' | 'moderada' | 'intensa'
  size_ml?: number
  category_gender?: 'masculino' | 'feminino' | 'unissex'
  category_name?: string
  status?: string
  featured?: boolean
  best_seller?: boolean
}

export async function fetchBackendProducts(): Promise<BackendProduct[]> {
  const response = await fetch(`${API_URL}/products?available_only=true`)
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo.')
  return response.json()
}

export async function fetchBackendProductByCode(code: string): Promise<BackendProduct | null> {
  const response = await fetch(`${API_URL}/products/${encodeURIComponent(code)}`, { cache: 'no-store' })
  if (response.status === 404) return null
  if (!response.ok) throw new Error('Não foi possível carregar o produto.')
  return response.json()
}

export function backendImageUrl(imageUrl?: string) {
  if (!imageUrl) return '/hero-contratipos.png'
  return imageUrl.startsWith('http') ? imageUrl : `${API_URL.replace('/api', '')}${imageUrl}`
}

export { API_URL }
