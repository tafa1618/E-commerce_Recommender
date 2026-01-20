import Link from 'next/link'
import { Product } from '@/types/product'

interface ProductsProps {
  products?: Product[]
}

export default function Products({ products = [] }: ProductsProps) {
  // Si pas de produits passés en props, utiliser des produits de démo
  const displayProducts = products.length > 0 ? products.slice(0, 4) : [
    {
      product_id: 'demo-1',
      nom: 'Produit Premium',
      prix_texte: '29 900 FCFA',
      image: '🛍️',
      categorie: 'Électronique',
    },
    {
      product_id: 'demo-2',
      nom: 'Article Tendances',
      prix_texte: '15 500 FCFA',
      image: '✨',
      categorie: 'Mode',
    },
    {
      product_id: 'demo-3',
      nom: 'Nouveau Arrivage',
      prix_texte: '45 000 FCFA',
      image: '🎁',
      categorie: 'Maison',
    },
    {
      product_id: 'demo-4',
      nom: 'Best Seller',
      prix_texte: '12 900 FCFA',
      image: '🔥',
      categorie: 'Sport',
    },
  ]

  return (
    <section className="py-8 sm:py-12 md:py-20 lg:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-8 sm:mb-12 md:mb-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Produits populaires
            </h2>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-600">
              Les articles les plus appréciés par nos clients
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:block rounded-lg bg-primary-600 px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-white hover:bg-primary-700 active:bg-primary-800 transition-colors touch-manipulation"
          >
            Voir tout
          </Link>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((product: any) => (
            <Link
              key={product.product_id || product.id}
              href={`/products/${product.product_id || product.id}`}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-white border border-gray-200 p-3 sm:p-4 md:p-6 transition-all active:shadow-lg active:-translate-y-0.5 touch-manipulation"
            >
              {product.image && product.image.startsWith('http') ? (
                <div className="aspect-square mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.nom || product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="aspect-square mb-4 flex items-center justify-center rounded-lg bg-gray-100 text-6xl group-hover:bg-gray-200 transition-colors">
                  {product.image || '🛍️'}
                </div>
              )}
              {product.categorie && (
                <div className="mb-2 text-xs font-medium text-primary-600">
                  {product.categorie}
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {product.nom || product.name}
              </h3>
              {product.meta_description && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {product.meta_description}
                </p>
              )}
              <div className="mt-4 text-xl font-bold text-gray-900">
                {product.prix_texte || product.price}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/shop"
            className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Voir tous les produits
          </Link>
        </div>
      </div>
    </section>
  )
}
