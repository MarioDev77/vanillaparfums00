'use client'
import { useEffect, useState } from 'react'
import { BarChart3, DollarSign, Package, ShoppingBag } from 'lucide-react'
import { adminJson } from '@/lib/admin-client'
import { DashboardStats, ORDER_STATUSES, formatMoney } from './types'

export default function DashboardPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminJson<DashboardStats>('/stats')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>
  if (error) return <p className="text-sm text-red-700">{error}</p>
  if (!stats) return null

  const statusCount = (status: string) =>
    Number(stats.by_status.find((s) => s.status === status)?.count ?? 0)

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-background p-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><DollarSign size={14} /> Faturamento total</p>
          <p className="mt-3 font-serif text-3xl">{formatMoney(stats.revenue)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Pedidos não cancelados</p>
        </div>
        <div className="rounded-xl bg-background p-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><ShoppingBag size={14} /> Pedidos</p>
          <p className="mt-3 font-serif text-3xl">{stats.orders_count}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {statusCount('aguardando_pagamento')} aguardando pagamento
          </p>
        </div>
        <div className="rounded-xl bg-background p-6 shadow-sm">
          <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><Package size={14} /> Entregues</p>
          <p className="mt-3 font-serif text-3xl">{statusCount('entregue')}</p>
          <p className="mt-1 text-xs text-muted-foreground">{statusCount('cancelado')} cancelados</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl bg-background p-6 shadow-sm">
          <h3 className="flex items-center gap-2 font-serif text-2xl"><BarChart3 size={20} /> Pedidos por status</h3>
          <div className="mt-5 grid gap-3">
            {ORDER_STATUSES.map((s) => {
              const count = statusCount(s.value)
              const max = Math.max(...ORDER_STATUSES.map((o) => statusCount(o.value)), 1)
              return (
                <div key={s.value}>
                  <div className="flex justify-between text-xs uppercase tracking-widest text-muted-foreground">
                    <span>{s.label}</span><span>{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl bg-background p-6 shadow-sm">
          <h3 className="font-serif text-2xl">Mais vendidos</h3>
          {stats.top_products.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Ainda não há vendas registradas.</p>
          ) : (
            <div className="mt-5 grid gap-3">
              {stats.top_products.map((p, i) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span>{i + 1}. {p.name} <span className="text-muted-foreground">({p.code})</span></span>
                  <span className="text-muted-foreground">{p.total_quantity} un. · {formatMoney(p.total_revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
