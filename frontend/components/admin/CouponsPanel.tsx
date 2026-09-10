'use client'
import { FormEvent, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { Coupon, formatMoney } from './types'

const emptyForm = {
  code: '',
  discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: '',
  valid_from: '',
  valid_until: '',
  max_uses: '',
}

export default function CouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setCoupons(await adminJson<Coupon[]>('/coupons'))
  }
  useEffect(() => { load() }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await adminJson('/coupons', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value.replace(',', '.')),
          valid_from: form.valid_from || null,
          valid_until: form.valid_until || null,
          max_uses: form.max_uses ? Number(form.max_uses) : null,
        }),
      })
      setForm(emptyForm)
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar cupom.')
    }
    setSaving(false)
  }

  async function toggleActive(coupon: Coupon) {
    await adminJson(`/coupons/${coupon.id}`, { method: 'PUT', body: JSON.stringify({ active: !coupon.active }) })
    setCoupons((value) => value.map((c) => (c.id === coupon.id ? { ...c, active: !c.active } : c)))
  }

  async function remove(coupon: Coupon) {
    if (!confirm(`Remover o cupom "${coupon.code}"?`)) return
    await adminFetch(`/coupons/${coupon.id}`, { method: 'DELETE' })
    setCoupons((value) => value.filter((c) => c.id !== coupon.id))
  }

  function discountLabel(coupon: Coupon) {
    return coupon.discount_type === 'percentage'
      ? `${Number(coupon.discount_value)}%`
      : formatMoney(coupon.discount_value)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit rounded-xl bg-background p-6 shadow-sm">
        <h2 className="font-serif text-2xl">Novo cupom</h2>
        <div className="mt-6 grid gap-4">
          <label className="text-xs uppercase tracking-widest">Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BEMVINDO10" required className="mt-2 w-full border border-border bg-transparent p-3 uppercase" />
          </label>
          <label className="text-xs uppercase tracking-widest">Tipo de desconto
            <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percentage' | 'fixed' })} className="mt-2 w-full border border-border bg-transparent p-3">
              <option value="percentage">Percentual (%)</option>
              <option value="fixed">Valor fixo (R$)</option>
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest">Valor do desconto
            <input value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} placeholder={form.discount_type === 'percentage' ? '10' : '20,00'} required className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-xs uppercase tracking-widest">Válido de
              <input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Válido até
              <input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
          </div>
          <label className="text-xs uppercase tracking-widest">Limite de usos (opcional)
            <input value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Deixe em branco para ilimitado" className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
        </div>
        {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
        <button disabled={saving} className="mt-6 w-full bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50">
          {saving ? 'Salvando...' : 'Cadastrar cupom'}
        </button>
      </form>

      <section>
        <h2 className="mb-5 font-serif text-3xl">Cupons cadastrados</h2>
        <div className="grid gap-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between rounded-xl bg-background p-4 shadow-sm">
              <div>
                <p className="font-serif text-lg">{coupon.code} <span className="ml-2 text-xs font-sans text-muted-foreground">{discountLabel(coupon)} de desconto</span></p>
                <p className="text-xs text-muted-foreground">
                  {coupon.used_count} uso{coupon.used_count === 1 ? '' : 's'}{coupon.max_uses ? ` de ${coupon.max_uses}` : ''}
                  {coupon.valid_until ? ` · válido até ${new Date(coupon.valid_until).toLocaleDateString('pt-BR')}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleActive(coupon)} className={`px-3 py-1 text-[10px] uppercase tracking-widest ${coupon.active ? 'bg-accent text-accent-foreground' : 'border border-border text-muted-foreground'}`}>
                  {coupon.active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => remove(coupon)} aria-label="Remover cupom" className="text-red-700"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cupom cadastrado ainda.</p>}
        </div>
      </section>
    </div>
  )
}
