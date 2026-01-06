import { Metadata } from 'next'
import ProductDetail from '@/components/ProductDetail'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { notFound } from 'next/navigation'

interface Product {
  product_id: string
  nom: string
  description_seo?: string
  meta_description?: string
  prix: number
  prix_texte: string
  image?: string
  categorie: string
  validation_score?: number
  mots_cles?: string
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/marketplace/products?status=active`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    const product = (data.produits || []).find((p: Product) => p.product_id === id)
    return product || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  
  if (!product) {
    return {
      title: 'Produit non trouvé - Tafa Business',
    }
  }

  return {
    title: `${product.nom} - Tafa Business`,
    description: product.meta_description || product.nom,
    openGraph: {
      title: product.nom,
      description: product.meta_description || product.nom,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)

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
