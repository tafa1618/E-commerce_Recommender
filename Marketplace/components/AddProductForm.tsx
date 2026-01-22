'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Loader2, Plus, Tag, Sparkles } from 'lucide-react'

interface AddProductFormProps {
  onSuccess?: () => void
}

// Utiliser l'API Next.js qui fait le proxy vers le backend
const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3001'

export default function AddProductForm({ onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [generatingSEO, setGeneratingSEO] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  const [categories, setCategories] = useState<Array<{id?: number, nom: string, slug?: string, description?: string, icone?: string} | string>>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  
  // Helper pour obtenir le nom d'une catégorie (string ou objet)
  const getCategoryName = (cat: string | {nom: string}): string => {
    return typeof cat === 'string' ? cat : cat.nom
  }

  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    prix_texte: '',
    image: '',
    categorie: '', // Garder pour compatibilité, mais utiliser selectedCategories
    marque: '',
    lien: '',
    description_seo: '',
    meta_description: '',
    mots_cles: '',
  })

  // Charger les catégories disponibles
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (err) {
        console.error('Erreur chargement catégories:', err)
      }
    }
    loadCategories()
  }, [])

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

  const handleGenerateSEO = async () => {
    if (!formData.nom.trim()) {
      setError('Veuillez d\'abord saisir le nom du produit')
      return
    }

    setGeneratingSEO(true)
    setError(null)

    try {
      // Préparer le texte avec nom et marque si disponible
      const texte_produit = formData.nom.trim() + (formData.marque.trim() ? ` ${formData.marque.trim()}` : '')
      
      const response = await fetch('/api/products/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texte_produit }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la génération SEO')
      }

      const data = await response.json()
      
      if (data.success && data.description) {
        setFormData(prev => ({
          ...prev,
          description_seo: data.description.description_seo || '',
          meta_description: data.description.meta_description || '',
          mots_cles: data.description.mots_cles || '',
        }))
      } else {
        throw new Error('Aucune description générée')
      }
    } catch (err: any) {
      console.error('Erreur génération SEO:', err)
      setError(err.message || 'Erreur lors de la génération de la description SEO')
    } finally {
      setGeneratingSEO(false)
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

      // Préparer les catégories (utiliser selectedCategories ou newCategory)
      const categoriesToUse = selectedCategories.length > 0 
        ? selectedCategories 
        : (newCategory.trim() ? [newCategory.trim()] : ['Non catégorisé'])

      // Préparer les données du produit
      const produit = {
        nom: formData.nom.trim(),
        prix: parseFloat(formData.prix) || 0,
        prix_texte: formData.prix_texte.trim() || `${parseFloat(formData.prix) || 0} FCFA`,
        image: formData.image.trim(),
        categorie: categoriesToUse.join(', '), // Pour compatibilité avec l'ancien système
        categories: categoriesToUse, // Nouveau système avec plusieurs catégories
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

      const requestData = {
        produit,
        description_seo,
        validation_data: null,
        niche_data: null,
        user_id: null,
        session_id: `admin_${Date.now()}`,
      }

      // Appel API Next.js qui fait le proxy vers le backend
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la publication')
      }

      const data = await response.json()

      if (data.success) {
        console.log('✅ Produit publié avec succès, product_id:', data.product_id)
        setSuccess(true)
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prix: '',
          prix_texte: '',
          image: '',
          categorie: '',
          marque: '',
          lien: '',
          description_seo: '',
          meta_description: '',
          mots_cles: '',
        })
        setSelectedCategories([])
        setNewCategory('')
        setShowNewCategoryInput(false)
        setImagePreview('')
        
        // Callback de succès
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
          }, 2000)
        }
      } else {
        throw new Error('Erreur lors de la publication')
      }
    } catch (err: any) {
      console.error('Erreur publication produit:', err)
      setError(err.message || 'Erreur lors de la publication du produit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Message de succès */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">
            ✅ Produit publié avec succès !
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

        {/* Catégories (sélection multiple) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Catégories <span className="text-gray-500 text-xs font-normal">(plusieurs possibles)</span>
          </label>
          
          {/* Catégories sélectionnées */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedCategories.map((cat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-black text-white text-sm rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {cat}
                  <button
                    type="button"
                    onClick={() => setSelectedCategories(selectedCategories.filter((_, i) => i !== index))}
                    className="ml-1 hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Liste déroulante des catégories */}
          <div className="mb-3">
            <select
              onChange={(e) => {
                const value = e.target.value
                if (value && !selectedCategories.includes(value)) {
                  setSelectedCategories([...selectedCategories, value])
                }
                e.target.value = '' // Réinitialiser la sélection
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
            >
              <option value="">Sélectionner une catégorie...</option>
              {categories.map((cat) => {
                const catName = getCategoryName(cat)
                const catValue = typeof cat === 'string' ? cat : cat.nom
                return (
                  <option key={catValue} value={catValue}>
                    {catName}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Ajouter une catégorie manuellement */}
          {!showNewCategoryInput ? (
            <button
              type="button"
              onClick={() => setShowNewCategoryInput(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Plus className="w-4 h-4" />
              Ajouter une catégorie manuellement
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nom de la catégorie"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newCategory.trim()) {
                    e.preventDefault()
                    if (!selectedCategories.includes(newCategory.trim())) {
                      setSelectedCategories([...selectedCategories, newCategory.trim()])
                    }
                    setNewCategory('')
                    setShowNewCategoryInput(false)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newCategory.trim() && !selectedCategories.includes(newCategory.trim())) {
                    setSelectedCategories([...selectedCategories, newCategory.trim()])
                  }
                  setNewCategory('')
                  setShowNewCategoryInput(false)
                }}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewCategory('')
                  setShowNewCategoryInput(false)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Annuler
              </button>
            </div>
          )}
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
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Télécharger une image</span>
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
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="description_seo" className="block text-sm font-medium text-gray-700">
              Description SEO (optionnel)
            </label>
            <button
              type="button"
              onClick={handleGenerateSEO}
              disabled={generatingSEO || !formData.nom.trim()}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {generatingSEO ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Générer automatiquement
                </>
              )}
            </button>
          </div>
          <textarea
            id="description_seo"
            name="description_seo"
            value={formData.description_seo}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
            placeholder="Description détaillée du produit..."
          />
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            setFormData({
              nom: '',
              prix: '',
              prix_texte: '',
              image: '',
              categorie: '',
              marque: '',
              lien: '',
              description_seo: '',
              meta_description: '',
              mots_cles: '',
            })
            setImagePreview('')
            setError(null)
            setSuccess(false)
          }}
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
        >
          Réinitialiser
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 active:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Publication...
            </>
          ) : (
            'Publier le produit'
          )}
        </button>
      </div>
    </form>
  )
}
