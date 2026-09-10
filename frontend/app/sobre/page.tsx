import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'

export const metadata: Metadata = {
  title: 'Sobre nós | Vanilla Parfums',
  description: 'Conheça a proposta da Vanilla Parfums: perfumaria especializada em contratipos, com identidade própria.',
}

function Placeholder({ children }: { children: string }) {
  return <p className="border border-dashed border-accent/60 bg-accent/5 px-4 py-3 text-sm italic text-muted-foreground">[Placeholder — {children}]</p>
}

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="mx-auto max-w-3xl px-5 py-20 lg:px-10">
        <p className="mb-4 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Sobre nós</p>
        <h1 className="mb-10 text-center font-serif text-4xl leading-tight md:text-5xl">A essência por trás da Vanilla</h1>

        <div className="flex flex-col gap-10">
          <div>
            <h2 className="mb-3 font-serif text-xl">Origem da marca</h2>
            <Placeholder>substitua por como e quando a Vanilla Parfums começou</Placeholder>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Propósito</h2>
            <Placeholder>substitua pelo motivo de a marca existir — o que ela resolve pra quem compra</Placeholder>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Visão</h2>
            <Placeholder>substitua pelo que a Vanilla Parfums quer se tornar no futuro</Placeholder>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Valores</h2>
            <Placeholder>substitua pelos 3-4 valores que guiam o negócio (ex.: transparência, acessibilidade, curadoria)</Placeholder>
          </div>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-center text-sm leading-6 text-muted-foreground">
          Enquanto essas informações não são definidas, o compromisso da Vanilla Parfums é o mesmo de sempre: fragrâncias contratipo com identidade própria, sem prometer o que não pode cumprir.
        </p>

        <div className="mt-10 text-center">
          <a href="/catalogo" className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-transparent hover:text-primary">Explorar catálogo <ArrowRight size={15} /></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
