'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Star, Check } from 'lucide-react'
import { useSessionId } from '@/hooks/useSessionId'

interface Product {
  product_id: string
  nom: string
  prix: number
  prix_texte: string
  image?: string
  categorie?: string
  validation_score?: number
  meta_description?: string
  marque?: string
  remise?: string
}

interface ShopGridProps {
  products: Product[]
  onAddToCart?: (productId: string) => void
}

export default function ShopGrid({ products, onAddToCart }: ShopGridProps) {
  const sessionId = useSessionId()
  const [addingProductId, setAddingProductId] = useState<string | null>(null)

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (onAddToCart) {
      onAddToCart(productId)
      return
    }

    if (!sessionId) {
      console.error('Session ID non disponible')
      return
    }

    setAddingProductId(productId)

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantite: 1,
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur lors de l\'ajout au panier')
      }

      // Succès - notification visuelle optionnelle
      console.log('✅ Produit ajouté au panier')
    } catch (err: any) {
      console.error('Erreur ajout au panier:', err)
      alert('Erreur: ' + (err.message || 'Impossible d\'ajouter au panier'))
    } finally {
      setAddingProductId(null)
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 sm:py-20">
        <p className="text-gray-600 text-base sm:text-lg mb-4">
          Aucun produit disponible pour le moment.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
        >
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <div
          key={product.product_id}
          className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg active:shadow-md transition-all touch-manipulation"
        >
          {/* Badge de validation */}
          {product.validation_score && product.validation_score >= 70 && (
            <div className="absolute top-2 left-2 z-10 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Validé</span>
            </div>
          )}

          {/* Badge de remise */}
          {product.remise && (
            <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{product.remise}
            </div>
          )}

          {/* Image du produit */}
          <Link href={`/products/${product.product_id}`} className="block">
            <div className="aspect-square bg-gray-100 relative overflow-hidden">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.nom}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-4xl">🛍️</span>
                </div>
              )}
            </div>
          </Link>

          {/* Informations produit */}
          <div className="p-3 sm:p-4">
            {/* Catégorie */}
            {product.categorie && (
              <p className="text-xs text-gray-500 mb-1 line-clamp-1">
                {product.categorie}
              </p>
            )}

            {/* Nom du produit */}
            <Link href={`/products/${product.product_id}`}>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] group-hover:text-primary-600 transition-colors">
                {product.nom}
              </h3>
            </Link>

            {/* Marque */}
            {product.marque && (
              <p className="text-xs text-gray-500 mb-2">🏷️ {product.marque}</p>
            )}

            {/* Prix - Mise en avant pour la vente */}
            <div className="mb-3">
              <p className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {product.prix_texte || `${product.prix.toLocaleString('fr-FR')} FCFA`}
              </p>
            </div>

            {/* Bouton CTA - Optimisé pour la vente */}
            <button
              onClick={(e) => handleAddToCart(e, product.product_id)}
              disabled={addingProductId === product.product_id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-black text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
            >
              {addingProductId === product.product_id ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ajout...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Ajouter</span>
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

