import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Contratipos | A mesma essência por um preço justo',
  description: 'Catálogo de perfumes contratipos, fragrâncias femininas, masculinas e cremes. Compre pelo WhatsApp.',
  generator: 'v0.app',
  icons: { icon: '/vanilla-logo.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#211b17',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="bg-background"><body className={`${geist.variable} ${playfair.variable} font-sans`}>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
