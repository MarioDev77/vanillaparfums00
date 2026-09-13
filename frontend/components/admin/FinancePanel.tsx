'use client'
import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, Download, FileDown, Pencil, Trash2, X } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import {
  FinanceMonthPoint, FinanceSummary, MANUAL_SALE_PAYMENT_METHODS, ManualSale,
  Product, Receivable, ReceivablesResponse, formatMoney, parseBrNumber,
} from './types'

const MONTH_LABELS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
function monthLabel(month: string) {
  const [year, m] = month.split('-')
  return `${MONTH_LABELS[Number(m) - 1]}/${year.slice(2)}`
}

function isoDate(d: Date) { return d.toISOString().slice(0, 10) }

const PERIOD_PRESETS: { label: string; range: () => { from: string; to: string } }[] = [
  {
    label: 'Este mês',
    range: () => {
      const now = new Date()
      return { from: isoDate(new Date(now.getFullYear(), now.getMonth(), 1)), to: isoDate(now) }
    },
  },
  {
    label: 'Mês passado',
    range: () => {
      const now = new Date()
      return {
        from: isoDate(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: isoDate(new Date(now.getFullYear(), now.getMonth(), 0)),
      }
    },
  },
  {
    label: 'Últimos 30 dias',
    range: () => {
      const now = new Date()
      const past = new Date(now)
      past.setDate(past.getDate() - 30)
      return { from: isoDate(past), to: isoDate(now) }
    },
  },
  { label: 'Tudo', range: () => ({ from: '', to: '' }) },
]

function EvolutionChart({ data }: { data: FinanceMonthPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma venda no período selecionado.</p>
  }

  const width = 760
  const height = 220
  const padding = { top: 10, right: 10, bottom: 28, left: 10 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const groupWidth = chartWidth / data.length
  const barWidth = Math.min(20, groupWidth / 3)
  const maxValue = Math.max(...data.map((d) => Math.max(d.revenue, Math.abs(d.profit))), 1)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Evolução mensal de faturamento e lucro">
      {data.map((d, i) => {
        const groupX = padding.left + i * groupWidth + groupWidth / 2
        const revenueHeight = (d.revenue / maxValue) * chartHeight
        const profitHeight = (Math.abs(d.profit) / maxValue) * chartHeight
        const baseY = padding.top + chartHeight
        return (
          <g key={d.month}>
            <rect x={groupX - barWidth - 2} y={baseY - revenueHeight} width={barWidth} height={revenueHeight} className="fill-accent" />
            <rect
              x={groupX + 2}
              y={d.profit >= 0 ? baseY - profitHeight : baseY}
              width={barWidth}
              height={profitHeight}
              className={d.profit >= 0 ? 'fill-primary' : 'fill-red-700'}
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

const empty = {
  product_id: '',
  customer_name: '',
  contact: '',
  sale_date: new Date().toISOString().slice(0, 10),
  payment_date: '',
  quantity: '1',
  unit_price: '',
  status: 'pendente' as 'pago' | 'pendente',
  payment_method: 'dinheiro' as 'pix' | 'dinheiro',
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
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [activePreset, setActivePreset] = useState('Tudo')
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [months, setMonths] = useState<FinanceMonthPoint[]>([])
  const [receivables, setReceivables] = useState<ReceivablesResponse | null>(null)
  const [financeLoading, setFinanceLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [salesData, productsData] = await Promise.all([
      adminJson<ManualSale[]>('/manual-sales'),
      adminJson<Product[]>('/products'),
    ])
    setSales(salesData)
    setProducts(productsData)
    setLoading(false)
  }

  async function loadFinance() {
    setFinanceLoading(true)
    const query = new URLSearchParams()
    if (periodFrom) query.set('from', periodFrom)
    if (periodTo) query.set('to', periodTo)
    const qs = query.toString() ? `?${query.toString()}` : ''
    const [summaryData, monthsData, receivablesData] = await Promise.all([
      adminJson<FinanceSummary>(`/finance/summary${qs}`),
      adminJson<FinanceMonthPoint[]>(`/finance/monthly${qs}`),
      adminJson<ReceivablesResponse>('/finance/receivables'),
    ])
    setSummary(summaryData)
    setMonths(monthsData)
    setReceivables(receivablesData)
    setFinanceLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { loadFinance() }, [periodFrom, periodTo])

  function applyPreset(preset: typeof PERIOD_PRESETS[number]) {
    const { from, to } = preset.range()
    setPeriodFrom(from)
    setPeriodTo(to)
    setActivePreset(preset.label)
  }

  async function markReceivablePaid(item: Receivable) {
    if (item.source !== 'manual') return
    try {
      await adminJson(`/manual-sales/${item.id}`, { method: 'PUT', body: JSON.stringify({ status: 'pago' }) })
      load()
      loadFinance()
    } catch {
      setMessage('Não foi possível atualizar essa venda.')
    }
  }

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
      payment_method: sale.payment_method ?? 'dinheiro',
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
      payment_method: form.payment_method,
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
    <div className="grid gap-5">
      <div className="rounded-xl bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl">Visão financeira</h2>
          <a href={`/api/admin/finance/export/pdf?${new URLSearchParams({ ...(periodFrom ? { from: periodFrom } : {}), ...(periodTo ? { to: periodTo } : {}) }).toString()}`} className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[9px] uppercase tracking-widest hover:bg-secondary">
            <FileDown size={12} /> Baixar PDF
          </a>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-widest transition-colors ${activePreset === preset.label ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary'}`}
            >
              {preset.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
            <label className="flex items-center gap-1">De
              <input type="date" value={periodFrom} onChange={(e) => { setPeriodFrom(e.target.value); setActivePreset('') }} className="rounded-md border border-border bg-background/60 px-1.5 py-1" />
            </label>
            <label className="flex items-center gap-1">Até
              <input type="date" value={periodTo} onChange={(e) => { setPeriodTo(e.target.value); setActivePreset('') }} className="rounded-md border border-border bg-background/60 px-1.5 py-1" />
            </label>
          </div>
        </div>

        {summary && (
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Faturamento (manual + loja)</p>
              <p className="mt-1 font-serif text-xl">{formatMoney(summary.total_revenue)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{summary.sales_count} venda{summary.sales_count === 1 ? '' : 's'}</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Lucro total</p>
              <p className={`mt-1 font-serif text-xl ${summary.total_profit < 0 ? 'text-red-700' : ''}`}>{formatMoney(summary.total_profit)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Receita − custo</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Custo total</p>
              <p className="mt-1 font-serif text-xl">{formatMoney(summary.total_cost)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Manual + loja</p>
            </div>
            <div className="rounded-lg bg-secondary/40 p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">A receber (agora)</p>
              <p className="mt-1 font-serif text-xl text-accent-foreground">{formatMoney(summary.receivables_total)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{summary.receivables_count} pendente{summary.receivables_count === 1 ? '' : 's'}</p>
            </div>
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm text-muted-foreground">Evolução mensal</h3>
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent" /> Receita</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Lucro</span>
            </div>
          </div>
          {financeLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : <EvolutionChart data={months} />}
        </div>
      </div>

      <div className="rounded-xl bg-background p-4 shadow-sm">
        <h2 className="font-serif text-xl">Recebíveis pendentes</h2>
        {financeLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>
        ) : !receivables || receivables.items.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum valor pendente no momento. 🎉</p>
        ) : (
          <div className="mt-3 min-w-0 rounded-lg border border-border">
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[9px] uppercase tracking-widest text-muted-foreground">
                  <th className="p-2 w-[12%]">Data</th>
                  <th className="p-2 w-[13%]">Origem</th>
                  <th className="p-2 w-[22%]">Cliente</th>
                  <th className="p-2 w-[23%]">Referência</th>
                  <th className="p-2 w-[15%]">Valor</th>
                  <th className="p-2 w-[15%]"></th>
                </tr>
              </thead>
              <tbody>
                {receivables.items.map((item) => (
                  <tr key={`${item.source}-${item.id}`} className="border-b border-border last:border-0 align-top">
                    <td className="p-2">{formatDateBr(item.date)}</td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${item.source === 'pedido' ? 'bg-secondary' : 'border border-border'}`}>
                        {item.source === 'pedido' ? 'Pedido' : 'Manual'}
                      </span>
                    </td>
                    <td className="truncate p-2">{item.customer}</td>
                    <td className="truncate p-2 text-muted-foreground">{item.description}</td>
                    <td className="p-2">{formatMoney(item.amount)}</td>
                    <td className="p-2">
                      {item.source === 'manual' ? (
                        <button onClick={() => markReceivablePaid(item)} className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent-foreground hover:opacity-80">
                          <CheckCircle2 size={12} /> Recebido
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Ver em Pedidos</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="p-2 text-right text-xs">Total pendente: <span className="font-medium">{formatMoney(receivables.total)}</span></p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form onSubmit={save} className="h-fit rounded-xl bg-background p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{editingId ? 'Editar venda' : 'Registrar venda'}</h2>
            {editingId && (
              <button type="button" onClick={cancelEdit} aria-label="Cancelar edição" className="rounded-full p-1 hover:bg-secondary"><X size={18} /></button>
            )}
          </div>

          <div className="mt-3 grid gap-2.5">
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

            <div className="grid grid-cols-2 gap-3">
              <label className={labelClass}>Status do pagamento
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'pago' | 'pendente' })} className={inputClass}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                </select>
              </label>
              <label className={labelClass}>Forma de pagamento
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value as 'pix' | 'dinheiro' })} className={inputClass}>
                  {MANUAL_SALE_PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </label>
            </div>

            <label className={labelClass}>Observações
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className={inputClass} />
            </label>
          </div>

          {message && <p className="mt-2 text-xs text-accent-foreground">{message}</p>}
          <button disabled={saving} className="mt-3 w-full rounded-md bg-primary p-2.5 text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Registrar venda'}
          </button>
        </form>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl">Vendas manuais registradas</h2>
            <a href="/api/admin/manual-sales/export" className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-[9px] uppercase tracking-widest hover:bg-secondary">
              <Download size={12} /> Exportar
            </a>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda.</p>
          ) : (
            <div className="min-w-0 rounded-xl bg-background shadow-sm">
              <table className="w-full table-fixed text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-[9px] uppercase tracking-widest text-muted-foreground">
                    <th className="p-2 w-[18%]">Perfume</th>
                    <th className="p-2 w-[16%]">Cliente</th>
                    <th className="p-2 w-[13%]">Datas</th>
                    <th className="p-2 w-[7%]">Qtd</th>
                    <th className="p-2 w-[11%]">Valor</th>
                    <th className="p-2 w-[11%]">Lucro</th>
                    <th className="p-2 w-[10%]">Pagto.</th>
                    <th className="p-2 w-[9%]">Status</th>
                    <th className="p-2 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border last:border-0 align-top">
                      <td className="truncate p-2">{sale.product_name} <span className="text-[10px] text-muted-foreground">({sale.product_code})</span></td>
                      <td className="truncate p-2">
                        {sale.customer_name}
                        {sale.contact && <p className="truncate text-[10px] text-muted-foreground">{sale.contact}</p>}
                      </td>
                      <td className="p-2 text-[11px] leading-tight">
                        <p>V: {formatDateBr(sale.sale_date)}</p>
                        <p className="text-muted-foreground">P: {formatDateBr(sale.payment_date)}</p>
                      </td>
                      <td className="p-2">{sale.quantity}</td>
                      <td className="p-2">{formatMoney(sale.unit_price)}</td>
                      <td className={`p-2 ${Number(sale.profit) < 0 ? 'text-red-700' : 'text-accent-foreground'}`}>{formatMoney(sale.profit ?? 0)}</td>
                      <td className="p-2 text-[11px]">{sale.payment_method === 'pix' ? 'Pix' : 'Dinheiro'}</td>
                      <td className="p-2">
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] uppercase tracking-widest ${sale.status === 'pago' ? 'bg-accent text-accent-foreground' : 'border border-border text-muted-foreground'}`}>
                          {sale.status === 'pago' ? 'Pago' : 'Pend.'}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1.5">
                          <button onClick={() => startEdit(sale)} aria-label="Editar venda" className="hover:text-accent-foreground"><Pencil size={12} /></button>
                          <button onClick={() => remove(sale)} aria-label="Remover venda" className="text-red-700"><Trash2 size={12} /></button>
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
