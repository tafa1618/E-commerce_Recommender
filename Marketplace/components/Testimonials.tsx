const testimonials = [
  {
    name: 'Amadou Diallo',
    role: 'Client satisfait',
    content: 'Service exceptionnel et livraison rapide. Je recommande vivement !',
    rating: 5,
  },
  {
    name: 'Fatou Sarr',
    role: 'Acheteuse régulière',
    content: 'La qualité des produits est au rendez-vous. Très contente de mes achats.',
    rating: 5,
  },
  {
    name: 'Ibrahima Ndiaye',
    role: 'Nouveau client',
    content: 'Première commande et je suis déjà conquis. Interface simple et produits de qualité.',
    rating: 5,
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ce que disent nos clients
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Des milliers de clients satisfaits nous font confiance
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white p-8 shadow-sm"
            >
              <div className="mb-4 flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-6 text-gray-600">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

