'use client'
import { useEffect, useState } from 'react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { Order, ORDER_STATUSES, OrderStatus, formatMoney } from './types'

export default function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  async function load() {
    setLoading(true)
    setOrders(await adminJson<Order[]>('/orders'))
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function open(order: Order) {
    const detail = await adminJson<Order>(`/orders/${order.id}`)
    setSelected(detail)
  }

  async function updateStatus(status: OrderStatus) {
    if (!selected) return
    setUpdating(true)
    try {
      const updated = await adminJson<Order>(`/orders/${selected.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setSelected((value) => (value ? { ...value, status: updated.status } : value))
      setOrders((value) => value.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o)))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section>
        <h2 className="mb-5 font-serif text-3xl">Pedidos</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pedido ainda.</p>
        ) : (
          <div className="grid gap-2">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => open(order)}
                className={`flex items-center justify-between bg-background p-4 text-left ${selected?.id === order.id ? 'ring-1 ring-accent' : ''}`}
              >
                <div>
                  <p className="font-serif text-lg">{order.order_number}</p>
                  <p className="text-xs text-muted-foreground">{order.customer_name} · {new Date(order.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{formatMoney(order.total)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-xl bg-background p-6 shadow-sm">
        {!selected ? (
          <p className="text-sm text-muted-foreground">Selecione um pedido para ver os detalhes.</p>
        ) : (
          <>
            <h3 className="font-serif text-2xl">{selected.order_number}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{selected.customer_name}</p>
            <p className="text-xs text-muted-foreground">{selected.email} {selected.phone && `· ${selected.phone}`}</p>
            {selected.address && (
              <p className="mt-2 text-xs text-muted-foreground">
                {selected.address}, {selected.number} {selected.complement} — {selected.city}/{selected.state} · {selected.cep}
              </p>
            )}

            <div className="mt-4 grid gap-1 text-sm">
              {selected.items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.quantity}x {item.product_name}</span>
                  <span>{formatMoney(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-1 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatMoney(selected.subtotal)}</span></div>
              {Number(selected.discount) > 0 && <div className="flex justify-between text-muted-foreground"><span>Desconto</span><span>-{formatMoney(selected.discount)}</span></div>}
              <div className="flex justify-between text-muted-foreground"><span>Frete</span><span>{formatMoney(selected.shipping)}</span></div>
              <div className="flex justify-between font-serif text-lg"><span>Total</span><span>{formatMoney(selected.total)}</span></div>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Pagamento: {selected.payment_method}</p>
            </div>

            <label className="mt-6 block text-xs uppercase tracking-widest">Status
              <select
                value={selected.status}
                disabled={updating}
                onChange={(e) => updateStatus(e.target.value as OrderStatus)}
                className="mt-2 w-full border border-border bg-transparent p-3 disabled:opacity-50"
              >
                {ORDER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
          </>
        )}
      </aside>
    </div>
  )
}
