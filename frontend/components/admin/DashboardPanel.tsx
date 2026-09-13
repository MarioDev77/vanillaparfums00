'use client'
import { useEffect, useState } from 'react'
import { BarChart3, DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { adminJson } from '@/lib/admin-client'
import { DashboardStats, ManualSalesStats, ORDER_STATUSES, formatMoney } from './types'

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function monthLabel(month: string) {
  const [year, m] = month.split('-')
  return `${MONTH_LABELS[Number(m) - 1]}/${year.slice(2)}`
}

function SalesChart({ data }: { data: ManualSalesStats['by_month'] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">Ainda não há vendas manuais registradas.</p>
  }

  const width = 560
  const height = 220
  const padding = { top: 10, right: 10, bottom: 28, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const groupWidth = chartWidth / data.length
  const barWidth = Math.min(18, groupWidth / 3)

  const maxValue = Math.max(...data.map((d) => Math.max(Number(d.revenue), Number(d.profit))), 1)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" role="img" aria-label="Gráfico de vendas mensais">
      {data.map((d, i) => {
        const revenue = Number(d.revenue)
        const profit = Number(d.profit)
        const groupX = padding.left + i * groupWidth + groupWidth / 2
        const revenueHeight = (revenue / maxValue) * chartHeight
        const profitHeight = (Math.abs(profit) / maxValue) * chartHeight
        const baseY = padding.top + chartHeight

        return (
          <g key={d.month}>
            <rect
              x={groupX - barWidth - 2}
              y={baseY - revenueHeight}
              width={barWidth}
              height={revenueHeight}
              className="fill-accent"
            />
            <rect
              x={groupX + 2}
              y={profit >= 0 ? baseY - profitHeight : baseY}
              width={barWidth}
              height={profitHeight}
              className={profit >= 0 ? 'fill-primary' : 'fill-red-700'}
            />
            <text x={groupX} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[9px] uppercase tracking-widest">
              {monthLabel(d.month)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function DashboardPanel() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesStats, setSalesStats] = useState<ManualSalesStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      adminJson<DashboardStats>('/stats'),
      adminJson<ManualSalesStats>('/manual-sales/stats'),
    ])
      .then(([s, m]) => {
        setStats(s)
        setSalesStats(m)
      })
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

      {salesStats && (
        <div className="rounded-xl bg-background p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-2xl"><TrendingUp size={20} /> Vendas manuais por mês</h3>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Receita</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Lucro</span>
            </div>
          </div>
          <SalesChart data={salesStats.by_month} />
          <div className="mt-2 grid grid-cols-3 gap-4 border-t border-border pt-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Faturamento</p><p className="mt-1">{formatMoney(salesStats.total_revenue)}</p></div>
            <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lucro</p><p className={`mt-1 ${Number(salesStats.total_profit) < 0 ? 'text-red-700' : ''}`}>{formatMoney(salesStats.total_profit)}</p></div>
            <div><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Custo</p><p className="mt-1">{formatMoney(salesStats.total_cost)}</p></div>
          </div>
        </div>
      )}

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
