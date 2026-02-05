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
    // On utilise désormais le backend marketplace dédié (port 8001)
    const apiUrl = process.env.MARKETPLACE_API_URL || 'http://localhost:8001'
    
    // Essayer d'abord de récupérer directement le produit par ID
    try {
      const directRes = await fetch(`${apiUrl}/api/marketplace/products/${id}`, {
        // Pas de cache côté produit individuel pour éviter les incohérences
        cache: 'no-store',
      })
      
      if (directRes.ok) {
        const directData = await directRes.json()
        // Le backend retourne { success, produit: {...} }
        const produit = directData.produit || directData.product
        if (directData.success && produit) {
          return produit as Product
        }
      }
    } catch (directError) {
      console.log('Direct fetch failed, trying list method:', directError)
    }
    
    // Fallback : récupérer tous les produits actifs et chercher
    const res = await fetch(`${apiUrl}/api/marketplace/products?status=active`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(`❌ API error: ${res.status} ${res.statusText}`)
      return null
    }

    const data = await res.json()
    console.log(`📦 ${data.produits?.length || 0} produits récupérés`)
    const product = (data.produits || []).find((p: Product) => p.product_id === id)
    
    if (!product) {
      console.error(`❌ Produit ${id} non trouvé dans la liste des produits actifs`)
      // Afficher quelques IDs pour déboguer
      if (data.produits && data.produits.length > 0) {
        console.log(`📋 IDs disponibles (premiers 5): ${data.produits.slice(0, 5).map((p: Product) => p.product_id).join(', ')}...`)
      }
    } else {
      console.log(`✅ Produit trouvé dans la liste: ${id}`)
    }
    
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
