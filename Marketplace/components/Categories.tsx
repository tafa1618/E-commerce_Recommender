import Link from 'next/link'

const categories = [
  {
    name: 'Électronique',
    description: 'Smartphones, ordinateurs, accessoires',
    image: '📱',
    href: '/categories/electronique',
  },
  {
    name: 'Mode & Beauté',
    description: 'Vêtements, chaussures, cosmétiques',
    image: '👗',
    href: '/categories/mode-beaute',
  },
  {
    name: 'Maison & Jardin',
    description: 'Décoration, mobilier, jardinage',
    image: '🏠',
    href: '/categories/maison-jardin',
  },
  {
    name: 'Sport & Loisirs',
    description: 'Équipements sportifs, jeux, loisirs',
    image: '⚽',
    href: '/categories/sport-loisirs',
  },
  {
    name: 'Alimentation',
    description: 'Produits frais, épicerie, boissons',
    image: '🍎',
    href: '/categories/alimentation',
  },
  {
    name: 'Santé & Bien-être',
    description: 'Compléments, soins, bien-être',
    image: '💊',
    href: '/categories/sante-bien-etre',
  },
]

export default function Categories() {
  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Explorez nos catégories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Trouvez exactement ce que vous cherchez parmi nos milliers de produits
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-6xl mb-4">{category.image}</div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{category.description}</p>
              <div className="mt-4 flex items-center text-primary-600 group-hover:translate-x-2 transition-transform">
                <span className="text-sm font-medium">Découvrir</span>
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

