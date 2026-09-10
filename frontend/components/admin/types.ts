export type Category = {
  id: number
  name: string
  slug: string
  gender: 'masculino' | 'feminino' | 'unissex'
}

export type Product = {
  id: number
  code: string
  name: string
  category_id: number | null
  category_name?: string
  category_gender?: string
  olfactory_family?: string
  description?: string
  top_notes?: string
  heart_notes?: string
  base_notes?: string
  fixation?: string
  projection?: string
  size_ml?: number
  price: string | number
  cost?: string | number
  stock_quantity: number
  min_stock: number
  status: 'available' | 'sold_out' | 'inactive'
  featured?: boolean
  best_seller?: boolean
  image_url?: string
}

export type DashboardStats = {
  revenue: string | number
  orders_count: number
  by_status: { status: OrderStatus; count: string | number }[]
  top_products: {
    id: number
    code: string
    name: string
    total_quantity: string | number
    total_revenue: string | number
  }[]
}

export type StockOverview = {
  products: Product[]
  low_stock: Product[]
  sold_out: Product[]
}

export type StockMovement = {
  id: number
  product_id: number
  type: 'entrada' | 'saida' | 'ajuste'
  quantity: number
  reason: string | null
  created_by_name?: string
  created_at: string
}

export type OrderItem = {
  id: number
  product_id: number
  product_name: string
  product_code: string
  quantity: number
  unit_price: string | number
  subtotal: string | number
}

export type Order = {
  id: number
  order_number: string
  customer_id: number
  customer_name?: string
  email?: string
  phone?: string
  address?: string
  number?: string
  complement?: string
  city?: string
  state?: string
  cep?: string
  subtotal: string | number
  discount: string | number
  shipping: string | number
  total: string | number
  payment_method: 'pix' | 'cartao' | 'outro'
  status: OrderStatus
  created_at: string
  items?: OrderItem[]
}

export type OrderStatus =
  | 'aguardando_pagamento'
  | 'pagamento_aprovado'
  | 'em_preparacao'
  | 'enviado'
  | 'entregue'
  | 'cancelado'

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'aguardando_pagamento', label: 'Aguardando pagamento' },
  { value: 'pagamento_aprovado', label: 'Pagamento aprovado' },
  { value: 'em_preparacao', label: 'Em preparação' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function formatMoney(value: string | number) {
  const n = typeof value === 'string' ? parseFloat(value) : value
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Converte um número digitado no formato brasileiro ("120,50" ou "1.200,50") para float. */
export function parseBrNumber(value: string): number {
  if (!value) return 0
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const n = parseFloat(normalized)
  return Number.isFinite(n) ? n : 0
}
