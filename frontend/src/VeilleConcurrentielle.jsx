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
  const [selectedTri, setSelectedTri] = useState('popularite')
  const [limit, setLimit] = useState(20)

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
      if (selectedCategorie) {
        params.categorie = selectedCategorie
      }
      if (selectedTri) {
        params.tri = selectedTri
      }

      const response = await axios.get(`${API_BASE_URL}/api/veille-concurrentielle`, { params })
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

  // Ne pas charger automatiquement au montage - l'utilisateur doit cliquer sur "Analyser"

  return (
    <div className="app">
      <div className="container">
        <h1>🔍 Veille Concurrentielle</h1>
        <p className="subtitle">Analysez les meilleurs articles de Jumia Sénégal</p>

        {/* Formulaire de filtres */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="categorie">Catégorie</label>
              <select
                id="categorie"
                value={selectedCategorie}
                onChange={(e) => setSelectedCategorie(e.target.value)}
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

