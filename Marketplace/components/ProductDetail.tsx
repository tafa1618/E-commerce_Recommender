'use client'

import { Product } from '@/types/product'
import { useEffect } from 'react'
import Link from 'next/link'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  // Enregistrer la vue détaillée
  useEffect(() => {
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
          page: 'product_detail',
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch((err) => console.error('Error tracking view:', err))
  }, [product.product_id])

  const handleAddToCart = () => {
    fetch('/api/products/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: product.product_id,
        event_type: 'add_to_cart',
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
        source: 'web',
      }),
    }).catch((err) => console.error('Error tracking add_to_cart:', err))
  }

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600">
            Accueil
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link href="/products" className="text-gray-500 hover:text-primary-600">
            Produits
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.nom}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Image */}
          <div>
            {product.image ? (
              <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={product.image}
                  alt={product.nom}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center rounded-2xl bg-gray-100 text-9xl">
                🛍️
              </div>
            )}
          </div>

          {/* Informations */}
          <div>
            {/* Catégorie et marque */}
            <div className="mb-4 flex items-center gap-4">
              {product.categorie && (
                <span className="text-sm font-medium text-primary-600">
                  {product.categorie}
                </span>
              )}
              {product.marque && (
                <span className="text-sm text-gray-600">🏷️ {product.marque}</span>
              )}
            </div>

            {/* Nom */}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
              {product.nom}
            </h1>

            {/* Badge de validation */}
            {product.validated && product.validation_score !== undefined && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">
                <span className="text-green-600 font-semibold">
                  ✅ Validé Google Trends ({product.validation_score}/100)
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="mb-6">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {product.prix_texte || `${product.prix} FCFA`}
              </div>
              {product.remise && (
                <span className="text-lg font-medium text-red-600 bg-red-50 px-3 py-1 rounded">
                  -{product.remise}
                </span>
              )}
            </div>

            {/* Description SEO */}
            {product.description_seo && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: product.description_seo }}
                />
              </div>
            )}

            {/* Mots-clés */}
            {product.mots_cles && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Mots-clés SEO</h3>
                <div className="flex flex-wrap gap-2">
                  {product.mots_cles.split(',').map((keyword, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                🛒 Ajouter au panier
              </button>
              {product.lien && (
                <a
                  href={product.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg bg-white px-6 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 text-center transition-colors"
                >
                  🔗 Voir sur {product.source}
                </a>
              )}
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Informations</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Source</dt>
                  <dd className="font-medium text-gray-900">{product.source}</dd>
                </div>
                {product.note && (
                  <div>
                    <dt className="text-gray-500">Note</dt>
                    <dd className="font-medium text-gray-900">{product.note}</dd>
                  </div>
                )}
                {product.niche_level && (
                  <div>
                    <dt className="text-gray-500">Niveau de niche</dt>
                    <dd className="font-medium text-gray-900">{product.niche_level}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

