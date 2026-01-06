import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-primary-100 py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Votre marketplace
              <span className="text-primary-600"> de confiance</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Découvrez une sélection exceptionnelle de produits de qualité. 
              Des milliers d'articles disponibles pour répondre à tous vos besoins.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/products"
                className="rounded-lg bg-primary-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                Découvrir les produits
              </Link>
              <Link
                href="/categories"
                className="rounded-lg bg-white px-8 py-3 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Explorer les catégories
              </Link>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-200 to-primary-400 p-8 shadow-2xl">
              <div className="flex h-full items-center justify-center">
                <svg
                  className="h-full w-full text-primary-600 opacity-20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

