import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--color-primary-dark)' }}>
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--color-text-on-light)' }}>
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 transition-colors"
          >
            Voir les produits
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}

