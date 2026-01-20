import { Metadata } from 'next'
import { Suspense } from 'react'
import AdminLayout from '@/components/AdminLayout'
import EditProductForm from '@/components/EditProductForm'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Modifier le produit - Administration - Tafa Business',
  description: 'Modifier un produit du marketplace',
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    // Utiliser la même méthode que la page produit qui fonctionne
    // Récupérer tous les produits et filtrer par ID
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    const res = await fetch(`${apiUrl}/api/marketplace/products?status=active&limit=1000`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(`❌ API returned ${res.status} for products list`)
      return null
    }

    const data = await res.json()
    const products = data.produits || []
    
    // Trouver le produit avec le bon ID
    const product = products.find((p: any) => p.product_id === id)
    
    if (!product) {
      console.error(`❌ Product ${id} not found in products list`)
      return null
    }

    console.log(`✅ Product found: ${product.nom}`)
    return product
  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error)
    return null
  }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  return (
    <AdminLayout>
      <Suspense fallback={
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      }>
        <EditProductForm product={product} />
      </Suspense>
    </AdminLayout>
  )
}
