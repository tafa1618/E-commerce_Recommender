import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../App.css'

const API_BASE_URL = 'http://localhost:8000'

function CreerBoutique() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exportType, setExportType] = useState('wordpress')

  // États pour la sélection par catégorie
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [produitsDisponibles, setProduitsDisponibles] = useState([])
  const [loadingProduits, setLoadingProduits] = useState(false)
  const [categories, setCategories] = useState([])
  const [nombreProduits, setNombreProduits] = useState(20)

  // États pour l'ajout manuel
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualProduit, setManualProduit] = useState({
    nom: '',
    prix_texte: '',
    image: '',
    lien: '',
    categorie: '',
    marque: ''
  })
  const [isDragging, setIsDragging] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = React.useRef(null)

  // États pour les descriptions SEO
  const [descriptions, setDescriptions] = useState({})
  const [generatingDescriptions, setGeneratingDescriptions] = useState(false)

  // États pour la validation de niche
  const [nicheAnalysis, setNicheAnalysis] = useState(null)
  const [validatingNiche, setValidatingNiche] = useState(false)

  // États pour Google Trends
  const [showTrends, setShowTrends] = useState(false)
  const [trendsKeyword, setTrendsKeyword] = useState('')
  const [trendsData, setTrendsData] = useState(null)
  const [trendsLoading, setTrendsLoading] = useState(false)
  const [trendsError, setTrendsError] = useState(null)
  const [trendsProducts, setTrendsProducts] = useState([])

  // État pour le feedback visuel lors de l'ajout
  const [addedMessages, setAddedMessages] = useState({})

  // Fonction pour charger les produits depuis localStorage
  const chargerProduits = () => {
    console.log('🔄 Chargement des produits depuis localStorage...')
    const produitsSauvegardes = localStorage.getItem('boutique_produits')
    if (produitsSauvegardes) {
      try {
        const produitsParses = JSON.parse(produitsSauvegardes)
        console.log(`✅ ${produitsParses.length} produits chargés depuis localStorage`)
        setProduits(produitsParses)
      } catch (e) {
        console.error('❌ Erreur chargement produits:', e)
        setProduits([])
      }
    } else {
      console.log('ℹ️ Aucun produit dans localStorage')
      setProduits([])
    }
  }

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories()
  }, [])

  // Charger les produits au montage et quand la page devient visible
  useEffect(() => {
    chargerProduits()

    // Recharger quand la page redevient visible (quand on revient sur l'onglet)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        chargerProduits()
      }
    }

    // Écouter les changements de localStorage (pour synchroniser entre onglets)
    const handleStorageChange = (e) => {
      if (e.key === 'boutique_produits') {
        chargerProduits()
      }
    }

    // Écouter l'événement personnalisé déclenché quand un produit est ajouté
    const handleBoutiqueUpdate = () => {
      console.log('📢 Événement boutique-produits-updated reçu, rechargement...')
      // Petit délai pour s'assurer que localStorage est bien mis à jour
      setTimeout(() => {
        chargerProduits()
      }, 100)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('boutique-produits-updated', handleBoutiqueUpdate)

    // Vérifier aussi périodiquement (toutes les 10 secondes) si on est sur la page (réduit la charge)
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        chargerProduits()
      }
    }, 10000) // Réduit de 2s à 10s pour améliorer les performances

    // Recharger aussi quand on revient sur la page (focus)
    const handleFocus = () => {
      chargerProduits()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('boutique-produits-updated', handleBoutiqueUpdate)
      window.removeEventListener('focus', handleFocus)
      clearInterval(intervalId)
    }
  }, [])

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/categories`)
      setCategories(response.data.categories || [])
    } catch (err) {
      console.error('Erreur chargement catégories:', err)
    }
  }

  const loadProduits = async () => {
    if (!selectedCategorie && !selectedCategorie.trim()) {
      setError('Veuillez sélectionner une catégorie')
      return
    }

    if (nombreProduits < 1 || nombreProduits > 100) {
      setError('Le nombre de produits doit être entre 1 et 100')
      return
    }

    setLoadingProduits(true)
    setError(null)

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/veille-concurrentielle?categorie=${selectedCategorie}&limit=${nombreProduits}`
      )

      if (response.data.produits && response.data.produits.length > 0) {
        // Afficher les produits immédiatement, sans attendre Google Trends
        setProduitsDisponibles(response.data.produits)
      } else {
        setError('Aucun produit trouvé pour cette catégorie')
        setProduitsDisponibles([])
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des produits')
      setProduitsDisponibles([])
    } finally {
      setLoadingProduits(false)
    }
  }

  const ajouterABoutique = (produit) => {
    console.log('🛒 Ajout produit à la boutique:', produit)

    try {
      if (!produit) {
        console.error('❌ Produit est null ou undefined')
        setError('Erreur: produit invalide')
        return
      }

      // Récupérer les produits existants directement depuis localStorage
      let produitsExistants = []
      try {
        const stored = localStorage.getItem('boutique_produits')
        console.log('localStorage actuel:', stored)
        produitsExistants = stored ? JSON.parse(stored) : []
        console.log('Produits existants:', produitsExistants.length)
      } catch (e) {
        console.error('Erreur lecture localStorage:', e)
        produitsExistants = []
      }

      // Vérifier si le produit n'est pas déjà présent (par lien ou par nom si pas de lien)
      const existeDeja = produitsExistants.some(p => {
        if (produit.lien && p.lien) {
          return p.lien === produit.lien
        }
        // Si pas de lien, comparer par nom
        if (produit.nom && p.nom) {
          return p.nom === produit.nom
        }
        return false
      })

      if (existeDeja) {
        console.log('⚠️ Produit déjà présent')
        setError('Ce produit est déjà dans votre boutique')
        return
      }

      // Créer une copie propre du produit (limiter la taille des images base64)
      let imageUrl = produit.image || ''
      // Si l'image est en base64 et trop volumineuse, la retirer pour éviter de saturer localStorage
      if (imageUrl.startsWith('data:image/') && imageUrl.length > 100000) {
        console.warn('Image base64 trop volumineuse, suppression pour économiser localStorage')
        imageUrl = ''
      }

      const produitAvecSource = {
        nom: produit.nom || 'Produit sans nom',
        prix: produit.prix || 0,
        prix_texte: produit.prix_texte || `${produit.prix || 0} FCFA`,
        lien: produit.lien || '',
        image: imageUrl,
        marque: produit.marque || '',
        categorie: produit.categorie || '',
        note: produit.note || 'N/A',
        remise: produit.remise || '',
        source: produit.source || 'Jumia'
      }

      console.log('Produit à ajouter:', produitAvecSource)

      produitsExistants.push(produitAvecSource)

      try {
        // Vérifier la taille avant de sauvegarder
        const dataToSave = JSON.stringify(produitsExistants)
        if (dataToSave.length > 5000000) { // ~5MB (limite approximative de localStorage)
          console.warn('⚠️ Données trop volumineuses, suppression des images base64...')
          // Retirer les images base64 pour réduire la taille
          const produitsSansImages = produitsExistants.map(p => {
            if (p.image && p.image.startsWith('data:image/')) {
              const { image, ...rest } = p
              return rest
            }
            return p
          })
          localStorage.setItem('boutique_produits', JSON.stringify(produitsSansImages))
          // Mettre à jour le produit ajouté sans l'image
          produitAvecSource.image = ''
        } else {
          localStorage.setItem('boutique_produits', dataToSave)
        }
        console.log('✅ Produit sauvegardé dans localStorage')
      } catch (e) {
        console.error('❌ Erreur sauvegarde localStorage:', e)
        if (e.name === 'QuotaExceededError') {
          // Essayer de sauvegarder sans les images base64
          try {
            const produitsSansImages = produitsExistants.map(p => {
              if (p.image && p.image.startsWith('data:image/')) {
                const { image, ...rest } = p
                return rest
              }
              return p
            })
            localStorage.setItem('boutique_produits', JSON.stringify(produitsSansImages))
            produitAvecSource.image = ''
            setError('⚠️ localStorage plein ! Les images base64 ont été supprimées pour économiser l\'espace.')
          } catch (e2) {
            setError(`❌ Erreur critique: localStorage plein. Veuillez supprimer des produits ou vider le cache.`)
            return
          }
        } else {
          setError(`Erreur sauvegarde: ${e.message}`)
          return
        }
      }

      // Mettre à jour l'état local IMMÉDIATEMENT (nouvelle référence pour forcer le re-render)
      console.log(`📦 Avant mise à jour: ${produits.length} produits dans l'état`)
      setProduits([...produitsExistants])
      console.log(`✅ État local mis à jour avec ${produitsExistants.length} produits`)
      console.log(`📋 Produits dans localStorage:`, produitsExistants)

      // Feedback visuel
      const key = produit.lien || produit.nom
      setAddedMessages(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setAddedMessages(prev => {
          const newState = { ...prev }
          delete newState[key]
          return newState
        })
      }, 3000)

      // Déclencher un événement personnalisé pour notifier les autres composants
      try {
        const event = new CustomEvent('boutique-produits-updated', {
          detail: { produit: produitAvecSource, total: produitsExistants.length }
        })
        window.dispatchEvent(event)
        console.log('✅ Événement boutique-produits-updated déclenché')
        console.log(`📦 Total produits dans localStorage: ${produitsExistants.length}`)

        // Déclencher plusieurs fois pour garantir la synchronisation
        setTimeout(() => window.dispatchEvent(new CustomEvent('boutique-produits-updated')), 200)
        setTimeout(() => window.dispatchEvent(new CustomEvent('boutique-produits-updated')), 500)
      } catch (e) {
        console.error('Erreur déclenchement événement:', e)
      }

    } catch (err) {
      console.error('❌ Erreur dans ajouterABoutique:', err)
      setError(`Erreur lors de l'ajout: ${err.message}`)
    }
  }

  // Sauvegarder dans localStorage quand les produits changent (éviter les boucles infinies)
  useEffect(() => {
    // Ne sauvegarder que si les produits ont vraiment changé (pas lors du chargement initial)
    const stored = localStorage.getItem('boutique_produits')
    const storedProducts = stored ? JSON.parse(stored) : []

    // Comparer les longueurs et les IDs pour éviter les sauvegardes inutiles
    if (produits.length !== storedProducts.length ||
      JSON.stringify(produits.map(p => p.lien || p.nom)) !== JSON.stringify(storedProducts.map(p => p.lien || p.nom))) {
      try {
        if (produits.length > 0) {
          // Limiter la taille des données (ne pas stocker les images base64 si trop volumineuses)
          const produitsToSave = produits.map(p => {
            const produitCopy = { ...p }
            // Si l'image est en base64 et trop grande, la retirer
            if (produitCopy.image && produitCopy.image.startsWith('data:image/')) {
              if (produitCopy.image.length > 100000) { // ~100KB
                console.warn('Image base64 trop volumineuse, suppression pour économiser localStorage')
                produitCopy.image = '' // Retirer l'image trop volumineuse
              }
            }
            return produitCopy
          })
          localStorage.setItem('boutique_produits', JSON.stringify(produitsToSave))
        } else {
          localStorage.removeItem('boutique_produits')
        }
      } catch (e) {
        if (e.name === 'QuotaExceededError') {
          console.error('❌ localStorage plein ! Suppression des images base64...')
          // Essayer de sauvegarder sans les images base64
          const produitsSansImages = produits.map(p => {
            const { image, ...rest } = p
            return image && image.startsWith('data:image/') ? rest : p
          })
          try {
            localStorage.setItem('boutique_produits', JSON.stringify(produitsSansImages))
          } catch (e2) {
            console.error('❌ Impossible de sauvegarder même sans images:', e2)
            setError('⚠️ localStorage plein ! Veuillez supprimer des produits ou vider le cache du navigateur.')
          }
        } else {
          console.error('❌ Erreur sauvegarde localStorage:', e)
        }
      }
    }
  }, [produits])

  const supprimerProduit = (index) => {
    const nouveauxProduits = produits.filter((_, i) => i !== index)
    setProduits(nouveauxProduits)
  }

  // Fonction pour valider la niche (analyse de cohérence)
  const validerNiche = async () => {
    if (produits.length < 3) {
      setError('Il faut au moins 3 produits pour valider la niche')
      return
    }

    setValidatingNiche(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/boutique/valider-niche`,
        { produits }
      )

      if (response.data.success && response.data.analyse) {
        setNicheAnalysis(response.data.analyse)
      } else {
        setError('Erreur lors de la validation de la niche')
      }
    } catch (err) {
      console.error('Erreur validation niche:', err)
      setError(err.response?.data?.detail || 'Erreur lors de la validation de la niche')
    } finally {
      setValidatingNiche(false)
    }
  }

  const viderPanier = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider toute la sélection ?')) {
      setProduits([])
    }
  }

  const genererCSV = async () => {
    if (produits.length === 0) {
      setError('Aucun produit à exporter. Ajoutez des produits depuis la page Veille Concurrentielle.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Préparer les produits avec leurs descriptions SEO si disponibles
      const produitsAvecDescriptions = produits.map((produit, index) => {
        const produitCopy = { ...produit }
        if (descriptions[index]) {
          produitCopy.description_seo = descriptions[index].description_seo
          produitCopy.meta_description = descriptions[index].meta_description
          produitCopy.mots_cles = descriptions[index].mots_cles
        }
        return produitCopy
      })

      const response = await axios.post(
        `${API_BASE_URL}/api/generate-boutique-csv`,
        {
          produits: produitsAvecDescriptions,
          export_type: exportType
        },
        { responseType: 'blob' }
      )

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      link.setAttribute('download', `boutique_${exportType}_${timestamp}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du CSV')
    } finally {
      setLoading(false)
    }
  }

  const calculerTotal = () => {
    return produits.reduce((sum, p) => sum + (p.prix || 0), 0)
  }

  const genererDescriptionsSEO = async () => {
    if (produits.length === 0) {
      setError('Aucun produit dans la boutique')
      return
    }

    setGeneratingDescriptions(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/boutique/generate-descriptions-batch`,
        {
          produits: produits
        }
      )

      if (response.data.success && response.data.resultats) {
        const nouvellesDescriptions = {}
        response.data.resultats.forEach((resultat, index) => {
          nouvellesDescriptions[index] = resultat.description
        })
        setDescriptions(nouvellesDescriptions)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération des descriptions')
    } finally {
      setGeneratingDescriptions(false)
    }
  }

  // État pour la publication sur le marketplace
  const [publishingToMarketplace, setPublishingToMarketplace] = useState(false)
  const [publishMessage, setPublishMessage] = useState(null)

  const publierSurMarketplace = async () => {
    if (produits.length === 0) {
      setError('Aucun produit à publier')
      return
    }

    // Vérifier que les descriptions SEO sont générées
    if (Object.keys(descriptions).length === 0) {
      const confirmGenerate = window.confirm(
        'Les descriptions SEO ne sont pas encore générées. Voulez-vous les générer maintenant avant de publier ?'
      )
      if (confirmGenerate) {
        await genererDescriptionsSEO()
        // Attendre un peu pour que les descriptions soient sauvegardées
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        return
      }
    }

    setPublishingToMarketplace(true)
    setError(null)
    setPublishMessage(null)

    try {
      // Préparer les produits avec leurs descriptions SEO et métadonnées
      const produitsAPublier = produits.map((produit, index) => {
        const produitData = {
          produit: produit,
          description_seo: descriptions[index] || null,
          validation_data: null, // Peut être ajouté plus tard si validation Google Trends disponible
          niche_data: nicheAnalysis || null,
          user_id: null, // Peut être ajouté si système d'authentification
          session_id: `session_${Date.now()}` // Session ID basique
        }
        return produitData
      })

      const response = await axios.post(
        `${API_BASE_URL}/api/marketplace/publish-products-batch`,
        produitsAPublier
      )

      if (response.data.success) {
        const successCount = response.data.published
        const totalCount = response.data.total

        setPublishMessage({
          type: 'success',
          text: `✅ ${successCount} produit(s) publié(s) avec succès sur tafa-business.com !`
        })

        // Rediriger vers le marketplace après 2 secondes
        setTimeout(() => {
          window.open('http://localhost:3001/products', '_blank')
        }, 2000)
      } else {
        setPublishMessage({
          type: 'error',
          text: 'Erreur lors de la publication'
        })
      }
    } catch (err) {
      console.error('Erreur publication marketplace:', err)
      setPublishMessage({
        type: 'error',
        text: err.response?.data?.detail || err.message || 'Erreur lors de la publication sur le marketplace'
      })
    } finally {
      setPublishingToMarketplace(false)
      if (publishMessage) {
        setTimeout(() => setPublishMessage(null), 5000)
      }
    }
  }

  // Fonctions pour l'ajout manuel (drag & drop)
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))

    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
        setManualProduit({ ...manualProduit, image: event.target.result })
      }
      reader.readAsDataURL(imageFile)
    } else {
      const text = e.dataTransfer.getData('text/plain')
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        setManualProduit({ ...manualProduit, image: text })
        setImagePreview(text)
      }
    }
  }

  const handleImageUrlChange = (url) => {
    setManualProduit({ ...manualProduit, image: url })
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'))) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const handlePaste = (e) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        const reader = new FileReader()
        reader.onload = (event) => {
          setImagePreview(event.target.result)
          setManualProduit({ ...manualProduit, image: event.target.result })
        }
        reader.readAsDataURL(file)
        e.preventDefault()
        break
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
        setManualProduit({ ...manualProduit, image: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDropZoneClick = () => {
    fileInputRef.current?.click()
  }

  const ajouterManuel = () => {
    if (!manualProduit.nom.trim()) {
      setError('Le nom du produit est obligatoire')
      return
    }

    const produitManuel = {
      nom: manualProduit.nom.trim(),
      prix_texte: manualProduit.prix_texte.trim() || 'Prix non spécifié',
      prix: 0,
      image: manualProduit.image.trim() || '',
      lien: manualProduit.lien.trim() || '',
      categorie: manualProduit.categorie.trim() || 'Manuel',
      marque: manualProduit.marque.trim() || '',
      source: 'Manuel'
    }

    ajouterABoutique(produitManuel)

    // Réinitialiser le formulaire
    setManualProduit({
      nom: '',
      prix_texte: '',
      image: '',
      lien: '',
      categorie: '',
      marque: ''
    })
    setImagePreview('')
    setShowManualAdd(false)
    setError(null)
  }

  // Fonction pour rechercher les tendances Google Trends
  const rechercherTrends = async () => {
    if (!trendsKeyword.trim()) {
      setTrendsError('Veuillez entrer un mot-clé')
      return
    }

    setTrendsLoading(true)
    setTrendsError(null)
    setTrendsData(null)
    setTrendsProducts([])

    try {
      // Rechercher les tendances
      const trendsResponse = await axios.post(`${API_BASE_URL}/api/trends`, {
        keywords: [trendsKeyword.trim()],
        timeframe: 'today 3-m',
        geo: 'SN'
      })

      if (trendsResponse.data.success && trendsResponse.data.trends) {
        setTrendsData(trendsResponse.data)

        // Rechercher des produits Jumia correspondants
        try {
          const jumiaResponse = await axios.get(
            `${API_BASE_URL}/api/veille-concurrentielle?terme=${encodeURIComponent(trendsKeyword.trim())}&limit=10`
          )

          if (jumiaResponse.data.produits && jumiaResponse.data.produits.length > 0) {
            // Enrichir les produits avec les scores Google Trends
            const produitsEnrichis = jumiaResponse.data.produits.map(produit => {
              const trend = trendsResponse.data.trends[0]
              const score = trend ? Math.round(trend.average) : 0
              return {
                ...produit,
                trends_score: score,
                trends_validated: score >= 50,
                trends_recommendation: score >= 70 ? '🟢 GO FORT' : score >= 50 ? '🟡 GO MODÉRÉ' : score >= 30 ? '🟠 ATTENTION' : '🔴 NO GO'
              }
            })

            // Trier par score décroissant
            produitsEnrichis.sort((a, b) => b.trends_score - a.trends_score)
            setTrendsProducts(produitsEnrichis)
          }
        } catch (err) {
          console.error('Erreur recherche Jumia:', err)
          // On continue même si Jumia échoue
        }
      } else {
        setTrendsError('Aucune donnée de tendance disponible')
      }
    } catch (err) {
      setTrendsError(err.response?.data?.detail || 'Erreur lors de la recherche des tendances')
    } finally {
      setTrendsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🛍️ Créer une Boutique</h1>
        <p className="subtitle">Sélectionnez des produits depuis Jumia et créez votre boutique de niche</p>

        {/* Section sélection produits */}
        <div className="marketing-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ margin: 0 }}>Ajouter des produits</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-primary"
                onClick={() => setShowTrends(!showTrends)}
                style={{ background: showTrends ? '#667eea' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {showTrends ? '✕ Fermer' : '📈 Produits tendance (Google Trends)'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowManualAdd(!showManualAdd)}
              >
                {showManualAdd ? '✕ Fermer' : '+ Ajouter manuellement'}
              </button>
            </div>
          </div>

          {/* Section Google Trends */}
          {showTrends && (
            <div className="trends-section" style={{
              background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '2px solid #667eea'
            }}>
              <h3 style={{ marginTop: 0, color: '#667eea', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📈</span>
                <span>Découvrir les produits les plus demandés</span>
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Recherchez un mot-clé pour voir les produits tendance sur Google Trends et Jumia
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={trendsKeyword}
                  onChange={(e) => setTrendsKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && rechercherTrends()}
                  placeholder="Ex: perruque, smartphone, chaussure..."
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #d1d5db',
                    fontSize: '1rem'
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={rechercherTrends}
                  disabled={trendsLoading || !trendsKeyword.trim()}
                >
                  {trendsLoading ? (
                    <>
                      <span className="spinner"></span>
                      Recherche...
                    </>
                  ) : (
                    '🔍 Rechercher'
                  )}
                </button>
              </div>

              {trendsError && (
                <div className="alert alert-error" style={{ marginBottom: '15px' }}>
                  ⚠️ {trendsError}
                </div>
              )}

              {/* Résultats des tendances */}
              {trendsData && trendsData.trends && trendsData.trends.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <h4 style={{ marginTop: 0, color: '#1f2937' }}>
                      📊 Tendances pour "{trendsKeyword}"
                    </h4>
                    {trendsData.trends.map((trend, idx) => (
                      <div key={idx} style={{
                        padding: '10px',
                        background: '#f9fafb',
                        borderRadius: '6px',
                        marginTop: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600' }}>{trend.keyword}</span>
                          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
                            <span>📈 Moyenne: <strong>{Math.round(trend.average)}/100</strong></span>
                            <span>⬆️ Max: <strong>{trend.max}</strong></span>
                            <span>📊 Min: <strong>{trend.min}</strong></span>
                          </div>
                        </div>
                        <div style={{
                          marginTop: '8px',
                          height: '6px',
                          background: '#e5e7eb',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${trend.average}%`,
                            background: trend.average >= 70 ? 'linear-gradient(90deg, #10b981, #059669)' :
                              trend.average >= 50 ? 'linear-gradient(90deg, #f59e0b, #d97706)' :
                                'linear-gradient(90deg, #ef4444, #dc2626)',
                            transition: 'width 0.3s'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Produits Jumia correspondants avec scores */}
              {trendsProducts.length > 0 && (
                <div>
                  <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>
                    🛍️ Produits Jumia correspondants (triés par popularité Google Trends)
                  </h4>
                  <div className="produits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {trendsProducts.map((produit, index) => (
                      <div key={index} className="produit-card" style={{
                        border: produit.trends_validated ? '2px solid #10b981' : '2px solid #e5e7eb',
                        position: 'relative'
                      }}>
                        {/* Badge de score Google Trends */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: produit.trends_validated
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          zIndex: 10,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}>
                          {produit.trends_recommendation} {produit.trends_score}/100
                        </div>

                        {produit.image && (
                          <img src={produit.image} alt={produit.nom} className="produit-image" />
                        )}
                        <div className="produit-info">
                          <h4 className="produit-nom">{produit.nom}</h4>
                          <p className="produit-prix">{produit.prix_texte || produit.prix}</p>
                          {produit.categorie && (
                            <p className="produit-categorie">{produit.categorie}</p>
                          )}
                          <button
                            className="btn btn-small btn-success"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              ajouterABoutique(produit)
                            }}
                            disabled={produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom) || addedMessages[produit.lien || produit.nom]}
                            style={{
                              opacity: produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom) || addedMessages[produit.lien || produit.nom] ? 0.6 : 1,
                              transition: 'all 0.3s'
                            }}
                          >
                            {addedMessages[produit.lien || produit.nom]
                              ? '✅ Ajouté !'
                              : produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom)
                                ? '✓ Déjà ajouté'
                                : '+ Ajouter à la boutique'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!trendsLoading && !trendsData && !trendsError && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
                  <p>Entrez un mot-clé et cliquez sur "Rechercher" pour découvrir les produits tendance</p>
                </div>
              )}
            </div>
          )}

          {/* Formulaire d'ajout manuel */}
          {showManualAdd && (
            <div className="manual-add-form">
              <h3>Ajouter un produit manuellement</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label htmlFor="manual-nom">Nom du produit *</label>
                  <input
                    id="manual-nom"
                    type="text"
                    value={manualProduit.nom}
                    onChange={(e) => setManualProduit({ ...manualProduit, nom: e.target.value })}
                    placeholder="Ex: Smartphone Samsung Galaxy S23"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="manual-prix">Prix</label>
                  <input
                    id="manual-prix"
                    type="text"
                    value={manualProduit.prix_texte}
                    onChange={(e) => setManualProduit({ ...manualProduit, prix_texte: e.target.value })}
                    placeholder="Ex: 150 000 FCFA"
                  />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="manual-image">Image du produit</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                    <div
                      className={`image-drop-zone ${isDragging ? 'dragging' : ''} ${imagePreview ? 'has-preview' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onPaste={handlePaste}
                      onClick={handleDropZoneClick}
                    >
                      {imagePreview ? (
                        <div className="image-preview-wrapper">
                          <img src={imagePreview} alt="Aperçu" className="image-preview" />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => {
                              setImagePreview('')
                              setManualProduit({ ...manualProduit, image: '' })
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="drop-zone-content">
                          <div className="drop-zone-icon">📷</div>
                          <p className="drop-zone-text">
                            <strong>Glissez-déposez une image ici</strong>
                          </p>
                          <p className="drop-zone-subtext">
                            ou collez une URL d'image (Ctrl+V)
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="manual-image"
                      type="url"
                      value={manualProduit.image && !manualProduit.image.startsWith('data:') ? manualProduit.image : ''}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="Ou entrez une URL d'image: https://..."
                      className="image-url-input"
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label htmlFor="manual-lien">Lien (Jumia/Alibaba)</label>
                  <input
                    id="manual-lien"
                    type="url"
                    value={manualProduit.lien}
                    onChange={(e) => setManualProduit({ ...manualProduit, lien: e.target.value })}
                    placeholder="https://www.jumia.sn/... ou https://www.alibaba.com/..."
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="manual-categorie">Catégorie</label>
                  <input
                    id="manual-categorie"
                    type="text"
                    value={manualProduit.categorie}
                    onChange={(e) => setManualProduit({ ...manualProduit, categorie: e.target.value })}
                    placeholder="Ex: Téléphones"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="manual-marque">Marque</label>
                  <input
                    id="manual-marque"
                    type="text"
                    value={manualProduit.marque}
                    onChange={(e) => setManualProduit({ ...manualProduit, marque: e.target.value })}
                    placeholder="Ex: Samsung"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button
                  className="btn btn-success"
                  onClick={ajouterManuel}
                  disabled={!manualProduit.nom.trim()}
                >
                  ✓ Ajouter à la boutique
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowManualAdd(false)
                    setManualProduit({
                      nom: '',
                      prix_texte: '',
                      image: '',
                      lien: '',
                      categorie: '',
                      marque: ''
                    })
                    setImagePreview('')
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
              <div className="input-group">
                <label htmlFor="categorie-boutique">Catégorie Jumia</label>
                <select
                  id="categorie-boutique"
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                  disabled={loadingProduits}
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="nombre-produits">Nombre de produits</label>
                <input
                  id="nombre-produits"
                  type="number"
                  min="1"
                  max="100"
                  value={nombreProduits}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 20
                    setNombreProduits(Math.max(1, Math.min(100, value)))
                  }}
                  disabled={loadingProduits}
                  style={{ width: '100%' }}
                />
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Entre 1 et 100 produits
                </small>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={loadProduits}
              disabled={loadingProduits || !selectedCategorie}
            >
              {loadingProduits ? (
                <>
                  <span className="spinner"></span>
                  Chargement...
                </>
              ) : (
                `📥 Charger ${nombreProduits} produit${nombreProduits > 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '15px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Liste des produits disponibles */}
          {produitsDisponibles.length > 0 && (
            <div className="produits-grid" style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Produits disponibles ({produitsDisponibles.length})</h3>
                {produitsDisponibles.some(p => p.trends_score !== undefined) && (
                  <div style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600'
                  }}>
                    📊 Triés par tendance Google Trends
                  </div>
                )}
              </div>
              {produitsDisponibles.map((produit, index) => (
                <div key={index} className="produit-card" style={{
                  border: produit.trends_validated ? '2px solid #10b981' : produit.trends_score !== undefined ? '2px solid #f59e0b' : '2px solid #e5e7eb',
                  position: 'relative'
                }}>
                  {/* Badge de score Google Trends */}
                  {produit.trends_score !== undefined && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: produit.trends_validated
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {produit.trends_validated ? '✅' : '⚠️'}
                      <span>{produit.trends_score}/100</span>
                    </div>
                  )}

                  {produit.image && (
                    <img src={produit.image} alt={produit.nom} className="produit-image" />
                  )}
                  <div className="produit-info">
                    <h4 className="produit-nom">{produit.nom}</h4>
                    <p className="produit-prix">{produit.prix_texte || produit.prix}</p>
                    {produit.categorie && (
                      <p className="produit-categorie">{produit.categorie}</p>
                    )}

                    {/* Affichage de la recommandation Google Trends */}
                    {produit.trends_recommendation && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 10px',
                        background: produit.trends_validated ? '#d1fae5' : '#fef3c7',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        color: produit.trends_validated ? '#065f46' : '#92400e',
                        fontWeight: '600'
                      }}>
                        {produit.trends_recommendation.split(':')[0]}
                      </div>
                    )}

                    <button
                      className="btn btn-small btn-success"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        ajouterABoutique(produit)
                      }}
                      disabled={produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom) || addedMessages[produit.lien || produit.nom]}
                      style={{
                        marginTop: '10px',
                        opacity: produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom) || addedMessages[produit.lien || produit.nom] ? 0.6 : 1,
                        transition: 'all 0.3s'
                      }}
                    >
                      {addedMessages[produit.lien || produit.nom]
                        ? '✅ Ajouté !'
                        : produits.some(p => (p.lien && produit.lien && p.lien === produit.lien) || p.nom === produit.nom)
                          ? '✓ Déjà ajouté'
                          : '+ Ajouter à la boutique'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {produits.length === 0 ? (
          <div className="info-card empty-cart" style={{ marginTop: '30px' }}>
            <h2>Votre sélection est vide</h2>
            <p>Pour ajouter des produits :</p>
            <ol>
              <li>Sélectionnez une catégorie Jumia ci-dessus et cliquez sur "Charger 20 produits"</li>
              <li>Ou cliquez sur "Ajouter manuellement" pour créer un produit personnalisé</li>
              <li>Cliquez sur <strong>"Ajouter à la boutique"</strong> sur les produits qui vous intéressent</li>
            </ol>
            <p className="tip">💡 L'idée : créer une boutique entière sur une niche spécifique</p>
          </div>
        ) : (
          <>
            {/* Analyse de Niche */}
            {nicheAnalysis && (
              <div className="niche-analysis-card" style={{
                marginTop: '30px',
                padding: '20px',
                background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                borderRadius: '12px',
                border: `3px solid ${nicheAnalysis.niveau === 'EXCELLENT' ? '#10b981' : nicheAnalysis.niveau === 'BON' ? '#3b82f6' : nicheAnalysis.niveau === 'MOYEN' ? '#f59e0b' : '#ef4444'}`,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{nicheAnalysis.niveau === 'EXCELLENT' ? '🟢' : nicheAnalysis.niveau === 'BON' ? '🔵' : nicheAnalysis.niveau === 'MOYEN' ? '🟡' : '🔴'}</span>
                    <span>Analyse de Niche</span>
                  </h3>
                  <div style={{
                    padding: '8px 16px',
                    background: nicheAnalysis.niveau === 'EXCELLENT' ? '#10b981' : nicheAnalysis.niveau === 'BON' ? '#3b82f6' : nicheAnalysis.niveau === 'MOYEN' ? '#f59e0b' : '#ef4444',
                    color: 'white',
                    borderRadius: '20px',
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    {nicheAnalysis.score_coherence}/100
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#667eea', marginBottom: '8px' }}>🎯 Niche identifiée :</h4>
                  <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>
                    {nicheAnalysis.niche_identifiee}
                  </p>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#667eea', marginBottom: '8px' }}>📊 Analyse :</h4>
                  <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                    {nicheAnalysis.analyse}
                  </p>
                </div>

                {nicheAnalysis.points_forts && nicheAnalysis.points_forts.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#10b981', marginBottom: '8px' }}>✅ Points forts :</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563' }}>
                      {nicheAnalysis.points_forts.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {nicheAnalysis.points_faibles && nicheAnalysis.points_faibles.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#ef4444', marginBottom: '8px' }}>⚠️ Points à améliorer :</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563' }}>
                      {nicheAnalysis.points_faibles.map((point, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {nicheAnalysis.recommandations && nicheAnalysis.recommandations.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ color: '#667eea', marginBottom: '8px' }}>💡 Recommandations :</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {nicheAnalysis.recommandations.map((rec, idx) => (
                        <div key={idx} style={{
                          padding: '10px',
                          background: 'white',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{
                              padding: '4px 8px',
                              background: rec.type === 'AJOUTER' ? '#d1fae5' : rec.type === 'RETIRER' ? '#fee2e2' : '#fef3c7',
                              color: rec.type === 'AJOUTER' ? '#065f46' : rec.type === 'RETIRER' ? '#991b1b' : '#92400e',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {rec.type}
                            </span>
                            <strong style={{ color: '#1f2937' }}>{rec.produit}</strong>
                          </div>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>{rec.raison}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Public cible</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{nicheAnalysis.public_cible}</div>
                  </div>
                  <div style={{ padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Potentiel cross-selling</div>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{nicheAnalysis.potentiel_cross_selling}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Résumé */}
            <div className="boutique-summary">
              <div className="summary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>📊 Résumé de votre boutique</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {produits.length >= 3 && (
                      <button
                        className="btn btn-primary btn-small"
                        onClick={validerNiche}
                        disabled={validatingNiche}
                        title="Valider la cohérence de niche"
                      >
                        {validatingNiche ? (
                          <>
                            <span className="spinner"></span>
                            Analyse...
                          </>
                        ) : (
                          '🔍 Valider la niche'
                        )}
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={chargerProduits}
                      title="Rafraîchir la liste"
                    >
                      🔄 Actualiser
                    </button>
                  </div>
                </div>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Produits sélectionnés</span>
                    <span className="stat-value">{produits.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Valeur totale</span>
                    <span className="stat-value">{calculerTotal().toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Génération des descriptions SEO */}
            <div className="export-options">
              <div className="export-card">
                <h3>✨ Générer les descriptions SEO</h3>
                <p style={{ color: '#6b7280', marginBottom: '15px', fontSize: '0.9rem' }}>
                  Génère des descriptions optimisées pour le SEO, adaptées à WooCommerce et Shopify
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={genererDescriptionsSEO}
                    disabled={generatingDescriptions || produits.length === 0}
                  >
                    {generatingDescriptions ? (
                      <>
                        <span className="spinner"></span>
                        Génération en cours...
                      </>
                    ) : (
                      '✨ Générer les descriptions SEO'
                    )}
                  </button>

                  {/* Bouton Publier sur Marketplace */}
                  <button
                    className="btn btn-success"
                    onClick={publierSurMarketplace}
                    disabled={publishingToMarketplace || produits.length === 0}
                  >
                    {publishingToMarketplace ? (
                      <>
                        <span className="spinner"></span>
                        Publication en cours...
                      </>
                    ) : (
                      '🚀 Publier sur tafa-business.com'
                    )}
                  </button>
                </div>

                {/* Message de publication */}
                {publishMessage && (
                  <div className={`alert ${publishMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '15px' }}>
                    {publishMessage.text}
                  </div>
                )}
              </div>
            </div>

            {/* Options d'export */}
            <div className="export-options">
              <div className="export-card">
                <h3>📥 Exporter la boutique</h3>
                <div className="export-controls">
                  <div className="export-type-selector">
                    <label>
                      <input
                        type="radio"
                        value="wordpress"
                        checked={exportType === 'wordpress'}
                        onChange={(e) => setExportType(e.target.value)}
                      />
                      <span>WordPress / WooCommerce</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="shopify"
                        checked={exportType === 'shopify'}
                        onChange={(e) => setExportType(e.target.value)}
                      />
                      <span>Shopify</span>
                    </label>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={genererCSV}
                    disabled={loading || produits.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner"></span>
                        Génération...
                      </>
                    ) : (
                      <>
                        📥 Générer le CSV {exportType === 'wordpress' ? 'WooCommerce' : 'Shopify'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            {/* Liste des produits */}
            <div className="boutique-produits">
              <div className="produits-header">
                <h2>Produits de votre boutique ({produits.length})</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={chargerProduits}
                    title="Actualiser la liste des produits"
                  >
                    🔄 Actualiser
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={viderPanier}
                    disabled={produits.length === 0}
                  >
                    🗑️ Vider la sélection
                  </button>
                </div>
              </div>

              <div className="produits-grid">
                {produits.map((produit, index) => (
                  <div key={index} className="produit-card boutique-card">
                    {produit.image && (
                      <img src={produit.image} alt={produit.nom} className="produit-image" />
                    )}
                    <div className="produit-info">
                      {produit.remise && (
                        <span className="produit-remise">-{produit.remise}</span>
                      )}
                      <h3 className="produit-nom">{produit.nom}</h3>
                      {produit.marque && (
                        <p className="produit-marque">🏷️ {produit.marque}</p>
                      )}
                      <div className="produit-details">
                        <span className="produit-prix">{produit.prix_texte || `${produit.prix} FCFA`}</span>
                      </div>
                      {produit.categorie && (
                        <p className="produit-categorie">📂 {produit.categorie}</p>
                      )}

                      {/* Description SEO */}
                      {descriptions[index] && (
                        <div className="description-seo-section">
                          <div className="description-seo-header">
                            <strong>📝 Description SEO</strong>
                            {descriptions[index].from_cache && (
                              <span className="cache-badge">💾 Depuis le cache</span>
                            )}
                          </div>
                          <div
                            className="description-seo-content"
                            dangerouslySetInnerHTML={{ __html: descriptions[index].description_seo }}
                          />
                          {descriptions[index].meta_description && (
                            <div className="meta-description">
                              <strong>Meta description:</strong>
                              <p>{descriptions[index].meta_description}</p>
                            </div>
                          )}
                          {descriptions[index].mots_cles && (
                            <div className="mots-cles">
                              <strong>Mots-clés:</strong>
                              <p>{descriptions[index].mots_cles}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="boutique-actions">
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => supprimerProduit(index)}
                        >
                          🗑️ Supprimer
                        </button>
                        {produit.lien && (
                          <a
                            href={produit.lien}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-small"
                          >
                            🔗 Voir
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreerBoutique

