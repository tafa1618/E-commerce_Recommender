import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tafa Business - Marketplace',
  description: 'Votre marketplace de confiance pour tous vos besoins',
  metadataBase: new URL('https://tafa-business.com'),
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
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

