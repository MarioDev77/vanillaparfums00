import type { Metadata } from 'next'
import { ArrowRight, Instagram, Mail, MessageCircle } from 'lucide-react'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { whatsappLink } from '@/lib/whatsapp'

export const metadata: Metadata = {
  title: 'Sobre nós | Vanilla Parfums',
  description: 'Conheça a proposta da Vanilla Parfums: perfumaria especializada em contratipos, com identidade própria.',
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
            <p className="text-sm leading-7 text-muted-foreground">A Vanilla Parfums nasceu da vontade de aproximar as pessoas de fragrâncias inspiradas nos grandes clássicos internacionais, sem que o preço da grife fosse o que decide quem pode ou não sentir aquela essência. A partir do estudo cuidadoso de composições de referência, começamos a recriar contratipos com identidade própria, boa fixação e projeção — sem usar nomes, logotipos ou embalagens das marcas originais.</p>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Propósito</h2>
            <p className="text-sm leading-7 text-muted-foreground">Existimos para tornar a experiência de um perfume marcante acessível no dia a dia. Quem compra na Vanilla Parfums paga pela fragrância e pela qualidade — não pela grife — e ainda assim leva uma essência pensada com o mesmo cuidado dos perfumes que a inspiraram.</p>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Visão</h2>
            <p className="text-sm leading-7 text-muted-foreground">Queremos ser a primeira escolha de quem busca contratipos de confiança no Brasil, ampliando aos poucos o catálogo com novas fragrâncias e cuidados. Como próximo passo, também estamos avaliando passar a oferecer perfumes originais das marcas de referência, além dos contratipos, para atender quem busca as duas opções em um só lugar.</p>
          </div>
          <div>
            <h2 className="mb-3 font-serif text-xl">Valores</h2>
            <ul className="grid gap-3 text-sm leading-7 text-muted-foreground sm:grid-cols-2">
              <li><span className="font-serif text-foreground">Transparência</span> — deixamos claro que somos contratipos, sem prometer o que não somos.</li>
              <li><span className="font-serif text-foreground">Acessibilidade</span> — a mesma essência, por um preço justo.</li>
              <li><span className="font-serif text-foreground">Curadoria</span> — cada fragrância é escolhida com critério, não é volume por volume.</li>
              <li><span className="font-serif text-foreground">Atendimento próximo</span> — sempre a um WhatsApp de distância pra tirar dúvidas.</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-10">
          <h2 className="mb-6 text-center font-serif text-xl">Fale com a gente</h2>
          <div className="flex flex-col items-center gap-4 text-sm">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent-foreground"><MessageCircle size={15} strokeWidth={1.5} /> WhatsApp</a>
            <a href="mailto:vanillaparfumsofc@gmail.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent-foreground"><Mail size={15} strokeWidth={1.5} /> vanillaparfumsofc@gmail.com</a>
            <a href="https://www.instagram.com/vanilla.parfums01/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent-foreground"><Instagram size={15} strokeWidth={1.5} /> @vanilla.parfums01</a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <a href="/catalogo" className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-transparent hover:text-primary">Explorar catálogo <ArrowRight size={15} /></a>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
