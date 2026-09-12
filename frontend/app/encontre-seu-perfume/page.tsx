'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import useSWR from 'swr'
import { ArrowRight } from 'lucide-react'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { fetchBackendProducts, type BackendProduct } from '@/lib/backend-api'
import { mapBackendProduct, favKey, type CatalogProduct } from '@/lib/catalog'
import { whatsappLink } from '@/lib/whatsapp'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

const QUESTIONS = [
  { id: 'tipo', question: 'Que tipo de fragrância você prefere?', options: ['Doce', 'Fresca', 'Elegante', 'Marcante', 'Amadeirada', 'Floral'] },
  { id: 'ocasiao', question: 'Quando você pretende usar?', options: ['Dia a dia', 'Trabalho', 'Encontro', 'Festa', 'Noite'] },
  { id: 'estilo', question: 'Qual estilo combina mais com você?', options: ['Delicado', 'Elegante', 'Sensual', 'Intenso', 'Moderno'] },
] as const

// Palavras-chave usadas para casar as respostas com dados reais dos produtos (família olfativa, notas,
// nome e descrição). A pergunta de ocasião não entra na pontuação porque o catálogo não tem esse dado
// cadastrado — usá-la pra pontuar seria inventar uma correspondência que não existe.
const KEYWORDS: Record<string, string[]> = {
  Doce: ['doce', 'gourmand', 'baunilha', 'âmbar', 'ambar', 'caramelo'],
  Fresca: ['fresc', 'cítric', 'citric', 'aquátic', 'aquatic', 'verde'],
  Elegante: ['elegante', 'floral', 'íris', 'iris', 'jasmim'],
  Marcante: ['marcante', 'intenso', 'especiad', 'couro'],
  Amadeirada: ['amadeirado', 'madeira', 'cedro', 'sândalo', 'sandalo', 'vetiver'],
  Floral: ['floral', 'flor', 'jasmim', 'peônia', 'peonia', 'rosa'],
  Delicado: ['delicad', 'suave', 'musk', 'almíscar', 'almiscar'],
  Sensual: ['sensual', 'âmbar', 'ambar', 'baunilha', 'almíscar', 'almiscar'],
  Intenso: ['intenso', 'especiad', 'couro', 'oud'],
  Moderno: ['moderno', 'cítric', 'citric', 'aromátic', 'aromatic'],
}

function matchText(product: CatalogProduct) {
  return [product.olfactory_family, product.note, product.name, product.description, product.top_notes, product.heart_notes, product.base_notes]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export default function EncontreSeuPerfumePage() {
  const { data: backendProducts } = useSWR<BackendProduct[]>('catalog-products', fetchBackendProducts, { revalidateOnFocus: false })
  const products = useMemo(() => (backendProducts ?? []).map(mapBackendProduct), [backendProducts])

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  function choose(questionId: string, option: string) {
    const next = { ...answers, [questionId]: option }
    setAnswers(next)
    setStep((s) => s + 1)
  }

  function restart() {
    setAnswers({})
    setStep(0)
  }

  const recommendations = useMemo(() => {
    if (step < QUESTIONS.length || products.length === 0) return []
    const activeKeywords = [answers.tipo, answers.estilo].filter(Boolean).flatMap((answer) => KEYWORDS[answer!] ?? [])
    const scored = products.map((product) => {
      const text = matchText(product)
      const score = activeKeywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0)
      return { product, score }
    })
    const withMatch = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score)
    // Sem correspondência nenhuma (catálogo com pouca descrição cadastrada): mostra os destaques reais em vez de nada
    const pool = withMatch.length > 0 ? withMatch : scored.sort((a, b) => (Number(b.product.best_seller) + Number(b.product.featured)) - (Number(a.product.best_seller) + Number(a.product.featured)))
    return pool.slice(0, 3).map((item) => item.product)
  }, [step, products, answers])

  const isResult = step >= QUESTIONS.length

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
        {!isResult && (
          <>
            <div className="mb-10 flex justify-center gap-2">
              {QUESTIONS.map((_, index) => (
                <span key={index} className={`h-px w-10 ${index <= step ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encontre seu perfume · {step + 1} de {QUESTIONS.length}</p>
            <h1 className="mb-10 text-center font-serif text-3xl leading-tight md:text-4xl">{QUESTIONS[step].question}</h1>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {QUESTIONS[step].options.map((option) => (
                <button key={option} onClick={() => choose(QUESTIONS[step].id, option)} className="border border-border px-4 py-6 text-sm uppercase tracking-[0.1em] transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">{option}</button>
              ))}
            </div>
            {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="mt-8 block text-center text-xs uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4">Voltar</button>}
          </>
        )}

        {isResult && (
          <div>
            <p className="mb-3 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Seu perfil olfativo</p>
            <h1 className="mb-4 text-center font-serif text-3xl leading-tight md:text-4xl">{answers.tipo}, {answers.estilo?.toLowerCase()} e ideal para {answers.ocasiao?.toLowerCase()}</h1>
            <p className="mx-auto mb-12 max-w-md text-center text-sm leading-6 text-muted-foreground">Com base nas suas respostas, estas são as fragrâncias do nosso catálogo que mais combinam com você.</p>

            {recommendations.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Ainda não temos produtos suficientes cadastrados para recomendar. Confira o catálogo completo.</p>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {recommendations.map((product) => (
                  <div key={favKey(product)} className="group">
                    <a href={product.code ? `/produto/${product.code}` : '/catalogo'} className="relative block aspect-[4/5] overflow-hidden bg-secondary">
                      <Image src={product.image} alt={product.name} fill className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]" />
                    </a>
                    <div className="mt-4">
                      <h3 className="font-serif text-lg">{product.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{product.note}</p>
                      <p className="mt-2 text-sm">{product.price}</p>
                      <a href={whatsappLink(product.name)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-accent-foreground underline underline-offset-4"><WhatsAppIcon size={12} /> Comprar</a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-14 flex flex-wrap justify-center gap-4">
              <a href="/catalogo" className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-transparent hover:text-primary">Ver catálogo completo <ArrowRight size={15} /></a>
              <button onClick={restart} className="text-xs uppercase tracking-[0.16em] text-muted-foreground underline underline-offset-4">Refazer o quiz</button>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  )
}
