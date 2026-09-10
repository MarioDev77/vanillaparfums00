import type { Metadata } from 'next'
import CatalogoClient from '@/components/CatalogoClient'

export const metadata: Metadata = {
  title: 'Catálogo completo | Vanilla Parfums',
  description: 'Explore todo o catálogo de contratipos Vanilla Parfums: femininos, masculinos e unissex. Filtre por família olfativa, preço e mais.',
}

export default function CatalogoPage() {
  return <CatalogoClient />
}
