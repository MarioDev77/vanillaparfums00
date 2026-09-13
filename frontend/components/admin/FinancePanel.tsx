'use client'
import { FormEvent, useEffect, useState } from 'react'
import { Download, Pencil, Trash2, X } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { ManualSale, ManualSalesStats, Product, formatMoney, parseBrNumber } from './types'

const empty = {
  product_id: '',
  customer_name: '',
  contact: '',
  sale_date: new Date().toISOString().slice(0, 10),
  payment_date: '',
  quantity: '1',
  unit_price: '',
  status: 'pendente' as 'pago' | 'pendente',
  notes: '',
}

const inputClass = 'mt-1 w-full rounded-md border border-border bg-background/60 p-2 text-sm transition-colors focus:border-accent focus:outline-none'
const labelClass = 'block text-[11px] uppercase tracking-widest text-muted-foreground'

function formatDateBr(value?: string | null) {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

export default function FinancePanel() {
  const [sales, setSales] = useState<ManualSale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ManualSalesStats | null>(null)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [salesData, productsData, statsData] = await Promise.all([
      adminJson<ManualSale[]>('/manual-sales'),
      adminJson<Product[]>('/products'),
      adminJson<ManualSalesStats>('/manual-sales/stats'),
    ])
    setSales(salesData)
    setProducts(productsData)
    setStats(statsData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(sale: ManualSale) {
    setEditingId(sale.id)
    setForm({
      product_id: String(sale.product_id),
      customer_name: sale.customer_name,
      contact: sale.contact ?? '',
      sale_date: sale.sale_date,
      payment_date: sale.payment_date ?? '',
      quantity: String(sale.quantity),
      unit_price: String(sale.unit_price ?? '').replace('.', ','),
      status: sale.status,
      notes: sale.notes ?? '',
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(empty)
    setMessage('')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      product_id: Number(form.product_id),
      customer_name: form.customer_name,
      contact: form.contact,
      sale_date: form.sale_date,
      payment_date: form.payment_date,
      quantity: Number(form.quantity) || 1,
      unit_price: parseBrNumber(form.unit_price),
      status: form.status,
      notes: form.notes,
    }
    if (!payload.product_id || !payload.customer_name || !payload.unit_price) {
      setMessage('Perfume, cliente e valor de venda são obrigatórios.')
      setSaving(false)
      return
    }
    try {
      if (editingId) {
        await adminJson(`/manual-sales/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setMessage('Venda atualizada com sucesso.')
      } else {
        await adminJson('/manual-sales', { method: 'POST', body: JSON.stringify(payload) })
        setMessage('Venda registrada com sucesso.')
      }
      cancelEdit()
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar venda.')
    }
    setSaving(false)
  }

  async function remove(sale: ManualSale) {
    if (!confirm(`Remover a venda de "${sale.product_name}" para ${sale.customer_name}?`)) return
    try {
      await adminFetch(`/manual-sales/${sale.id}`, { method: 'DELETE' })
      setSales((value) => value.filter((s) => s.id !== sale.id))
    } catch {
      setMessage('Não foi possível remover a venda.')
    }
  }

  return (
    <div className="grid gap-8">
      {stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-background p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Faturamento (vendas manuais)</p>
            <p className="mt-3 font-serif text-3xl">{formatMoney(stats.total_revenue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stats.sales_count} venda{stats.sales_count === 1 ? '' : 's'} registrada{stats.sales_count === 1 ? '' : 's'}</p>
          </div>
          <div className="rounded-xl bg-background p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Lucro total</p>
            <p className={`mt-3 font-serif text-3xl ${Number(stats.total_profit) < 0 ? 'text-red-700' : ''}`}>{formatMoney(stats.total_profit)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Receita − custo dos perfumes</p>
          </div>
          <div className="rounded-xl bg-background p-6 shadow-sm">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Custo total</p>
            <p className="mt-3 font-serif text-3xl">{formatMoney(stats.total_cost)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Custo dos perfumes vendidos</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
        <form onSubmit={save} className="h-fit rounded-xl bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl">{editingId ? 'Editar venda' : 'Registrar venda'}</h2>
            {editingId && (
              <button type="button" onClick={cancelEdit} aria-label="Cancelar edição" className="rounded-full p-1 hover:bg-secondary"><X size={20} /></button>
            )}
          </div>

          <div className="mt-4 grid gap-3">
            <label className={labelClass}>Perfume
              <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required className={inputClass}>
                <option value="">Selecione...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
              </select>
            </label>

            <label className={labelClass}>Nome do cliente
              <input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required className={inputClass} />
            </label>

            <label className={labelClass}>Contato (telefone/WhatsApp/Instagram)
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className={inputClass} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Data da venda
                <input type="date" value={form.sale_date} onChange={(e) => setForm({ ...form, sale_date: e.target.value })} required className={inputClass} />
              </label>
              <label className={labelClass}>Data de pagamento
                <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} className={inputClass} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Quantidade
                <input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} inputMode="numeric" required className={inputClass} />
              </label>
              <label className={labelClass}>Valor de venda (R$, unitário)
                <input value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="120,00" inputMode="decimal" required className={inputClass} />
              </label>
            </div>

            <label className={labelClass}>Status do pagamento
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'pago' | 'pendente' })} className={inputClass}>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </label>

            <label className={labelClass}>Observações
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputClass} />
            </label>
          </div>

          {message && <p className="mt-3 text-sm text-accent-foreground">{message}</p>}
          <button disabled={saving} className="mt-4 w-full rounded-md bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Registrar venda'}
          </button>
        </form>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-serif text-3xl">Vendas registradas</h2>
            <a href="/api/admin/manual-sales/export" className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-secondary">
              <Download size={14} /> Exportar CSV
            </a>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-background shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-3">Perfume</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Venda</th>
                    <th className="p-3">Pagamento</th>
                    <th className="p-3">Qtd</th>
                    <th className="p-3">Valor</th>
                    <th className="p-3">Lucro</th>
                    <th className="p-3">Status</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border last:border-0">
                      <td className="p-3">{sale.product_name} <span className="text-xs text-muted-foreground">({sale.product_code})</span></td>
                      <td className="p-3">
                        {sale.customer_name}
                        {sale.contact && <p className="text-xs text-muted-foreground">{sale.contact}</p>}
                      </td>
                      <td className="p-3">{formatDateBr(sale.sale_date)}</td>
                      <td className="p-3">{formatDateBr(sale.payment_date)}</td>
                      <td className="p-3">{sale.quantity}</td>
                      <td className="p-3">{formatMoney(sale.unit_price)}</td>
                      <td className={`p-3 ${Number(sale.profit) < 0 ? 'text-red-700' : 'text-accent-foreground'}`}>{formatMoney(sale.profit ?? 0)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${sale.status === 'pago' ? 'bg-accent text-accent-foreground' : 'border border-border text-muted-foreground'}`}>
                          {sale.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(sale)} aria-label="Editar venda" className="hover:text-accent-foreground"><Pencil size={14} /></button>
                          <button onClick={() => remove(sale)} aria-label="Remover venda" className="text-red-700"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
