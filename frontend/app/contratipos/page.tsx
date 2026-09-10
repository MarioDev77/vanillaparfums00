import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { whatsappLink } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'O que são contratipos? | Vanilla Parfums',
  description: 'Entenda de forma transparente o que são contratipos, como a Vanilla Parfums desenvolve suas fragrâncias e a diferença entre um perfume original e um contratipo.',
}

const STEPS = ['Referência olfativa', 'Estudo das características', 'Desenvolvimento da fragrância', 'Vanilla Parfums']

const REASONS = [
  { title: 'Preço mais acessível', text: 'Você paga pela fragrância, não pela grife, pela campanha publicitária ou pela embalagem de luxo.' },
  { title: 'Diversidade de fragrâncias', text: 'Uma seleção ampla, com diferentes perfis olfativos para explorar sem compromisso.' },
  { title: 'Identidade própria', text: 'Cada fragrância Vanilla Parfums tem nome, apresentação e identidade próprias.' },
  { title: 'Possibilidade de experimentar', text: 'Conheça diferentes estilos olfativos antes de decidir qual combina mais com você.' },
]

const COMPARISON = [
  { label: 'Origem', original: 'Desenvolvido e registrado por uma grife internacional.', contratipo: 'Desenvolvido pela Vanilla Parfums, inspirado em uma referência olfativa.' },
  { label: 'Identidade', original: 'Nome, marca e embalagem da grife original.', contratipo: 'Nome, marca e embalagem próprios da Vanilla Parfums.' },
  { label: 'Embalagem', original: 'Embalagem oficial da grife, com custo de marketing embutido.', contratipo: 'Embalagem própria, com foco na fragrância.' },
  { label: 'Proposta', original: 'Vender a experiência da marca e do status associado a ela.', contratipo: 'Oferecer uma experiência olfativa semelhante, com identidade própria.' },
  { label: 'Preço', original: 'Inclui custos de marca, publicidade e distribuição internacional.', contratipo: 'Preço mais acessível, sem os custos de uma grife internacional.' },
]

export default function ContratiposPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-5 py-20 text-center lg:px-10">
        <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Transparência</p>
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">O que são contratipos?</h1>
        <p className="mt-6 text-sm leading-7 text-muted-foreground">Contratipos são fragrâncias desenvolvidas como releituras olfativas inspiradas em perfumes conhecidos. A proposta é oferecer uma experiência olfativa semelhante, utilizando identidade e apresentação próprias.</p>
        <p className="mt-8 border-t border-border pt-6 text-sm font-medium leading-7">A Vanilla Parfums não comercializa perfumes originais de outras marcas. Nossas fragrâncias são contratipos e possuem identidade própria.</p>
      </section>

      <section aria-label="Como desenvolvemos" className="bg-primary px-5 py-20 text-primary-foreground lg:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="mb-10 text-center text-[10px] uppercase tracking-[0.3em] text-accent">Como desenvolvemos</p>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            {STEPS.map((step, index) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center border border-accent font-serif text-sm text-accent">{index + 1}</span>
                <p className="text-xs uppercase tracking-[0.14em] text-primary-foreground/80">{step}</p>
                {index < STEPS.length - 1 && <ArrowRight size={16} className="mt-1 hidden text-primary-foreground/30 sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Por que escolher um contratipo" className="mx-auto max-w-6xl px-5 py-20 lg:px-10">
        <h2 className="mb-12 text-center font-serif text-3xl md:text-4xl">Por que escolher um contratipo?</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((reason) => (
            <div key={reason.title} className="border-t border-accent pt-5">
              <h3 className="font-serif text-lg">{reason.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Original vs contratipo" className="mx-auto max-w-4xl px-5 py-20 lg:px-10">
        <h2 className="mb-3 text-center font-serif text-3xl md:text-4xl">Perfume original x contratipo</h2>
        <p className="mx-auto mb-12 max-w-xl text-center text-sm leading-6 text-muted-foreground">Uma comparação neutra e transparente, sem diminuir outras marcas.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-3 pr-4">Critério</th>
                <th className="py-3 pr-4">Perfume original</th>
                <th className="py-3">Contratipo Vanilla Parfums</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.label} className="border-b border-border align-top">
                  <td className="py-4 pr-4 font-serif text-base">{row.label}</td>
                  <td className="py-4 pr-4 text-muted-foreground">{row.original}</td>
                  <td className="py-4 text-muted-foreground">{row.contratipo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-primary px-5 py-16 text-center text-primary-foreground lg:py-20">
        <h2 className="font-serif text-3xl md:text-4xl">Ainda tem dúvidas?</h2>
        <p className="mt-3 text-sm text-primary-foreground/75">Fale com a gente pelo WhatsApp antes de comprar.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/catalogo" className="inline-flex items-center gap-2 border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-foreground transition hover:bg-transparent hover:text-primary-foreground">Explorar catálogo <ArrowRight size={15} /></a>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-primary-foreground/30 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:border-accent hover:text-accent">Falar no WhatsApp</a>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
