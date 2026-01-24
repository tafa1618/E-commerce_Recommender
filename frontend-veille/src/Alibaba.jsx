import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function Alibaba() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [termeRecherche, setTermeRecherche] = useState('')
  const [selectedTri, setSelectedTri] = useState('popularite')
  const [limit, setLimit] = useState(20)
  const [addedMessage, setAddedMessage] = useState(null)

  const ajouterABoutique = (produit) => {
    try {
      console.log('Ajout produit Alibaba à la boutique:', produit)
      
      if (!produit) {
        console.error('Produit est null ou undefined')
        setAddedMessage('Erreur: produit invalide')
        setTimeout(() => setAddedMessage(null), 2000)
        return
      }
      
      // Récupérer les produits existants
      const produitsExistants = JSON.parse(localStorage.getItem('boutique_produits') || '[]')
      
      // Vérifier si le produit n'est pas déjà présent (par lien ou par nom si pas de lien)
      const existeDeja = produitsExistants.some(p => {
        if (produit.lien && p.lien) {
          return p.lien === produit.lien
        }
        // Si pas de lien, comparer par nom
        return p.nom === produit.nom
      })
      
      if (existeDeja) {
        setAddedMessage('Ce produit est déjà dans votre boutique')
        setTimeout(() => setAddedMessage(null), 2000)
        return
      }
      
      // Ajouter le produit avec une source si pas déjà présente
      const produitAvecSource = {
        ...produit,
        source: produit.source || 'Alibaba'
      }
      
      produitsExistants.push(produitAvecSource)
      localStorage.setItem('boutique_produits', JSON.stringify(produitsExistants))
      
      // Déclencher un événement personnalisé pour notifier les autres composants
      try {
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
      
      const nomAffiche = produit.nom ? (produit.nom.length > 30 ? produit.nom.substring(0, 30) + '...' : produit.nom) : 'Produit'
      setAddedMessage(`✅ "${nomAffiche}" ajouté à la boutique`)
      setTimeout(() => setAddedMessage(null), 3000)
      
      console.log('Produit ajouté avec succès. Total produits:', produitsExistants.length)
    } catch (e) {
      console.error('Erreur ajout produit:', e)
      setAddedMessage(`Erreur lors de l'ajout: ${e.message}`)
      setTimeout(() => setAddedMessage(null), 3000)
    }
  }

  // Charger les catégories au montage
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories-alibaba`)
        setCategories(response.data.categories || [])
      } catch (err) {
        console.error('Erreur chargement catégories:', err)
      }
    }
    loadCategories()
    
    // Charger les paramètres sauvegardés
    try {
      const savedCategorie = localStorage.getItem('alibaba_selectedCategorie')
      const savedTerme = localStorage.getItem('alibaba_termeRecherche')
      const savedTri = localStorage.getItem('alibaba_selectedTri')
      const savedLimit = localStorage.getItem('alibaba_limit')
      const savedData = localStorage.getItem('alibaba_data')
      
      if (savedCategorie !== null) setSelectedCategorie(savedCategorie)
      if (savedTerme !== null) setTermeRecherche(savedTerme)
      if (savedTri !== null) setSelectedTri(savedTri)
      if (savedLimit !== null) setLimit(Number(savedLimit))
      if (savedData) {
        try {
          setData(JSON.parse(savedData))
        } catch (e) {
          console.error('Erreur parsing alibaba_data:', e)
        }
      }
    } catch (e) {
      console.error('Erreur chargement localStorage Alibaba:', e)
    }
  }, [])

  // Sauvegarder les paramètres et données
  useEffect(() => {
    localStorage.setItem('alibaba_selectedCategorie', selectedCategorie)
    localStorage.setItem('alibaba_termeRecherche', termeRecherche)
    localStorage.setItem('alibaba_selectedTri', selectedTri)
    localStorage.setItem('alibaba_limit', limit.toString())
    if (data) {
      localStorage.setItem('alibaba_data', JSON.stringify(data))
    }
  }, [selectedCategorie, termeRecherche, selectedTri, limit, data])

  const handleLoadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = {
        limit: limit
      }
      if (selectedCategorie) {
        params.categorie = selectedCategorie
      }
      if (termeRecherche && termeRecherche.trim()) {
        params.terme = termeRecherche.trim()
      }
      if (selectedTri) {
        params.tri = selectedTri
      }

      const response = await axios.get(`${API_BASE_URL}/api/veille-alibaba`, { params })
      setData(response.data)
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

  return (
    <div className="app">
      <div className="container">
        <h1>🏭 Veille Alibaba</h1>
        <p className="subtitle">Analysez les produits Alibaba pour l'import et la revente</p>

        {/* Formulaire de filtres */}
        <div className="filters-section">
          <div className="filters-grid">
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
              <label htmlFor="recherche">Recherche (optionnel)</label>
              <input
                id="recherche"
                type="text"
                value={termeRecherche}
                onChange={(e) => {
                  setTermeRecherche(e.target.value)
                  setSelectedCategorie('') // Réinitialiser la catégorie si on fait une recherche
                }}
                placeholder="Ex: smartphone, t-shirt..."
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
                <option value="moq">MOQ (Minimum Order Quantity)</option>
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
                  '🔍 Analyser Alibaba'
                )}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-container">
            <span className="spinner"></span>
            <p>Chargement des données depuis Alibaba...</p>
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
                <p className="stats">📊 {data.nombre_produits} produits trouvés</p>
              )}
              
              {data.produits && data.produits.length > 0 ? (
                <div className="produits-grid">
                  {data.produits.map((produit, index) => (
                    <div key={index} className="produit-card">
                      {produit.image && (
                        <img src={produit.image} alt={produit.nom} className="produit-image" />
                      )}
                      <div className="produit-info">
                        <h3 className="produit-nom">{produit.nom}</h3>
                        {produit.marque && (
                          <p className="produit-marque">🏷️ {produit.marque}</p>
                        )}
                        <div className="produit-details">
                          <span className="produit-prix">{produit.prix_texte || `${produit.prix} USD`}</span>
                          {produit.note && produit.note !== "N/A" && (
                            <span className="produit-note">⭐ {produit.note}</span>
                          )}
                        </div>
                        {produit.moq && (
                          <p className="produit-moq">📦 MOQ: {produit.moq}</p>
                        )}
                        {produit.categorie && (
                          <p className="produit-categorie">📂 {produit.categorie}</p>
                        )}
                        <div className="produit-actions">
                          {produit.lien && (
                            <a 
                              href={produit.lien} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="produit-lien"
                            >
                              Voir sur Alibaba →
                            </a>
                          )}
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
                            title="Ajouter ce produit à votre boutique"
                            type="button"
                          >
                            🛍️ Ajouter à la boutique
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="info-message">
                  <p>Aucun produit trouvé. Essayez une autre catégorie ou un autre terme de recherche.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="info-message">
            <p>👆 Sélectionnez une catégorie ou entrez un terme de recherche, puis cliquez sur "Analyser Alibaba"</p>
            <p className="tip">💡 L'idée : Trouvez des produits à importer depuis Alibaba et comparez avec Jumia pour identifier les opportunités</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alibaba

