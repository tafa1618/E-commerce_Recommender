'use client'

import Image from 'next/image'
import { useState } from 'react'

const features = [
  {
    name: 'Livraison rapide',
    description: 'Recevez vos commandes en un temps record, partout au Sénégal',
    icon: '/Assets/icone_livraison_rapide.png',
  },
  {
    name: 'Support client',
    description: 'Une équipe dédiée à votre service pour répondre à toutes vos questions',
    icon: '/Assets/icone_support_client.png',
  },
  {
    name: 'Retour accepté',
    description: 'Satisfait ou remboursé - Retours faciles et gratuits sous 30 jours',
    icon: '/Assets/icone_retour_accepte.png',
  },
  {
    name: 'Satisfaction client',
    description: 'Des milliers de clients satisfaits nous font confiance chaque jour',
    icon: '/Assets/icone_satisfaction_client.png',
  },
]

export default function Features() {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (name: string) => {
    setImageErrors((prev) => ({ ...prev, [name]: true }))
  }

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--color-bg-white)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--color-text-on-light)' }}>
            Pourquoi nous choisir ?
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-gray)' }}>
            Des services de qualité pour une expérience d'achat exceptionnelle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-white rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              {/* Icône */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                  {imageErrors[feature.name] ? (
                    <div className="text-4xl">✨</div>
                  ) : (
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      width={80}
                      height={80}
                      className="object-contain"
                      onError={() => handleImageError(feature.name)}
                    />
                  )}
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                {feature.name}
              </h3>

              {/* Description */}
              <p className="text-sm md:text-base" style={{ color: 'var(--color-text-gray)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
