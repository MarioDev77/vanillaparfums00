import { Mail } from 'lucide-react'
import { whatsappLink } from '@/lib/whatsapp'
import { WhatsAppIcon } from '@/components/WhatsAppIcon'
import { InstagramIcon } from '@/components/InstagramIcon'

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
            <a href="/sobre" className="hover:text-accent">Sobre nós</a>
            <a href="/" className="hover:text-accent">Início</a>
          </nav>
        </div>
        <div className="text-xs uppercase tracking-[0.16em] text-primary-foreground/70">
          <p className="mb-4 text-primary-foreground">Atendimento</p>
          <nav className="flex flex-col gap-3">
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent"><WhatsAppIcon size={13} /> WhatsApp</a>
            <a href="https://www.instagram.com/vanilla.parfums01/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent"><InstagramIcon size={13} /> Instagram</a>
            <a href="mailto:vanillaparfumsofc@gmail.com" className="inline-flex items-center gap-2 hover:text-accent"><Mail size={13} strokeWidth={1.5} /> vanillaparfumsofc@gmail.com</a>
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
