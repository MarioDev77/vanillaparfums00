'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { CatalogProduct } from './catalog'

export type CartItem = {
  code: string
  name: string
  price: number
  image: string
  size_ml?: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  addItem: (product: CatalogProduct, quantity?: number) => void
  updateQuantity: (code: string, quantity: number) => void
  removeItem: (code: string) => void
  clear: () => void
  subtotal: number
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CART_KEY = 'vanilla-parfums:carrinho'
const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CART_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(items)) } catch {}
  }, [items, loaded])

  function addItem(product: CatalogProduct, quantity = 1) {
    if (!product.code) return // Só adiciona produtos reais do backend (com código), nunca os dados de exemplo.
    setItems((current) => {
      const existing = current.find((item) => item.code === product.code)
      if (existing) {
        return current.map((item) => (item.code === product.code ? { ...item, quantity: item.quantity + quantity } : item))
      }
      const priceNumber = Number(String(product.price).replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
      return [...current, { code: product.code!, name: product.name, price: priceNumber, image: product.image, size_ml: product.size_ml, quantity }]
    })
  }

  function updateQuantity(code: string, quantity: number) {
    setItems((current) => (quantity <= 0 ? current.filter((item) => item.code !== code) : current.map((item) => (item.code === code ? { ...item, quantity } : item))))
  }

  function removeItem(code: string) {
    setItems((current) => current.filter((item) => item.code !== code))
  }

  function clear() {
    setItems([])
  }

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const count = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clear, subtotal, count, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return context
}
