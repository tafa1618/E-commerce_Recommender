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
    <section className="py-8 sm:py-12 md:py-16 lg:py-24" style={{ backgroundColor: 'var(--color-bg-white)' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--color-text-on-light)' }}>
            Pourquoi nous choisir ?
          </h2>
          <p className="text-sm sm:text-base md:text-lg" style={{ color: 'var(--color-text-gray)' }}>
            Des services de qualité pour une expérience d'achat exceptionnelle
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-white rounded-lg p-4 sm:p-6 md:p-8 shadow-md hover:shadow-lg transition-shadow text-center"
            >
              {/* Icône */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center">
                  {imageErrors[feature.name] ? (
                    <div className="text-3xl sm:text-4xl">✨</div>
                  ) : (
                    <Image
                      src={feature.icon}
                      alt={feature.name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full"
                      onError={() => handleImageError(feature.name)}
                    />
                  )}
                </div>
              </div>

              {/* Titre */}
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2" style={{ color: 'var(--color-primary-dark)' }}>
                {feature.name}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-base" style={{ color: 'var(--color-text-gray)' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
