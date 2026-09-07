'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import ProductsPanel from '@/components/admin/ProductsPanel'
import StockPanel from '@/components/admin/StockPanel'
import OrdersPanel from '@/components/admin/OrdersPanel'
import CategoriesPanel from '@/components/admin/CategoriesPanel'

const TABS = [
  { id: 'products', label: 'Produtos' },
  { id: 'stock', label: 'Estoque' },
  { id: 'orders', label: 'Pedidos' },
  { id: 'categories', label: 'Categorias' },
] as const

type Tab = (typeof TABS)[number]['id']

export default function AdminDashboard({ userName }: { userName: string }) {
  const [tab, setTab] = useState<Tab>('products')
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen bg-secondary">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Vanilla Parfums</p>
            <h1 className="mt-1 font-serif text-3xl">Painel administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:block">Olá, {userName}</span>
            <button onClick={logout} aria-label="Sair"><LogOut size={18} /></button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-5 lg:px-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-4 py-3 text-xs uppercase tracking-widest ${tab === t.id ? 'border-accent text-accent-foreground' : 'border-transparent text-muted-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10">
        {tab === 'products' && <ProductsPanel />}
        {tab === 'stock' && <StockPanel />}
        {tab === 'orders' && <OrdersPanel />}
        {tab === 'categories' && <CategoriesPanel />}
      </div>
    </main>
  )
}
