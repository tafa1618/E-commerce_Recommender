import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductDetail from '@/components/ProductDetail'

const API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:8000'

async function getProduct(productId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/marketplace/products?status=active`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await res.json()
    const product = data.produits?.find((p: any) => p.product_id === productId)
    return product || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id)

  if (!product) {
    return {
      title: 'Produit non trouvé - Tafa Business',
    }
  }

  return {
    title: `${product.nom} - Tafa Business`,
    description: product.meta_description || product.nom,
    keywords: product.mots_cles || '',
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <ProductDetail product={product} />
      <Footer />
    </main>
  )
}

