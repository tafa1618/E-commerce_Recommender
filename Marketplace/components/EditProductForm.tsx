'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, X, Loader2, ArrowLeft } from 'lucide-react'

interface Product {
  product_id: string
  nom: string
  prix: number
  prix_texte?: string
  image?: string
  categorie?: string
  marque?: string
  lien?: string
  description_seo?: string
  meta_description?: string
  mots_cles?: string
}

interface EditProductFormProps {
  product: Product
}

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    nom: product.nom || '',
    prix: product.prix?.toString() || '',
    prix_texte: product.prix_texte || '',
    image: product.image || '',
    categorie: product.categorie || '',
    marque: product.marque || '',
    lien: product.lien || '',
    description_seo: product.description_seo || '',
    meta_description: product.meta_description || '',
    mots_cles: product.mots_cles || '',
  })

  // Initialiser la prévisualisation de l'image
  useEffect(() => {
    if (product.image) {
      setImagePreview(product.image)
    }
  }, [product.image])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Prévisualisation de l'image
    if (name === 'image' && value.startsWith('http')) {
      setImagePreview(value)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, image: url }))
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData(prev => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validation
      if (!formData.nom.trim()) {
        throw new Error('Le nom du produit est obligatoire')
      }

      if (!formData.prix && !formData.prix_texte) {
        throw new Error('Le prix est obligatoire')
      }

      // Préparer les données du produit
      const produit = {
        product_id: product.product_id,
        nom: formData.nom.trim(),
        prix: parseFloat(formData.prix) || 0,
        prix_texte: formData.prix_texte.trim() || `${parseFloat(formData.prix) || 0} FCFA`,
        image: formData.image.trim(),
        categorie: formData.categorie.trim() || 'Non catégorisé',
        marque: formData.marque.trim() || '',
        lien: formData.lien.trim() || '',
        source: 'Manuel',
      }

      // Préparer la description SEO si fournie
      const description_seo = formData.description_seo.trim() 
        ? {
            description_seo: formData.description_seo.trim(),
            meta_description: formData.meta_description.trim() || formData.nom.trim(),
            mots_cles: formData.mots_cles.trim() || formData.categorie.trim()
          }
        : null

      // TODO: Appeler l'endpoint de mise à jour du produit
      // Pour l'instant, on utilise la même API de publication qui devrait gérer la mise à jour
      const requestData = {
        produit,
        description_seo,
        validation_data: null,
        niche_data: null,
        user_id: null,
        session_id: `admin_edit_${Date.now()}`,
      }

      // Appel API Next.js qui fait le proxy vers le backend
      const response = await fetch(`/api/products/${product.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la modification')
      }

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        
        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      } else {
        throw new Error('Erreur lors de la modification')
      }
    } catch (err: any) {
      console.error('Erreur modification produit:', err)
      setError(err.message || 'Erreur lors de la modification du produit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors touch-manipulation"
          title="Retour à la liste"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Modifier le produit
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">
            Modifiez les informations du produit : {product.nom}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Message de succès */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                ✅ Produit modifié avec succès ! Redirection...
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Grille responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Nom du produit - Obligatoire */}
            <div className="sm:col-span-2">
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Ex: Smartphone Samsung Galaxy S23"
              />
            </div>

            {/* Prix */}
            <div>
              <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1.5">
                Prix (FCFA) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="prix"
                name="prix"
                value={formData.prix}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="150000"
              />
            </div>

            {/* Prix texte */}
            <div>
              <label htmlFor="prix_texte" className="block text-sm font-medium text-gray-700 mb-1.5">
                Prix (texte)
              </label>
              <input
                type="text"
                id="prix_texte"
                name="prix_texte"
                value={formData.prix_texte}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="150 000 FCFA"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1.5">
                Catégorie
              </label>
              <input
                type="text"
                id="categorie"
                name="categorie"
                value={formData.categorie}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Ex: Électronique"
              />
            </div>

            {/* Marque */}
            <div>
              <label htmlFor="marque" className="block text-sm font-medium text-gray-700 mb-1.5">
                Marque
              </label>
              <input
                type="text"
                id="marque"
                name="marque"
                value={formData.marque}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Ex: Samsung"
              />
            </div>

            {/* Image - URL ou upload */}
            <div className="sm:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1.5">
                Image du produit
              </label>
              
              {/* Upload de fichier */}
              <div className="mb-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors touch-manipulation">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-xs sm:text-sm text-gray-600">Télécharger une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>

              {/* URL d'image */}
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Ou entrez une URL d'image: https://..."
              />

              {/* Prévisualisation */}
              {imagePreview && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Aperçu"
                    className="max-w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('')
                      setFormData(prev => ({ ...prev, image: '' }))
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Lien */}
            <div className="sm:col-span-2">
              <label htmlFor="lien" className="block text-sm font-medium text-gray-700 mb-1.5">
                Lien (optionnel)
              </label>
              <input
                type="url"
                id="lien"
                name="lien"
                value={formData.lien}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="https://www.jumia.sn/..."
              />
            </div>

            {/* Description SEO */}
            <div className="sm:col-span-2">
              <label htmlFor="description_seo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Description SEO (optionnel)
              </label>
              <textarea
                id="description_seo"
                name="description_seo"
                value={formData.description_seo}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Description détaillée du produit..."
              />
            </div>

            {/* Meta description */}
            <div className="sm:col-span-2">
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Meta description (optionnel)
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Description courte pour les moteurs de recherche..."
              />
            </div>

            {/* Mots-clés */}
            <div className="sm:col-span-2">
              <label htmlFor="mots_cles" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mots-clés (optionnel, séparés par des virgules)
              </label>
              <input
                type="text"
                id="mots_cles"
                name="mots_cles"
                value={formData.mots_cles}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                placeholder="Ex: smartphone, Samsung, 5G, écran AMOLED"
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
            <Link
              href="/admin/products"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Modification...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

