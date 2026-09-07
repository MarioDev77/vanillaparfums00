'use client'
import { FormEvent, useEffect, useState } from 'react'
import { AlertTriangle, Package } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { StockOverview, StockMovement } from './types'

export default function StockPanel() {
  const [overview, setOverview] = useState<StockOverview | null>(null)
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [form, setForm] = useState({ product_id: '', type: 'entrada', quantity: '', reason: '' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setOverview(await adminJson<StockOverview>('/stock'))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function loadMovements(productId: string) {
    if (!productId) { setMovements([]); return }
    setMovements(await adminJson<StockMovement[]>(`/stock/movements/${productId}`))
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await adminJson('/stock/movements', {
        method: 'POST',
        body: JSON.stringify({ ...form, product_id: Number(form.product_id), quantity: Number(form.quantity) }),
      })
      setMessage('Movimentação registrada com sucesso.')
      setForm((value) => ({ ...value, quantity: '', reason: '' }))
      load()
      loadMovements(form.product_id)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao registrar movimentação.')
    }
    setSaving(false)
  }

  if (loading || !overview) return <p className="text-sm text-muted-foreground">Carregando...</p>

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit bg-background p-6">
        <h2 className="font-serif text-2xl">Registrar movimentação</h2>
        <div className="mt-6 grid gap-4">
          <label className="text-xs uppercase tracking-widest">Produto
            <select
              value={form.product_id}
              onChange={(e) => { setForm({ ...form, product_id: e.target.value }); loadMovements(e.target.value) }}
              required
              className="mt-2 w-full border border-border bg-transparent p-3"
            >
              <option value="">Selecione...</option>
              {overview.products.map((p) => <option key={p.id} value={p.id}>{p.name} (estoque: {p.stock_quantity})</option>)}
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest">Tipo
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3">
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste (novo total)</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest">{form.type === 'ajuste' ? 'Novo total em estoque' : 'Quantidade'}
            <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required type="number" min={0} className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">Motivo
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Reposição de fornecedor" className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
        </div>
        {message && <p className="mt-4 text-sm text-accent-foreground">{message}</p>}
        <button disabled={saving} className="mt-6 w-full bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50">
          {saving ? 'Salvando...' : 'Registrar'}
        </button>

        {movements.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Histórico do produto</h3>
            <div className="mt-3 grid gap-2">
              {movements.map((m) => (
                <div key={m.id} className="border border-border p-2 text-xs">
                  <span className="uppercase tracking-widest">{m.type}</span> · {m.quantity} · {new Date(m.created_at).toLocaleString('pt-BR')}
                  {m.reason && <p className="mt-1 text-muted-foreground">{m.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <section className="grid gap-6">
        {(overview.sold_out.length > 0 || overview.low_stock.length > 0) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {overview.sold_out.length > 0 && (
              <div className="border border-red-300 bg-red-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-red-700"><AlertTriangle size={14} /> Esgotados ({overview.sold_out.length})</p>
                <ul className="mt-2 text-sm">{overview.sold_out.map((p) => <li key={p.id}>{p.name}</li>)}</ul>
              </div>
            )}
            {overview.low_stock.length > 0 && (
              <div className="border border-accent bg-secondary p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent-foreground"><AlertTriangle size={14} /> Estoque baixo ({overview.low_stock.length})</p>
                <ul className="mt-2 text-sm">{overview.low_stock.map((p) => <li key={p.id}>{p.name} — {p.stock_quantity} un.</li>)}</ul>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="mb-4 flex items-center gap-2 font-serif text-3xl"><Package size={22} /> Estoque atual</h2>
          <div className="grid gap-2">
            {overview.products.map((p) => (
              <div key={p.id} className="flex items-center justify-between bg-background p-3 text-sm">
                <span>{p.name} <span className="text-muted-foreground">({p.code})</span></span>
                <span className={p.stock_quantity <= p.min_stock ? 'text-red-700' : ''}>{p.stock_quantity} un.</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
