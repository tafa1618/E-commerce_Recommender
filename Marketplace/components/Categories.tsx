'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Category {
  nom: string
  nombre_produits: number
  score_moyen: number
  produits_valides: number
}

interface Product {
  product_id: string
  nom: string
  image?: string
  prix_texte: string
  prix: number
  categorie: string
  validation_score?: number
  published_at?: string
}

type FilterType = 'nouveautes' | 'mieux-vendus' | 'tendances'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState<FilterType>('nouveautes')
  const [loading, setLoading] = useState(true)
  const [subCategories, setSubCategories] = useState<string[]>([])

  // Catégories mockées pour le développement
  const mockCategories: Category[] = [
    {
      nom: 'Électronique',
      nombre_produits: 45,
      score_moyen: 85,
      produits_valides: 38,
    },
    {
      nom: 'Mode & Beauté',
      nombre_produits: 62,
      score_moyen: 78,
      produits_valides: 52,
    },
    {
      nom: 'Maison & Jardin',
      nombre_produits: 38,
      score_moyen: 72,
      produits_valides: 30,
    },
    {
      nom: 'Sport & Loisirs',
      nombre_produits: 29,
      score_moyen: 68,
      produits_valides: 22,
    },
    {
      nom: 'Alimentation',
      nombre_produits: 55,
      score_moyen: 80,
      produits_valides: 48,
    },
  ]

  // Produits mockés pour le développement
  const mockProducts: Product[] = [
    {
      product_id: '1',
      nom: 'Smartphone Samsung Galaxy A54',
      prix: 150000,
      prix_texte: '150 000 CFA',
      categorie: 'Électronique',
      validation_score: 85,
      image: 'https://via.placeholder.com/300x300?text=Smartphone',
    },
    {
      product_id: '2',
      nom: 'Ordinateur Portable HP 15',
      prix: 450000,
      prix_texte: '450 000 CFA',
      categorie: 'Électronique',
      validation_score: 82,
      image: 'https://via.placeholder.com/300x300?text=Laptop',
    },
    {
      product_id: '3',
      nom: 'Écouteurs Bluetooth Sony',
      prix: 25000,
      prix_texte: '25 000 CFA',
      categorie: 'Électronique',
      validation_score: 88,
      image: 'https://via.placeholder.com/300x300?text=Headphones',
    },
    {
      product_id: '4',
      nom: 'Tablette iPad Air',
      prix: 350000,
      prix_texte: '350 000 CFA',
      categorie: 'Électronique',
      validation_score: 90,
      image: 'https://via.placeholder.com/300x300?text=Tablet',
    },
    {
      product_id: '5',
      nom: 'Sac à main cuir véritable',
      prix: 45000,
      prix_texte: '45 000 CFA',
      categorie: 'Mode & Beauté',
      validation_score: 75,
      image: 'https://via.placeholder.com/300x300?text=Handbag',
    },
    {
      product_id: '6',
      nom: 'Parfum Chanel N°5',
      prix: 85000,
      prix_texte: '85 000 CFA',
      categorie: 'Mode & Beauté',
      validation_score: 80,
      image: 'https://via.placeholder.com/300x300?text=Perfume',
    },
    {
      product_id: '7',
      nom: 'Canapé 3 places moderne',
      prix: 250000,
      prix_texte: '250 000 CFA',
      categorie: 'Maison & Jardin',
      validation_score: 70,
      image: 'https://via.placeholder.com/300x300?text=Sofa',
    },
    {
      product_id: '8',
      nom: 'Table basse en verre',
      prix: 75000,
      prix_texte: '75 000 CFA',
      categorie: 'Maison & Jardin',
      validation_score: 68,
      image: 'https://via.placeholder.com/300x300?text=Table',
    },
    {
      product_id: '9',
      nom: 'Vélo de course professionnel',
      prix: 180000,
      prix_texte: '180 000 CFA',
      categorie: 'Sport & Loisirs',
      validation_score: 65,
      image: 'https://via.placeholder.com/300x300?text=Bike',
    },
    {
      product_id: '10',
      nom: 'Tapis de yoga premium',
      prix: 15000,
      prix_texte: '15 000 CFA',
      categorie: 'Sport & Loisirs',
      validation_score: 72,
      image: 'https://via.placeholder.com/300x300?text=Yoga',
    },
    {
      product_id: '11',
      nom: 'Riz basmati premium 5kg',
      prix: 3500,
      prix_texte: '3 500 CFA',
      categorie: 'Alimentation',
      validation_score: 85,
      image: 'https://via.placeholder.com/300x300?text=Rice',
    },
    {
      product_id: '12',
      nom: 'Huile d\'olive extra vierge',
      prix: 8500,
      prix_texte: '8 500 CFA',
      categorie: 'Alimentation',
      validation_score: 78,
      image: 'https://via.placeholder.com/300x300?text=Oil',
    },
  ]

  // Gérer les produits mockés
  const handleMockProducts = (categorie: string, filter: FilterType) => {
    let filteredProducts = mockProducts.filter((p) => p.categorie === categorie)
    
    // Appliquer les filtres
    switch (filter) {
      case 'nouveautes':
        // Trier par ID (simule les plus récents)
        filteredProducts = filteredProducts.sort((a, b) => parseInt(b.product_id) - parseInt(a.product_id))
        break
      case 'mieux-vendus':
        // Trier par score de validation
        filteredProducts = filteredProducts.sort((a, b) => (b.validation_score || 0) - (a.validation_score || 0))
        break
      case 'tendances':
        // Trier par score de validation
        filteredProducts = filteredProducts.sort((a, b) => (b.validation_score || 0) - (a.validation_score || 0))
        break
    }
    
    setProducts(filteredProducts.slice(0, 12))
    
    // Générer des sous-catégories
    const uniqueSubCats = Array.from(new Set(mockProducts.map((p) => p.categorie).filter(Boolean)))
    setSubCategories(uniqueSubCats.slice(0, 5))
    setLoading(false)
  }

  // Charger les catégories phares
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories-phares?limit=10')
        if (res.ok) {
          const data = await res.json()
          const cats = data.categories || []
          // Utiliser les catégories mockées si aucune catégorie n'est retournée
          if (cats.length > 0) {
            setCategories(cats)
            setSelectedCategory(cats[0].nom)
            fetchProductsForCategory(cats[0].nom, 'nouveautes')
          } else {
            // Utiliser les données mockées
            setCategories(mockCategories)
            setSelectedCategory(mockCategories[0].nom)
            handleMockProducts(mockCategories[0].nom, 'nouveautes')
          }
        } else {
          // En cas d'erreur, utiliser les données mockées
          setCategories(mockCategories)
          setSelectedCategory(mockCategories[0].nom)
          handleMockProducts(mockCategories[0].nom, 'nouveautes')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Utiliser les données mockées en cas d'erreur
        setCategories(mockCategories)
        setSelectedCategory(mockCategories[0].nom)
        handleMockProducts(mockCategories[0].nom, 'nouveautes')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Charger les produits selon le filtre
  const fetchProductsForCategory = async (categorie: string, filter: FilterType) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/categories/${encodeURIComponent(categorie)}/produits?limit=20`)
      if (res.ok) {
        const data = await res.json()
        let products = data.produits || []
        
        // Si aucun produit retourné, utiliser les mockés
        if (products.length === 0) {
          handleMockProducts(categorie, filter)
          return
        }
        
        // Appliquer les filtres
        switch (filter) {
          case 'nouveautes':
            // Trier par date de publication (plus récent en premier)
            products = products.sort((a: Product, b: Product) => {
              const dateA = a.published_at ? new Date(a.published_at).getTime() : 0
              const dateB = b.published_at ? new Date(b.published_at).getTime() : 0
              return dateB - dateA
            })
            break
          case 'mieux-vendus':
            // Trier par score de validation (plus validé = mieux vendu)
            products = products.sort((a: Product, b: Product) => {
              const scoreA = a.validation_score || 0
              const scoreB = b.validation_score || 0
              return scoreB - scoreA
            })
            break
          case 'tendances':
            // Trier par score de validation et date récente
            products = products.sort((a: Product, b: Product) => {
              const scoreA = (a.validation_score || 0) * 0.7 + (a.published_at ? 1 : 0) * 0.3
              const scoreB = (b.validation_score || 0) * 0.7 + (b.published_at ? 1 : 0) * 0.3
              return scoreB - scoreA
            })
            break
        }
        
        setProducts(products.slice(0, 12)) // Limiter à 12 produits
        
        // Générer des sous-catégories basées sur les produits
        const uniqueSubCats = Array.from(new Set(products.map((p: Product) => p.categorie).filter(Boolean)))
        setSubCategories(uniqueSubCats.slice(0, 5))
      } else {
        // En cas d'erreur HTTP, utiliser les mockés
        handleMockProducts(categorie, filter)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      // Utiliser les mockés en cas d'erreur
      handleMockProducts(categorie, filter)
    }
  }

  // Changer de catégorie
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName)
    // Vérifier si on utilise les mockés
    const isUsingMock = categories.some(c => mockCategories.some(mc => mc.nom === c.nom))
    if (isUsingMock || categories.length === 0) {
      handleMockProducts(categoryName, activeFilter)
    } else {
      fetchProductsForCategory(categoryName, activeFilter)
    }
  }

  // Changer de filtre
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter)
    if (selectedCategory) {
      // Vérifier si on utilise les mockés
      const isUsingMock = categories.some(c => mockCategories.some(mc => mc.nom === c.nom))
      if (isUsingMock || categories.length === 0) {
        handleMockProducts(selectedCategory, filter)
      } else {
        fetchProductsForCategory(selectedCategory, filter)
      }
    }
  }

  // Calculer le pourcentage de réduction basé sur le score
  const getDiscountPercentage = (): number => {
    if (!selectedCategory) return 0
    const category = categories.find(c => c.nom === selectedCategory)
    if (!category) return 0
    return Math.min(50, Math.max(10, Math.floor(category.score_moyen / 2)))
  }

  return (
    <section className="py-8 sm:py-12 md:py-16" style={{ backgroundColor: 'var(--color-bg-white)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* En-tête avec titre et filtres - mobile-first */}
        <div className="flex flex-col mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 uppercase" style={{ color: 'var(--color-text-on-light)' }}>
            {selectedCategory ? selectedCategory.toUpperCase() : 'EXPLORER NOS CATÉGORIES'}
          </h2>
          
          {/* Onglets de filtres - scroll horizontal sur mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:mx-0 px-3 sm:px-0 scrollbar-hide">
            <button
              onClick={() => handleFilterChange('nouveautes')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 transition-colors whitespace-nowrap touch-manipulation ${
                activeFilter === 'nouveautes'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black active:bg-gray-50'
              }`}
            >
              Nouveautés
            </button>
            <button
              onClick={() => handleFilterChange('mieux-vendus')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 transition-colors whitespace-nowrap touch-manipulation ${
                activeFilter === 'mieux-vendus'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black active:bg-gray-50'
              }`}
            >
              Mieux Vendus
            </button>
            <button
              onClick={() => handleFilterChange('tendances')}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-2 transition-colors whitespace-nowrap touch-manipulation ${
                activeFilter === 'tendances'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-black active:bg-gray-50'
              }`}
            >
              Tendances
            </button>
          </div>
        </div>

        {/* Mobile-first: empiler verticalement sur mobile, grille sur desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Bannière promotionnelle - en haut sur mobile, à gauche sur desktop */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-lg order-1 lg:order-1" style={{ backgroundColor: '#ef4444' }}>
            <div className="p-4 sm:p-6 md:p-8 text-white h-full flex flex-row lg:flex-col justify-between items-center lg:items-start">
              <div className="flex-1 lg:flex-none">
                <h3 className="text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-4 uppercase">
                  {selectedCategory || 'CATÉGORIE'}
                </h3>
                <div className="bg-white rounded-full w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 flex items-center justify-center mb-2 sm:mb-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: '#ef4444' }}>
                      {getDiscountPercentage()}%
                    </div>
                  </div>
                </div>
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold uppercase">
                  DE<br className="hidden lg:block" /> RÉDUCTION
                </div>
              </div>
              <div className="mt-0 lg:mt-4 pt-0 lg:pt-4 border-0 lg:border-t border-white/30 ml-4 lg:ml-0">
                <div className="text-xs sm:text-sm opacity-90">
                  Profitez de nos meilleures offres
                </div>
              </div>
            </div>
          </div>

          {/* Grille de produits - au centre sur desktop, en haut sur mobile */}
          <div className="lg:col-span-6 order-2 lg:order-2">
            {loading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="text-base sm:text-lg" style={{ color: 'var(--color-text-gray)' }}>Chargement...</div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {products.map((product) => (
                  <div
                    key={product.product_id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Badge en haut à gauche */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        NEW
                      </div>
                      {product.image ? (
                        <Link href={`/products/${product.product_id}`}>
                          <div className="aspect-square bg-gray-100 relative overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.nom}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                      ) : (
                        <Link href={`/products/${product.product_id}`}>
                          <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-sm">Image</span>
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Informations produit - optimisé mobile */}
                    <div className="p-2 sm:p-3 md:p-4">
                      <Link href={`/products/${product.product_id}`}>
                        <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 line-clamp-2" style={{ color: 'var(--color-text-on-light)' }}>
                          {product.nom}
                        </h3>
                      </Link>
                      <p className="text-sm sm:text-base font-bold mb-2 sm:mb-3" style={{ color: 'var(--color-primary-dark)' }}>
                        {product.prix_texte || `${product.prix} CFA`}
                      </p>
                      <button
                        className="w-full py-1.5 sm:py-2 text-xs font-semibold uppercase border-2 border-black active:bg-black active:text-white transition-colors touch-manipulation"
                        onClick={() => {
                          // TODO: Ajouter au panier
                          console.log('Ajouter au panier:', product.product_id)
                        }}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-lg" style={{ color: 'var(--color-text-gray)' }}>
                    Aucun produit disponible
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar de catégories - en bas sur mobile, à droite sur desktop */}
          <div className="lg:col-span-3 order-3 lg:order-3">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 md:p-6">
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#ef4444' }}>
                {selectedCategory || 'Catégories'}
              </h3>
              
              {/* Liste des catégories principales - scroll horizontal sur mobile si nécessaire */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 max-h-64 sm:max-h-none overflow-y-auto">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category.nom}
                    onClick={() => handleCategoryChange(category.nom)}
                    className={`w-full text-left px-3 py-2 sm:py-2.5 rounded transition-colors touch-manipulation ${
                      selectedCategory === category.nom
                        ? 'bg-gray-100 font-semibold'
                        : 'active:bg-gray-50'
                    }`}
                    style={{ color: 'var(--color-text-on-light)' }}
                  >
                    <span className="text-sm sm:text-base">{category.nom}</span>
                  </button>
                ))}
              </div>

              {/* Sous-catégories */}
              {subCategories.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 uppercase" style={{ color: 'var(--color-text-gray)' }}>
                    Sous-catégories
                  </h4>
                  <div className="space-y-1">
                    {subCategories.map((subCat, index) => (
                      <Link
                        key={index}
                        href={`/products?categorie=${encodeURIComponent(subCat)}`}
                        className="block text-xs sm:text-sm px-3 py-1.5 active:bg-gray-50 rounded transition-colors touch-manipulation"
                        style={{ color: 'var(--color-text-on-light)' }}
                      >
                        {subCat}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
