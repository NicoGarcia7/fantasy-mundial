import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Fantasy Mundial 2026 — Arma tu Equipo',
    template: '%s | Fantasy Mundial 2026',
  },
  description:
    'El juego de fantasy football más viral del Mundial 2026. Arma tu equipo, desafía a tus amigos y sigue los puntos en vivo.',
  keywords: ['fantasy football', 'mundial 2026', 'world cup', 'fantasy futbol', 'ligas'],
  authors: [{ name: 'Fantasy Mundial' }],
  openGraph: {
    title: 'Fantasy Mundial 2026',
    description: 'Arma tu equipo del mundial y compite con tus amigos.',
    type: 'website',
    locale: 'es_AR',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fantasy Mundial 2026',
    description: 'Arma tu equipo del mundial y compite con tus amigos.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fantasy Mundial',
  },
}

export const viewport: Viewport = {
  themeColor: '#04080F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${oswald.variable}`} suppressHydrationWarning>
      <body className="bg-[#04080F] text-slate-100 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#07111E',
              border: '1px solid rgba(201,168,68,0.3)',
              color: '#F1F5F9',
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  )
}
