'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Heart, Share2, Check, Star } from 'lucide-react'

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

interface RelatedProduct {
  product_id: string
  nom: string
  prix_texte: string
  image?: string
  categorie: string
}

export default function ProductDetail({ product }: { product: Product }) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  // Charger les produits similaires (cross-selling)
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const res = await fetch(`/api/products?categorie=${encodeURIComponent(product.categorie)}&limit=4`)
        if (res.ok) {
          const data = await res.json()
          // Filtrer le produit actuel
          const related = (data.produits || []).filter(
            (p: Product) => p.product_id !== product.product_id
          ).slice(0, 4)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error('Error fetching related products:', error)
      } finally {
        setLoading(false)
      }
    }

    if (product.categorie) {
      fetchRelatedProducts()
    }
  }, [product])

  const handleAddToCart = () => {
    // TODO: Implémenter l'ajout au panier
    console.log('Ajouter au panier:', product.product_id)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.nom,
        text: product.meta_description || product.nom,
        url: window.location.href,
      })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Section principale produit - mobile-first */}
      <section className="py-4 sm:py-6 md:py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
          {/* Mobile-first: empiler verticalement sur mobile */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
            {/* Image produit - en haut sur mobile */}
            <div className="relative order-1">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.nom}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">Image non disponible</span>
                  </div>
                )}
              </div>
              
              {/* Badge validation - plus petit sur mobile */}
              {product.validation_score && product.validation_score > 0 && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Validé </span>{product.validation_score}/100
                </div>
              )}
            </div>

            {/* Informations produit - en bas sur mobile */}
            <div className="flex flex-col justify-center order-2">
              {/* Catégorie */}
              <div className="text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                {product.categorie}
              </div>

              {/* Titre - taille réduite sur mobile */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-text-on-light)' }}>
                {product.nom}
              </h1>

              {/* Prix - taille réduite sur mobile */}
              <div className="mb-4 sm:mb-6">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                  {product.prix_texte || `${product.prix.toLocaleString()} CFA`}
                </div>
                {product.validation_score && product.validation_score >= 70 && (
                  <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-gray)' }}>
                    ✅ Produit validé et recommandé
                  </div>
                )}
              </div>

              {/* Actions - empilées sur mobile */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-black text-white text-sm sm:text-base font-semibold rounded-lg active:bg-gray-800 transition-colors touch-manipulation"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ajouter au panier
                </button>
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-4 border-2 rounded-lg transition-colors touch-manipulation ${
                      isFavorite
                        ? 'bg-red-50 border-red-500 text-red-600'
                        : 'border-gray-300 active:border-gray-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 mx-auto ${isFavorite ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-none px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-300 rounded-lg active:border-gray-400 transition-colors touch-manipulation"
                  >
                    <Share2 className="w-5 h-5 mx-auto" />
                  </button>
                </div>
              </div>

              {/* Points clés */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-on-light)' }}>
                  Points clés
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-gray)' }}>Livraison rapide en 24-48h</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-gray)' }}>Retour accepté sous 30 jours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-gray)' }}>Paiement sécurisé</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-gray)' }}>Support client 24/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section description - mobile-first avec scroll */}
      <section className="py-6 sm:py-8 md:py-12 bg-gray-50">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-text-on-light)' }}>
            Description du produit
          </h2>
          
          {/* Conteneur scrollable avec bordure */}
          <div 
            className="bg-white rounded-lg border-2 border-gray-200 shadow-sm p-4 sm:p-6 md:p-8 scrollable-content"
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              overflowX: 'hidden'
            }}
          >
            <div 
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none"
              style={{ 
                color: 'var(--color-text-on-light)',
                lineHeight: '1.8'
              }}
            >
              {product.description_seo ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: product.description_seo }}
                  className="text-gray-700 leading-relaxed"
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.8',
                    color: '#374151'
                  }}
                />
              ) : (
                <div className="space-y-4" style={{ color: '#374151', fontSize: '0.95rem', lineHeight: '1.8' }}>
                  <p>
                    Découvrez ce produit exceptionnel qui allie qualité et performance. 
                    Conçu pour répondre à vos besoins quotidiens, ce produit vous accompagnera 
                    dans toutes vos activités.
                  </p>
                  <p>
                    Caractéristiques principales :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Qualité premium garantie</li>
                    <li>Design moderne et élégant</li>
                    <li>Facile à utiliser et entretenir</li>
                    <li>Durabilité exceptionnelle</li>
                  </ul>
                  <p>
                    Commandez dès maintenant et profitez de notre service de livraison rapide 
                    partout au Sénégal. Satisfaction garantie ou remboursé !
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mots-clés - Section séparée pour meilleure visibilité */}
        {product.mots_cles && (
          <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 lg:px-8 mt-6 sm:mt-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: 'var(--color-text-on-light)' }}>
                Mots-clés
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.mots_cles.split(',').map((keyword, index) => {
                  const trimmedKeyword = keyword.trim()
                  if (!trimmedKeyword) return null
                  return (
                    <span
                      key={index}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium transition-colors hover:bg-gray-200 active:bg-gray-300 touch-manipulation"
                      style={{ color: 'var(--color-text-on-light)' }}
                    >
                      {trimmedKeyword}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section cross-selling - mobile-first */}
      {relatedProducts.length > 0 && (
        <section className="py-6 sm:py-8 md:py-12 bg-white">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center" style={{ color: 'var(--color-text-on-light)' }}>
              Produits similaires
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.product_id}
                  href={`/products/${relatedProduct.product_id}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {relatedProduct.image ? (
                      <Image
                        src={relatedProduct.image}
                        alt={relatedProduct.nom}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors" style={{ color: 'var(--color-text-on-light)' }}>
                      {relatedProduct.nom}
                    </h3>
                    <p className="text-base font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                      {relatedProduct.prix_texte}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
