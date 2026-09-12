'use client'
import Image from 'next/image'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'

function formatMoney(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default function CartPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  function checkoutMessage() {
    const lines = items.map((item) => `${item.quantity}x ${item.name}${item.size_ml ? ` ${item.size_ml}ml` : ''} — ${formatMoney(item.price * item.quantity)}`)
    return `Olá! Gostaria de realizar um pedido na Vanilla Parfums:\n\n${lines.join('\n')}\n\nTotal: ${formatMoney(subtotal)}\n\nGostaria de saber as formas de pagamento e entrega.`
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-50 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Carrinho de compras">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="font-serif text-xl">Seu carrinho</h2>
          <button aria-label="Fechar carrinho" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <ul className="flex flex-col gap-6">
              {items.map((item) => (
                <li key={item.code} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-secondary">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <p className="font-serif text-sm">{item.name}</p>
                    {item.size_ml && <p className="text-xs text-muted-foreground">{item.size_ml}ml</p>}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-border px-2 py-1">
                        <button aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.code, item.quantity - 1)}><Minus size={13} /></button>
                        <span className="w-4 text-center text-xs">{item.quantity}</span>
                        <button aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.code, item.quantity + 1)}><Plus size={13} /></button>
                      </div>
                      <p className="text-sm">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  <button aria-label={`Remover ${item.name}`} onClick={() => removeItem(item.code)} className="text-muted-foreground hover:text-red-700"><Trash2 size={16} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-6">
            <div className="mb-5 flex items-center justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-serif text-lg">{formatMoney(subtotal)}</span></div>
            <a
              href={`/api/whatsapp?text=${encodeURIComponent(checkoutMessage())}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:opacity-90"
            >
              <WhatsAppIcon size={16} /> Finalizar pedido pelo WhatsApp
            </a>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">Você vai confirmar o pedido diretamente no WhatsApp.</p>
          </div>
        )}
      </aside>
    </>
  )
}
