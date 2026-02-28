import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import './globals.css'

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tafa Business - Marketplace',
  description: 'Votre marketplace de confiance pour tous vos besoins',
  metadataBase: new URL('https://tafa-business.com'),
  icons: {
    icon: '/logo-Tafa.png',
    shortcut: '/logo-Tafa.png',
    apple: '/logo-Tafa.png',
  },
  openGraph: {
    title: 'Tafa Business - Marketplace',
    description: 'Votre marketplace de confiance pour tous vos besoins',
    type: 'website',
    images: ['/logo-Tafa.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={rubik.variable}>
      <body className="font-rubik">{children}</body>
    </html>
  )
}

