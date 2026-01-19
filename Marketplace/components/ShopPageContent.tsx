import ShopGrid from './ShopGrid'
import Pagination from './Pagination'

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

interface ShopPageContentProps {
  currentPage: number
  pageSize: number
  categorie?: string
  search?: string
}

async function getProducts(
  page: number,
  pageSize: number,
  categorie?: string,
  search?: string
): Promise<{ products: Product[]; total: number }> {
  try {
    const offset = (page - 1) * pageSize
    const apiUrl = process.env.BACKEND_API_URL || 'http://localhost:8000'
    
    // Construire l'URL avec les paramètres
    const url = new URL(`${apiUrl}/api/marketplace/products`)
    url.searchParams.set('status', 'active')
    url.searchParams.set('limit', pageSize.toString())
    url.searchParams.set('offset', offset.toString())
    
    if (categorie) {
      url.searchParams.set('categorie', categorie)
    }
    
    if (search) {
      url.searchParams.set('search', search)
    }

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Cache pendant 60 secondes
    })

    if (!res.ok) {
      throw new Error('Failed to fetch products')
    }

    const data = await res.json()
    const products = data.produits || []
    
    // Le backend retourne maintenant total dans la réponse
    const total = data.total || data.count || 0

    return { products, total }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0 }
  }
}

export default async function ShopPageContent({
  currentPage,
  pageSize,
  categorie,
  search,
}: ShopPageContentProps) {
  const { products, total } = await getProducts(
    currentPage,
    pageSize,
    categorie,
    search
  )

  const totalPages = Math.ceil(total / pageSize)
  const validPage = Math.max(1, Math.min(currentPage, totalPages || 1))

  return (
    <section className="py-6 sm:py-8 md:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        {/* En-tête optimisé pour la vente */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4" style={{ color: 'var(--color-text-on-light)' }}>
            {categorie ? `Boutique - ${categorie}` : search ? `Résultats pour "${search}"` : 'Notre Boutique'}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <p className="text-sm sm:text-base text-gray-600">
              {total > 0 ? (
                <>
                  {total} produit{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
                  {validPage > 1 && (
                    <span className="ml-2">
                      • Page {validPage} sur {totalPages}
                    </span>
                  )}
                </>
              ) : (
                'Aucun produit disponible'
              )}
            </p>
            
            {/* Badge de confiance pour inciter à l'achat */}
            {total > 0 && (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold">
                  ✓ Livraison rapide
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                  ✓ Paiement sécurisé
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Grille de produits */}
        <ShopGrid products={products} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            baseUrl="/shop"
          />
        )}

        {/* Message si aucune page valide */}
        {validPage !== currentPage && currentPage > totalPages && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              La page demandée n'existe pas.
            </p>
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
            >
              Retour à la première page
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

