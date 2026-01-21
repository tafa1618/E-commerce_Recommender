'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Trash2, Eye, Plus, Search, Filter, Power } from 'lucide-react'

interface Product {
  product_id: string
  nom: string
  prix: number
  prix_texte: string
  image?: string
  categorie?: string
  status?: string
  validation_score?: number
  created_at?: string
  published_at?: string
}

export default function AdminProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Charger les produits
  useEffect(() => {
    fetchProducts()
  }, [filterStatus])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Si "all", on récupère tous les produits sans filtre de statut
      const url = filterStatus === 'all' 
        ? `/api/products?limit=1000` 
        : `/api/products?status=${filterStatus}&limit=100`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits')
      }
      
      const data = await response.json()
      setProducts(data.produits || [])
    } catch (err: any) {
      console.error('Erreur chargement produits:', err)
      setError(err.message || 'Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      // TODO: Implémenter l'endpoint de suppression
      console.log('Supprimer produit:', productId)
      // Après suppression, recharger les produits
      fetchProducts()
    } catch (err: any) {
      alert('Erreur lors de la suppression: ' + err.message)
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      console.log(`🔄 Changement de statut: ${productId} de ${currentStatus} vers ${newStatus}`)
      
      const url = `/api/products/${productId}?action=status`
      console.log(`🌐 URL appelée: ${url}`)
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      console.log(`📡 Réponse reçue: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
          console.error('❌ Erreur détaillée:', errorData)
        } catch (e) {
          const text = await response.text()
          console.error('❌ Erreur (texte):', text)
          throw new Error(`Erreur ${response.status}: ${text || response.statusText}`)
        }
        throw new Error(errorData.error || errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Statut modifié avec succès:', data)

      // Recharger les produits après modification
      fetchProducts()
    } catch (err: any) {
      console.error('❌ Erreur complète:', err)
      alert('Erreur lors de la modification du statut: ' + err.message)
    }
  }

  // Filtrer les produits par recherche
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      product.nom.toLowerCase().includes(searchLower) ||
      product.categorie?.toLowerCase().includes(searchLower) ||
      product.mots_cles?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      {/* En-tête - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Gestion des produits
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
            Gérez tous vos produits publiés sur le marketplace
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-black text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 transition-colors touch-manipulation"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Ajouter</span>
        </Link>
      </div>

      {/* Filtres et recherche - Compact */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Filtre par statut */}
          <div className="sm:w-40">
            <div className="relative">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors appearance-none bg-white"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="draft">Brouillons</option>
                <option value="archived">Archivés</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-800">⚠️ {error}</p>
        </div>
      )}

      {/* Liste des produits */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-600">Chargement des produits...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Aucun produit ne correspond à votre recherche' : 'Aucun produit trouvé'}
          </p>
          <Link
            href="/admin/products/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter le premier produit
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tableau - Desktop - Optimisé pour éviter le scroll horizontal */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                    Catégorie
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                    Prix
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-20">
                    Statut
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-28">
                    Date
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.nom}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              🛍️
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {product.nom}
                          </p>
                          {product.validation_score && (
                            <p className="text-xs text-gray-500">
                              {product.validation_score}/100
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs sm:text-sm text-gray-600 truncate block">
                        {product.categorie || 'Non catégorisé'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {product.prix_texte || `${product.prix} FCFA`}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : product.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Actif' : product.status === 'inactive' ? 'Inactif' : product.status === 'draft' ? 'Brouillon' : 'Archivé'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs sm:text-sm text-gray-600">
                      {product.published_at
                        ? new Date(product.published_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                        : product.created_at
                        ? new Date(product.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(product.product_id, product.status || 'active')}
                          className={`p-1.5 rounded transition-colors ${
                            product.status === 'active'
                              ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                          title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                        >
                          <Power className={`w-4 h-4 ${product.status === 'active' ? 'fill-current' : ''}`} />
                        </button>
                        <Link
                          href={`/products/${product.product_id}`}
                          target="_blank"
                          className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.product_id}/edit`}
                          className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.product_id)}
                          className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Liste mobile - Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.product_id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.nom}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        🛍️
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {product.nom}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono truncate mt-1" title={product.product_id}>
                      ID: {product.product_id.substring(0, 16)}...
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.categorie || 'Non catégorisé'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {product.prix_texte || `${product.prix} FCFA`}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'inactive'
                            ? 'bg-red-100 text-red-800'
                            : product.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status === 'active' ? 'Actif' : product.status === 'inactive' ? 'Inactif' : product.status === 'draft' ? 'Brouillon' : 'Archivé'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleStatus(product.product_id, product.status || 'active')}
                      className={`p-2 rounded transition-colors touch-manipulation ${
                        product.status === 'active'
                          ? 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                    >
                      <Power className={`w-4 h-4 ${product.status === 'active' ? 'fill-current' : ''}`} />
                    </button>
                    <Link
                      href={`/products/${product.product_id}`}
                      target="_blank"
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors touch-manipulation"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.product_id}/edit`}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors touch-manipulation"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.product_id)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors touch-manipulation"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      {!loading && products.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            Affichage de <span className="font-semibold">{filteredProducts.length}</span> produit{filteredProducts.length > 1 ? 's' : ''}
            {searchTerm && ` (${products.length} au total)`}
          </p>
        </div>
      )}
    </div>
  )
}

