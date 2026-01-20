'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddProductForm from './AddProductForm'
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Stats mockées (à remplacer par des appels API)
  const stats = [
    { label: 'Produits actifs', value: '0', icon: Package, color: 'text-blue-600' },
    { label: 'Commandes', value: '0', icon: ShoppingCart, color: 'text-green-600' },
    { label: 'Ventes', value: '0 FCFA', icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Utilisateurs', value: '0', icon: Users, color: 'text-orange-600' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
            Gérez votre marketplace depuis cette interface
          </p>
        </div>
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="px-3 py-2 sm:px-4 sm:py-2.5 bg-black text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4 sm:w-5 sm:h-5" />
          {showAddProduct ? 'Annuler' : 'Ajouter un produit'}
        </button>
      </div>

      {/* Formulaire d'ajout de produit */}
      {showAddProduct && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Ajouter un nouveau produit
          </h2>
          <AddProductForm onSuccess={() => setShowAddProduct(false)} />
        </div>
      )}

      {/* Statistiques - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                  <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-lg bg-gray-50 flex-shrink-0 ${stat.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions rapides - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/admin/products"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Gérer les produits</h3>
            <p className="text-xs sm:text-sm text-gray-600">Voir, modifier ou supprimer vos produits</p>
          </Link>
          <Link
            href="/admin/orders"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Voir les commandes</h3>
            <p className="text-xs sm:text-sm text-gray-600">Suivre et gérer les commandes clients</p>
          </Link>
          <Link
            href="/admin/stats"
            className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Statistiques</h3>
            <p className="text-xs sm:text-sm text-gray-600">Analyser les performances de votre boutique</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
