import { Metadata } from 'next'
import ProductGrid from '@/components/ProductGrid'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Produits - Tafa Business',
  description: 'Découvrez notre sélection de produits de qualité sur tafa-business.com',
}

async function getProducts() {
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/marketplace/products?status=active&limit=100`, {
      next: { revalidate: 60 }, // Revalider toutes les 60 secondes
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await res.json()
    return data.produits || []
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="py-12 md:py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Nos Produits
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
            </p>
          </div>

          <ProductGrid products={products} />
        </div>
      </section>

      <Footer />
    </main>
  )
}

