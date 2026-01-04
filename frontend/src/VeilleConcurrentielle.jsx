import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function VeilleConcurrentielle() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [termeRecherche, setTermeRecherche] = useState('')
  const [selectedTri, setSelectedTri] = useState('popularite')
  const [limit, setLimit] = useState(20)
  const [addedMessage, setAddedMessage] = useState(null)
  const [validatingProduct, setValidatingProduct] = useState(null)
  const [validationResults, setValidationResults] = useState({})

  const ajouterABoutique = (produit) => {
    console.log('=== DEBUT ajouterABoutique ===')
    console.log('Produit reçu:', produit)
    console.log('Type:', typeof produit)
    
    try {
      if (!produit) {
        console.error('❌ Produit est null ou undefined')
        setAddedMessage('Erreur: produit invalide')
        setTimeout(() => setAddedMessage(null), 2000)
        return
      }
      
      // Récupérer les produits existants
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
        setAddedMessage('Ce produit est déjà dans votre boutique')
        setTimeout(() => setAddedMessage(null), 2000)
        return
      }
      
      // Créer une copie propre du produit
      const produitAvecSource = {
        nom: produit.nom || 'Produit sans nom',
        prix: produit.prix || 0,
        prix_texte: produit.prix_texte || `${produit.prix || 0} FCFA`,
        lien: produit.lien || '',
        image: produit.image || '',
        marque: produit.marque || '',
        categorie: produit.categorie || '',
        note: produit.note || 'N/A',
        remise: produit.remise || '',
        source: produit.source || 'Jumia'
      }
      
      console.log('Produit à ajouter:', produitAvecSource)
      
      produitsExistants.push(produitAvecSource)
      
      try {
        localStorage.setItem('boutique_produits', JSON.stringify(produitsExistants))
        console.log('✅ Produit sauvegardé dans localStorage')
      } catch (e) {
        console.error('❌ Erreur sauvegarde localStorage:', e)
        setAddedMessage(`Erreur sauvegarde: ${e.message}`)
        setTimeout(() => setAddedMessage(null), 3000)
        return
      }
      
      // Déclencher un événement personnalisé pour notifier les autres composants
      try {
        // Utiliser CustomEvent pour une meilleure compatibilité
        const event = new CustomEvent('boutique-produits-updated', {
          detail: { produit: produitAvecSource, total: produitsExistants.length }
        })
        window.dispatchEvent(event)
        console.log('✅ Événement boutique-produits-updated déclenché')
        console.log(`📦 Total produits dans localStorage: ${produitsExistants.length}`)
        
        // Forcer le rechargement en déclenchant plusieurs fois l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('boutique-produits-updated'))
        }, 100)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('boutique-produits-updated'))
        }, 500)
      } catch (e) {
        console.error('Erreur déclenchement événement:', e)
      }
      
      const nomAffiche = produitAvecSource.nom.length > 30 
        ? produitAvecSource.nom.substring(0, 30) + '...' 
        : produitAvecSource.nom
      
      setAddedMessage(`✅ "${nomAffiche}" ajouté à la boutique`)
      setTimeout(() => setAddedMessage(null), 3000)
      
      console.log('✅ Produit ajouté avec succès. Total produits:', produitsExistants.length)
      console.log('=== FIN ajouterABoutique (SUCCES) ===')
    } catch (e) {
      console.error('❌ ERREUR dans ajouterABoutique:', e)
      console.error('Stack:', e.stack)
      setAddedMessage(`Erreur: ${e.message || 'Erreur inconnue'}`)
      setTimeout(() => setAddedMessage(null), 3000)
    }
  }

  // Charger les catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`)
        setCategories(response.data.categories || [])
      } catch (err) {
        console.error('Erreur chargement catégories:', err)
      }
    }
    loadCategories()
  }, [])

  const handleLoadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        limit: limit
      }
      if (termeRecherche && termeRecherche.trim()) {
        params.terme = termeRecherche.trim()
        // Réinitialiser la catégorie si on fait une recherche
        setSelectedCategorie('')
      } else if (selectedCategorie) {
        params.categorie = selectedCategorie
      }
      if (selectedTri) {
        params.tri = selectedTri
      }

      const response = await axios.get(`${API_BASE_URL}/api/veille-concurrentielle`, { params })
      setData(response.data)
      
      // Sauvegarder les données dans localStorage pour persister entre les pages
      if (response.data && response.data.produits) {
        const cacheKey = `jumia_data_${termeRecherche || selectedCategorie || 'all'}_${selectedTri}_${limit}`
        localStorage.setItem(cacheKey, JSON.stringify(response.data))
        console.log('Données Jumia sauvegardées dans le cache')
      }
    } catch (err) {
      console.error('Erreur API:', err)
      if (err.response) {
        setError(`Erreur ${err.response.status}: ${err.response.data?.detail || err.response.statusText || 'Endpoint non trouvé'}`)
      } else if (err.request) {
        setError('Le serveur backend ne répond pas. Vérifiez qu\'il est bien lancé sur http://localhost:8000')
      } else {
        setError(`Erreur: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Charger les données depuis le cache au montage si disponibles
  useEffect(() => {
    const cacheKey = `jumia_data_${termeRecherche || selectedCategorie || 'all'}_${selectedTri}_${limit}`
    const cachedData = localStorage.getItem(cacheKey)
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData)
        setData(parsedData)
        console.log('Données Jumia chargées depuis le cache')
      } catch (e) {
        console.error('Erreur chargement cache:', e)
      }
    }
  }, [termeRecherche, selectedCategorie, selectedTri, limit])

  const validateProductWithTrends = async (produit) => {
    setValidatingProduct(produit.nom)
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/trends/validate-product`, {
        produit: produit,
        timeframe: 'today 3-m',
        geo: 'SN'
      })
      
      if (response.data.success) {
        const validation = response.data.validation
        setValidationResults(prev => ({
          ...prev,
          [produit.nom]: validation
        }))
      }
    } catch (error) {
      console.error('Erreur validation:', error)
      alert('Erreur lors de la validation Google Trends: ' + (error.response?.data?.detail || error.message))
    } finally {
      setValidatingProduct(null)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🔍 Veille Concurrentielle</h1>
        <p className="subtitle">Analysez les meilleurs articles de Jumia Sénégal</p>

        {/* Formulaire de filtres */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="recherche">Recherche (optionnel)</label>
              <input
                id="recherche"
                type="text"
                value={termeRecherche}
                onChange={(e) => {
                  setTermeRecherche(e.target.value)
                  setSelectedCategorie('') // Réinitialiser la catégorie si on fait une recherche
                }}
                placeholder="Ex: smartphone, t-shirt, ordinateur..."
                disabled={loading}
                className="filter-select"
                style={{ padding: '10px 12px' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLoadData()
                  }
                }}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="categorie">Catégorie</label>
              <select
                id="categorie"
                value={selectedCategorie}
                onChange={(e) => {
                  setSelectedCategorie(e.target.value)
                  setTermeRecherche('') // Réinitialiser la recherche si on change de catégorie
                }}
                disabled={loading}
                className="filter-select"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat.slug}>
                    {cat.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="tri">Trier par</label>
              <select
                id="tri"
                value={selectedTri}
                onChange={(e) => setSelectedTri(e.target.value)}
                disabled={loading}
                className="filter-select"
              >
                <option value="popularite">Popularité</option>
                <option value="prix">Prix (croissant)</option>
                <option value="remise">Meilleure remise</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="limit">Nombre de produits</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                disabled={loading}
                className="filter-select"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button
                className="btn btn-primary"
                onClick={handleLoadData}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Chargement...
                  </>
                ) : (
                  '🔍 Analyser'
                )}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <span className="spinner"></span>
            <p>Chargement des données...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {addedMessage && (
          <div className="alert alert-success">
            {addedMessage}
          </div>
        )}

        {data && (
          <div className="veille-section">
            <div className="info-card">
              <h2>{data.message}</h2>
              {data.nombre_produits !== undefined && (
                <div className="stats-container">
                  <p className="stats">📊 {data.nombre_produits} produits trouvés</p>
                  {data.produits && data.produits.length > 0 && (
                    <div className="price-summary">
                      {(() => {
                        const prix = data.produits
                          .map(p => p.prix || 0)
                          .filter(p => p > 0)
                          .sort((a, b) => a - b)
                        if (prix.length > 0) {
                          const min = prix[0]
                          const max = prix[prix.length - 1]
                          const avg = prix.reduce((a, b) => a + b, 0) / prix.length
                          return (
                            <>
                              <span className="price-min">💰 Prix min: {min.toLocaleString('fr-FR')} FCFA</span>
                              <span className="price-max">💰 Prix max: {max.toLocaleString('fr-FR')} FCFA</span>
                              <span className="price-avg">💰 Prix moyen: {Math.round(avg).toLocaleString('fr-FR')} FCFA</span>
                            </>
                          )
                        }
                        return null
                      })()}
                    </div>
                  )}
                </div>
              )}
              
              {data.produits && data.produits.length > 0 ? (
                <div className="produits-grid">
                  {data.produits.map((produit, index) => (
                    <div key={index} className="produit-card">
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
                          {produit.note && produit.note !== "N/A" && (
                            <span className="produit-note">⭐ {produit.note}</span>
                          )}
                        </div>
                        {produit.categorie && (
                          <p className="produit-categorie">📂 {produit.categorie}</p>
                        )}
                        {/* Badge de validation Google Trends */}
                        {validationResults[produit.nom] && (
                          <div className="trends-validation-badge" style={{
                            marginBottom: '10px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            background: validationResults[produit.nom].validated 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                              : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {validationResults[produit.nom].validated ? '✅' : '⚠️'}
                            <span>Google Trends: {validationResults[produit.nom].score}/100</span>
                            {validationResults[produit.nom].validated && (
                              <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                ({validationResults[produit.nom].recommendation.split(':')[0]})
                              </span>
                            )}
                          </div>
                        )}
                        
                        <div className="produit-actions">
                          {produit.lien && (
                            <a 
                              href={produit.lien} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="produit-lien"
                            >
                              Voir sur Jumia →
                            </a>
                          )}
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              validateProductWithTrends(produit)
                            }}
                            disabled={validatingProduct === produit.nom}
                            title="Valider avec Google Trends"
                            style={{ marginRight: '5px' }}
                          >
                            {validatingProduct === produit.nom ? '⏳ Validation...' : '📈 Valider tendance'}
                          </button>
                          <button
                            className="btn btn-success btn-small btn-ajouter-boutique"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              
                              if (!produit) {
                                alert('Erreur: produit invalide')
                                return
                              }
                              
                              // Feedback visuel immédiat
                              const button = e.currentTarget
                              const originalText = button.innerHTML
                              button.innerHTML = '⏳ Ajout en cours...'
                              button.disabled = true
                              button.style.opacity = '0.7'
                              
                              try {
                                ajouterABoutique(produit)
                                
                                // Feedback de succès
                                setTimeout(() => {
                                  button.innerHTML = '✅ Ajouté!'
                                  button.style.backgroundColor = '#10b981'
                                  
                                  setTimeout(() => {
                                    button.innerHTML = originalText
                                    button.disabled = false
                                    button.style.opacity = '1'
                                    button.style.backgroundColor = ''
                                  }, 1500)
                                }, 300)
                              } catch (error) {
                                // Feedback d'erreur
                                button.innerHTML = '❌ Erreur'
                                button.style.backgroundColor = '#ef4444'
                                
                                setTimeout(() => {
                                  button.innerHTML = originalText
                                  button.disabled = false
                                  button.style.opacity = '1'
                                  button.style.backgroundColor = ''
                                }, 2000)
                              }
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation()
                            }}
                            title="Ajouter ce produit à votre boutique"
                            type="button"
                          >
                            🛍️ Ajouter à la boutique
                          </button>
                        </div>
                        
                        {/* Détails de validation */}
                        {validationResults[produit.nom] && validationResults[produit.nom].details && (
                          <div className="validation-details" style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: '#f3f4f6',
                            borderRadius: '6px',
                            fontSize: '0.85rem'
                          }}>
                            <strong style={{ color: '#667eea' }}>Détails:</strong>
                            <ul style={{ margin: '5px 0 0 20px', padding: 0 }}>
                              {validationResults[produit.nom].details.map((detail, idx) => (
                                <li key={idx} style={{ marginBottom: '3px' }}>{detail}</li>
                              ))}
                            </ul>
                            {validationResults[produit.nom].recommendation && (
                              <p style={{ marginTop: '8px', fontWeight: '600', color: validationResults[produit.nom].validated ? '#10b981' : '#f59e0b' }}>
                                {validationResults[produit.nom].recommendation}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="info-message">
                  <p>Aucun produit trouvé. Essayez une autre catégorie.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="info-message">
            <p>👆 Sélectionnez une catégorie et cliquez sur "Analyser" pour commencer</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VeilleConcurrentielle

