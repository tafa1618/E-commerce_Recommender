import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-20 md:py-32" style={{ background: 'linear-gradient(to bottom right, var(--color-primary-dark), var(--color-primary-medium))' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--color-text-on-dark)' }}>
            Prêt à commencer ?
          </h2>
          <p className="mt-6 text-lg leading-8" style={{ color: 'var(--color-text-on-dark)' }}>
            Rejoignez des milliers de clients satisfaits et découvrez notre sélection exceptionnelle de produits.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="rounded-lg px-8 py-3 text-base font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-accent-yellow)',
                  color: 'var(--color-primary-dark)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow-dark)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent-yellow)'}
              >
                Créer un compte
              </Link>
              <Link
                href="/products"
                className="rounded-lg px-8 py-3 text-base font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                style={{ 
                  backgroundColor: 'var(--color-bg-white)',
                  color: 'var(--color-primary-dark)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-gray-light)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-white)'}
              >
                Voir les produits
              </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

