import { MessageCircle } from 'lucide-react'
import { whatsappLink } from './SiteHeader'

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div><p className="font-serif text-2xl">Vanilla Parfums</p><p className="mt-3 max-w-[220px] text-sm text-primary-foreground/70">Sua essência. Sua presença.</p></div>
        <div className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">
          <p className="mb-4 text-primary-foreground">Navegue</p>
          <nav className="flex flex-col gap-3">
            <a href="/catalogo" className="hover:text-accent">Catálogo</a>
            <a href="/contratipos" className="hover:text-accent">Contratipos</a>
            <a href="/encontre-seu-perfume" className="hover:text-accent">Encontre seu perfume</a>
            <a href="/" className="hover:text-accent">Início</a>
          </nav>
        </div>
        <div className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">
          <p className="mb-4 text-primary-foreground">Atendimento</p>
          <nav className="flex flex-col gap-3">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent"><MessageCircle size={14} /> WhatsApp</a>
            <span className="text-primary-foreground/40">Instagram (em breve)</span>
            <span className="text-primary-foreground/40">E-mail (em breve)</span>
          </nav>
        </div>
        <div className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">
          <p className="mb-4 text-primary-foreground">Vanilla Parfums</p>
          <p className="normal-case tracking-normal text-primary-foreground/60">Fragrâncias contratipo com identidade própria. Não comercializamos perfumes originais de outras marcas.</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 px-5 py-6 text-center text-[10px] uppercase tracking-[0.16em] text-primary-foreground/50 lg:px-10">© {new Date().getFullYear()} Vanilla Parfums — Todos os direitos reservados</div>
    </footer>
  )
}
