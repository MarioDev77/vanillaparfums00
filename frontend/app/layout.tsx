import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Playfair_Display } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import { FavoritesProvider } from '@/lib/favorites-context'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  title: 'Vanilla Parfums | Contratipos com identidade própria',
  description: 'Vanilla Parfums — perfumaria especializada em contratipos: fragrâncias femininas, masculinas e unissex com identidade própria. Compre pelo WhatsApp.',
  generator: 'v0.app',
  icons: { icon: '/vanilla-logo.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#211b17',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className="bg-background"><body className={`${geist.variable} ${playfair.variable} font-sans`}><FavoritesProvider><CartProvider>{children}</CartProvider></FavoritesProvider>{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
