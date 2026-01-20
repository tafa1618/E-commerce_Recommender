'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Package, Truck, Headphones, CheckCircle } from 'lucide-react'

interface Category {
  nom: string
  nombre_produits: number
  score_moyen: number
  produits_valides: number
}

export default function Hero() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  // Charger les catégories phares
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories-phares?limit=10')
        if (res.ok) {
          const data = await res.json()
          const cats = data.categories || []
          setCategories(cats)
          // Prendre les 3 premières catégories pour le carrousel
          if (cats.length > 0) {
            setCurrentIndex(0)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Navigation du carousel
  const nextCategory = () => {
    if (categories.length >= 3) {
      setCurrentIndex((prev) => (prev + 1) % 3)
    }
  }

  const prevCategory = () => {
    if (categories.length >= 3) {
      setCurrentIndex((prev) => (prev - 1 + 3) % 3)
    }
  }

  // Obtenir les 3 catégories à afficher
  const displayedCategories = categories.slice(0, 3)

  // Mapping des catégories vers les icônes Lucide React (responsive)
  const getCategoryIcon = (categoryName: string) => {
    const lowerName = categoryName.toLowerCase()
    const iconClass = "w-full h-full" // Utilise la taille du conteneur parent
    
    // Mapping intelligent des catégories vers les icônes Lucide
    if (lowerName.includes('électronique') || lowerName.includes('tech')) {
      return <Package className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('mode') || lowerName.includes('beauté') || lowerName.includes('beaute')) {
      return <CheckCircle className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('maison') || lowerName.includes('jardin') || lowerName.includes('mobilier')) {
      return <Package className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('sport') || lowerName.includes('loisirs')) {
      return <Package className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('alimentation') || lowerName.includes('food')) {
      return <Package className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('santé') || lowerName.includes('sante') || lowerName.includes('bien-être')) {
      return <CheckCircle className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('livraison') || lowerName.includes('transport')) {
      return <Truck className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    if (lowerName.includes('support') || lowerName.includes('client')) {
      return <Headphones className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
    }
    
    // Icône par défaut
    return <Package className={iconClass} style={{ color: 'var(--color-primary-dark)' }} />
  }

  const currentCategory = displayedCategories[currentIndex]

  return (
    <section className="relative w-full overflow-hidden">
      {/* Top bar bleu foncé */}
      <div className="w-full h-1" style={{ backgroundColor: 'var(--color-primary-dark)' }}></div>
      
      {/* Mobile-first: empiler les colonnes sur mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-0">
        {/* Section gauche - Texte et CTA (mobile-first: en haut) */}
        <div className="bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:py-20 flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
          {currentCategory && (
            <>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-text-on-light)' }}>
                {currentCategory.nom.toUpperCase()}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8" style={{ color: 'var(--color-text-gray)' }}>
                <span className="block sm:inline">{currentCategory.nombre_produits} produits disponibles</span>
                {currentCategory.score_moyen > 0 && (
                  <span className="block sm:inline sm:ml-2 text-xs sm:text-sm mt-1 sm:mt-0">• Score: {currentCategory.score_moyen}/100</span>
                )}
              </p>
              <Link
                href={`/shop?categorie=${encodeURIComponent(currentCategory.nom)}`}
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold transition-colors btn-black w-full sm:w-auto justify-center"
              >
                EN SAVOIR PLUS
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
          
          {!currentCategory && !loading && (
            <>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--color-text-on-light)' }}>
                VOTRE MARKETPLACE
                <br />
                DE CONFIANCE
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8" style={{ color: 'var(--color-text-gray)' }}>
                Découvrez des milliers de produits de qualité
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-base font-semibold transition-colors btn-black w-full sm:w-auto justify-center"
              >
                EN SAVOIR PLUS
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </>
          )}
        </div>

        {/* Section droite - Carousel de 3 catégories (mobile-first: en bas) */}
        <div className="relative order-1 lg:order-2" style={{ backgroundColor: 'var(--color-accent-yellow)' }}>
          {/* Flèche gauche - plus grande sur mobile pour faciliter le tap */}
          {displayedCategories.length > 0 && (
            <button
              onClick={prevCategory}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/30 hover:bg-white/40 active:bg-white/50 transition-colors touch-manipulation"
              aria-label="Catégorie précédente"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Contenu du carousel - padding réduit sur mobile */}
          <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:py-20">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-lg" style={{ color: 'var(--color-primary-dark)' }}>Chargement...</div>
              </div>
            ) : displayedCategories.length > 0 ? (
              <>
                {/* Badge de réduction - plus petit sur mobile */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--color-accent-yellow)' }}>
                      -{Math.min(50, Math.max(10, Math.floor((displayedCategories[currentIndex]?.score_moyen || 0) / 2)))}%
                    </div>
                  </div>
                </div>

                {/* Carousel de 3 catégories */}
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                  >
                    {displayedCategories.map((category, index) => (
                      <div
                        key={index}
                        className="w-full flex-shrink-0 px-4"
                      >
                        <div className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-lg text-center">
                          {/* Icône de catégorie avec Lucide React - plus petite sur mobile */}
                          <div className="mb-4 sm:mb-6 flex justify-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20">
                              {getCategoryIcon(category.nom)}
                            </div>
                          </div>
                          
                          {/* Nom de la catégorie - taille réduite sur mobile */}
                          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-primary-dark)' }}>
                            {category.nom}
                          </h2>
                          
                          {/* Statistiques - empilées sur mobile */}
                          <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                            <p className="text-sm sm:text-base md:text-lg" style={{ color: 'var(--color-text-gray)' }}>
                              <span className="font-semibold">{category.nombre_produits}</span> produits
                            </p>
                            {category.score_moyen > 0 && (
                              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-gray)' }}>
                                Score: <span className="font-semibold">{category.score_moyen}/100</span>
                              </p>
                            )}
                            {category.produits_valides > 0 && (
                              <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-gray)' }}>
                                <span className="font-semibold">{category.produits_valides}</span> produits validés
                              </p>
                            )}
                          </div>
                          
                          {/* Bouton CTA - pleine largeur sur mobile */}
                          <Link
                            href={`/shop?categorie=${encodeURIComponent(category.nom)}`}
                            className="inline-block w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors btn-black"
                          >
                            Voir les produits
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicateurs de catégories */}
                {displayedCategories.length > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {displayedCategories.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? 'bg-white w-8'
                            : 'bg-white/50'
                        }`}
                        aria-label={`Aller à la catégorie ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <Package className="w-24 h-24 mx-auto mb-4" style={{ color: 'var(--color-primary-dark)' }} />
                  <p className="text-lg font-semibold" style={{ color: 'var(--color-primary-dark)' }}>
                    Aucune catégorie disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Flèche droite - plus grande sur mobile pour faciliter le tap */}
          {displayedCategories.length > 0 && (
            <button
              onClick={nextCategory}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/30 hover:bg-white/40 active:bg-white/50 transition-colors touch-manipulation"
              aria-label="Catégorie suivante"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
