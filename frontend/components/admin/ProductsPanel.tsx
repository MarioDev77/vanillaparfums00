'use client'
import { FormEvent, useEffect, useState } from 'react'
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { Category, Product, formatMoney, parseBrNumber } from './types'

const empty = {
  code: '', name: '', category_id: '', olfactory_family: '', description: '',
  top_notes: '', heart_notes: '', base_notes: '', fixation: '', projection: '',
  size_ml: '50', price: '', cost: '', min_stock: '5', status: 'available',
  featured: false, best_seller: false, image_url: '',
}

const inputClass = 'mt-2 w-full rounded-md border border-border bg-background/60 p-3 text-sm transition-colors focus:border-accent focus:outline-none'
const labelClass = 'block text-xs uppercase tracking-widest text-muted-foreground'

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  // Debounce da busca por texto pra não disparar uma requisição a cada tecla.
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput), 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (genderFilter) params.set('gender', genderFilter)
    if (categoryFilter) params.set('category_id', categoryFilter)
    const qs = params.toString() ? `?${params.toString()}` : ''
    const [productsData, categoriesData] = await Promise.all([
      adminJson<Product[]>(`/products${qs}`),
      adminJson<Category[]>('/categories'),
    ])
    setProducts(productsData)
    setCategories(categoriesData)
    setLoading(false)
  }

  useEffect(() => { load() }, [search, genderFilter, categoryFilter])

  function startEdit(product: Product) {
    setEditingId(product.id)
    setForm({
      code: product.code, name: product.name, category_id: String(product.category_id ?? ''),
      olfactory_family: product.olfactory_family ?? '', description: product.description ?? '',
      top_notes: product.top_notes ?? '', heart_notes: product.heart_notes ?? '', base_notes: product.base_notes ?? '',
      fixation: product.fixation ?? '', projection: product.projection ?? '', size_ml: String(product.size_ml ?? '50'),
      price: String(product.price ?? '').replace('.', ','), cost: String(product.cost ?? '').replace('.', ','),
      min_stock: String(product.min_stock ?? '5'), status: product.status,
      featured: !!product.featured, best_seller: !!product.best_seller, image_url: product.image_url ?? '',
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
    setUploading(true)
    setMessage('')
    try {
      const data = new FormData()
      data.append('file', file)
      const response = await adminFetch('/upload', { method: 'POST', body: data })
      const json = await response.json()
      if (response.ok) setForm((value) => ({ ...value, image_url: json.url }))
      else setMessage(json.error || 'Não foi possível enviar a imagem.')
    } catch {
      setMessage('Não foi possível enviar a imagem.')
    }
    setUploading(false)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const payload = {
      ...form,
      category_id: form.category_id ? Number(form.category_id) : null,
      size_ml: Number(form.size_ml) || 50,
      price: parseBrNumber(form.price),
      cost: parseBrNumber(form.cost),
      min_stock: Number(form.min_stock) || 5,
    }
    if (!payload.code || !payload.name || !payload.price) {
      setMessage('Código, nome e preço são obrigatórios.')
      setSaving(false)
      return
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
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <form onSubmit={save} className="h-fit rounded-xl bg-background p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">{editingId ? 'Editar produto' : 'Novo produto'}</h2>
          {editingId ? (
            <button type="button" onClick={cancelEdit} aria-label="Cancelar edição" className="rounded-full p-1 hover:bg-secondary"><X size={20} /></button>
          ) : (
            <Plus size={20} className="text-muted-foreground" />
          )}
        </div>

        <div className="mt-6 grid gap-5">
          <label className={labelClass}>Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
          </label>

          <label className={labelClass}>Código
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className={inputClass} />
          </label>

          <label className={labelClass}>Preço (R$)
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="89,90" inputMode="decimal" required className={inputClass} />
          </label>

          <label className={labelClass}>Categoria
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={inputClass}>
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.gender})</option>)}
            </select>
          </label>

          <label className={labelClass}>Família olfativa
            <input value={form.olfactory_family} onChange={(e) => setForm({ ...form, olfactory_family: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Descrição
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </label>

          <label className={labelClass}>Notas de saída
            <input value={form.top_notes} onChange={(e) => setForm({ ...form, top_notes: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Notas de coração
            <input value={form.heart_notes} onChange={(e) => setForm({ ...form, heart_notes: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Notas de fundo
            <input value={form.base_notes} onChange={(e) => setForm({ ...form, base_notes: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Tamanho (ml)
            <input value={form.size_ml} onChange={(e) => setForm({ ...form, size_ml: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Custo (R$)
            <input value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="30,00" inputMode="decimal" className={inputClass} />
          </label>

          <label className={labelClass}>Estoque mínimo
            <input value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className={inputClass} />
          </label>

          <label className={labelClass}>Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              <option value="available">Disponível</option>
              <option value="sold_out">Esgotado</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>

          <div className="flex flex-col gap-3 text-xs uppercase tracking-widest">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destaque</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.best_seller} onChange={(e) => setForm({ ...form, best_seller: e.target.checked })} /> Mais vendido</label>
          </div>

          <div>
            <span className={labelClass}>Foto do produto</span>
            {form.image_url ? (
              <div className="mt-2 flex items-center gap-3">
                <img src={form.image_url} alt="Prévia" className="h-20 w-20 rounded-md object-cover" />
                <label className="flex-1 cursor-pointer rounded-md border border-dashed border-border p-3 text-center text-xs uppercase tracking-widest hover:bg-secondary">
                  {uploading ? 'Enviando...' : 'Trocar foto'}
                  <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="sr-only" disabled={uploading} />
                </label>
              </div>
            ) : (
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-md border border-dashed border-border p-6 text-xs uppercase tracking-widest hover:bg-secondary">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                {uploading ? 'Enviando...' : 'Enviar foto'}
                <input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} className="sr-only" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        {message && <p className="mt-4 text-sm text-accent-foreground">{message}</p>}
        <button disabled={saving || uploading} className="mt-6 w-full rounded-md bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
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

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome ou código..."
            className="rounded-md border border-border bg-background/60 p-3 text-sm focus:border-accent focus:outline-none"
          />
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="rounded-md border border-border bg-background/60 p-3 text-sm">
            <option value="">Todos os gêneros</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="unissex">Unissex</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="rounded-md border border-border bg-background/60 p-3 text-sm">
            <option value="">Todas as categorias</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="rounded-xl bg-background p-3 shadow-sm">
                <div className="aspect-square overflow-hidden rounded-md bg-secondary">
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
                    <button onClick={() => startEdit(product)} className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-secondary"><Pencil size={12} /> Editar</button>
                    <button onClick={() => remove(product)} className="flex items-center gap-1 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-red-700 hover:bg-red-50"><Trash2 size={12} /> Remover</button>
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
