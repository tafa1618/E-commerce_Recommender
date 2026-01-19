'use client'

import { Product } from '@/types/product'
import Link from 'next/link'
import { useEffect } from 'react'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  // Enregistrer les vues pour le tracking ML
  useEffect(() => {
    products.forEach((product) => {
      // Enregistrer l'événement "view" de manière asynchrone
      fetch('/api/products/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.product_id,
          event_type: 'view',
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          source: 'web',
          metadata: {
            page: 'products',
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch((err) => console.error('Error tracking view:', err))
    })
  }, [products])

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg">Aucun produit disponible pour le moment.</p>
        <Link
          href="/"
          className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
        >
          Retour à l'accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <Link
          key={product.product_id}
          href={`/products/${product.product_id}`}
          className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-white border border-gray-200 p-4 sm:p-5 md:p-6 transition-all active:shadow-lg active:-translate-y-0.5 touch-manipulation"
          onClick={() => {
            // Enregistrer le clic
            fetch('/api/products/track', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: product.product_id,
                event_type: 'click',
                device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                source: 'web',
              }),
            }).catch((err) => console.error('Error tracking click:', err))
          }}
        >
          {/* Image du produit */}
          {product.image ? (
            <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.image}
                alt={product.nom}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-square mb-4 flex items-center justify-center rounded-lg bg-gray-100 text-6xl group-hover:bg-gray-200 transition-colors">
              🛍️
            </div>
          )}

          {/* Badge de validation Google Trends */}
          {product.validated && product.validation_score !== undefined && (
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              ✅ {product.validation_score}/100
            </div>
          )}

          {/* Catégorie */}
          {product.categorie && (
            <div className="mb-2 text-xs font-medium text-primary-600">
              {product.categorie}
            </div>
          )}

          {/* Nom du produit */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
            {product.nom}
          </h3>

          {/* Marque */}
          {product.marque && (
            <p className="text-sm text-gray-500 mb-2">🏷️ {product.marque}</p>
          )}

          {/* Prix */}
          <div className="mt-3 sm:mt-4 flex items-center justify-between">
            <div className="text-lg sm:text-xl font-bold text-gray-900">
              {product.prix_texte || `${product.prix} FCFA`}
            </div>
            {product.remise && (
              <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                -{product.remise}
              </span>
            )}
          </div>

          {/* Meta description (aperçu) */}
          {product.meta_description && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {product.meta_description}
            </p>
          )}
        </Link>
      ))}
    </div>
  )
}

