'use client'
import { FormEvent, useEffect, useState } from 'react'
import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { Category, Product, formatMoney } from './types'

const empty = {
  code: '', name: '', category_id: '', olfactory_family: '', description: '',
  top_notes: '', heart_notes: '', base_notes: '', fixation: '', projection: '',
  size_ml: '50', price: '', cost: '', min_stock: '5', status: 'available',
  featured: false, best_seller: false, image_url: '',
}

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [productsData, categoriesData] = await Promise.all([
      adminJson<Product[]>('/products'),
      adminJson<Category[]>('/categories'),
    ])
    setProducts(productsData)
    setCategories(categoriesData)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      code: product.code, name: product.name, category_id: String(product.category_id ?? ''),
      olfactory_family: product.olfactory_family ?? '', description: product.description ?? '',
      top_notes: product.top_notes ?? '', heart_notes: product.heart_notes ?? '', base_notes: product.base_notes ?? '',
      fixation: product.fixation ?? '', projection: product.projection ?? '', size_ml: String(product.size_ml ?? '50'),
      price: String(product.price ?? ''), cost: String(product.cost ?? ''), min_stock: String(product.min_stock ?? '5'),
      status: product.status, featured: !!product.featured, best_seller: !!product.best_seller,
      image_url: product.image_url ?? '',
    })
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(empty)
    setMessage('')
  }

  async function upload(file?: File) {
    if (!file) return
    const data = new FormData()
    data.append('file', file)
    const response = await adminFetch('/upload', { method: 'POST', body: data })
    const json = await response.json()
    if (response.ok) setForm((value) => ({ ...value, image_url: json.url }))
    else setMessage(json.error)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      size_ml: Number(form.size_ml) || 50,
      price: Number(form.price),
      cost: Number(form.cost) || 0,
      min_stock: Number(form.min_stock) || 5,
    }
    try {
      if (editingId) {
        await adminJson(`/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) })
        setMessage('Produto atualizado com sucesso.')
      } else {
        await adminJson('/products', { method: 'POST', body: JSON.stringify(payload) })
        setMessage('Produto cadastrado com sucesso.')
      }
      cancelEdit()
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar produto.')
    }
    setSaving(false)
  }

  async function remove(product: Product) {
    if (!confirm(`Remover "${product.name}"? Essa ação não pode ser desfeita.`)) return
    try {
      await adminFetch(`/products/${product.id}`, { method: 'DELETE' })
      setProducts((value) => value.filter((p) => p.id !== product.id))
    } catch {
      setMessage('Não foi possível remover o produto.')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit bg-background p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{editingId ? 'Editar produto' : 'Novo produto'}</h2>
          {editingId ? (
            <button type="button" onClick={cancelEdit} aria-label="Cancelar edição"><X size={20} /></button>
          ) : (
            <Plus size={20} />
          )}
        </div>
        <div className="mt-6 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs uppercase tracking-widest">Código
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Preço (R$)
              <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="89.90" required className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
          </div>
          <label className="text-xs uppercase tracking-widest">Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">Categoria
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3">
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>)}
            </select>
          </label>
          <label className="text-xs uppercase tracking-widest">Família olfativa
            <input value={form.olfactory_family} onChange={(e) => setForm({ ...form, olfactory_family: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">Descrição
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <div className="grid gap-3">
            <label className="text-xs uppercase tracking-widest">Notas de saída
              <input value={form.top_notes} onChange={(e) => setForm({ ...form, top_notes: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Notas de coração
              <input value={form.heart_notes} onChange={(e) => setForm({ ...form, heart_notes: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Notas de fundo
              <input value={form.base_notes} onChange={(e) => setForm({ ...form, base_notes: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <label className="text-xs uppercase tracking-widest">Tamanho (ml)
              <input value={form.size_ml} onChange={(e) => setForm({ ...form, size_ml: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Custo (R$)
              <input value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
            <label className="text-xs uppercase tracking-widest">Estoque mín.
              <input value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3" />
            </label>
          </div>
          <label className="text-xs uppercase tracking-widest">Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3">
              <option value="available">Disponível</option>
              <option value="sold_out">Esgotado</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>
          <div className="flex gap-6 text-xs uppercase tracking-widest">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destaque</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} /> Mais vendido</label>
          </div>
          <label className="flex cursor-pointer items-center gap-3 border border-dashed border-border p-4 text-xs uppercase tracking-widest">
            <ImagePlus size={18} />{form.image_url ? 'Imagem carregada' : 'Enviar foto'}
            <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="sr-only" />
          </label>
        </div>
        {message && <p className="mt-4 text-sm text-accent-foreground">{message}</p>}
        <button disabled={saving} className="mt-6 w-full bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50">
          {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar produto'}
        </button>
      </form>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Conectado ao backend Express</p>
            <h2 className="mt-2 font-serif text-3xl">Produtos cadastrados</h2>
          </div>
          <span className="text-sm text-muted-foreground">{products.length} itens</span>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="bg-background p-3">
                <div className="aspect-square bg-secondary">
                  {product.image_url && <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />}
                </div>
                <div className="p-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{product.category_name || 'Sem categoria'}</p>
                    <span className={`text-[10px] uppercase tracking-widest ${product.status === 'available' ? 'text-accent-foreground' : 'text-red-700'}`}>
                      {product.status === 'available' ? 'Disponível' : product.status === 'sold_out' ? 'Esgotado' : 'Inativo'}
                    </span>
                  </div>
                  <h3 className="mt-1 font-serif text-xl">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">Cód. {product.code} · Estoque: {product.stock_quantity}</p>
                  <p className="mt-2 text-sm">{formatMoney(product.price)}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => startEdit(product)} className="flex items-center gap-1 border border-border px-3 py-2 text-[10px] uppercase tracking-widest"><Pencil size={12} /> Editar</button>
                    <button onClick={() => remove(product)} className="flex items-center gap-1 border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-red-700"><Trash2 size={12} /> Remover</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
