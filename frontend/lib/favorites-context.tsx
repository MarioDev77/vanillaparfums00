'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FAVORITES_KEY, favKey, type CatalogProduct } from './catalog'

type FavoritesContextValue = {
  favorites: Set<string>
  isFavorite: (product: CatalogProduct) => boolean
  toggleFavorite: (product: CatalogProduct) => void
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_KEY)
      if (stored) setFavorites(new Set(JSON.parse(stored)))
    } catch {}
  }, [])

  function toggleFavorite(product: CatalogProduct) {
    setFavorites((current) => {
      const next = new Set(current)
      const key = favKey(product)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      try { window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }

  function isFavorite(product: CatalogProduct) {
    return favorites.has(favKey(product))
  }

  return <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>')
  return context
}
