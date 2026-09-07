'use client'
import { FormEvent, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { adminFetch, adminJson } from '@/lib/admin-client'
import { Category } from './types'

export default function CategoriesPanel() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', slug: '', gender: 'unissex' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    setCategories(await adminJson<Category[]>('/categories'))
  }
  useEffect(() => { load() }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await adminJson('/categories', { method: 'POST', body: JSON.stringify(form) })
      setForm({ name: '', slug: '', gender: 'unissex' })
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar categoria.')
    }
    setSaving(false)
  }

  async function remove(category: Category) {
    if (!confirm(`Remover a categoria "${category.name}"?`)) return
    await adminFetch(`/categories/${category.id}`, { method: 'DELETE' })
    setCategories((value) => value.filter((c) => c.id !== category.id))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="h-fit rounded-xl bg-background p-6 shadow-sm">
        <h2 className="font-serif text-2xl">Nova categoria</h2>
        <div className="mt-6 grid gap-4">
          <label className="text-xs uppercase tracking-widest">Nome
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">Slug
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="masculino-arabe" required className="mt-2 w-full border border-border bg-transparent p-3" />
          </label>
          <label className="text-xs uppercase tracking-widest">Gênero
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-2 w-full border border-border bg-transparent p-3">
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="unissex">Unissex</option>
            </select>
          </label>
        </div>
        {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
        <button disabled={saving} className="mt-6 w-full bg-primary p-3 text-xs uppercase tracking-widest text-primary-foreground disabled:opacity-50">
          {saving ? 'Salvando...' : 'Cadastrar categoria'}
        </button>
      </form>

      <section>
        <h2 className="mb-5 font-serif text-3xl">Categorias cadastradas</h2>
        <div className="grid gap-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-xl bg-background p-4 shadow-sm">
              <div>
                <p className="font-serif text-lg">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug} · {category.gender}</p>
              </div>
              <button onClick={() => remove(category)} aria-label="Remover categoria" className="text-red-700"><Trash2 size={16} /></button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>}
        </div>
      </section>
    </div>
  )
}
