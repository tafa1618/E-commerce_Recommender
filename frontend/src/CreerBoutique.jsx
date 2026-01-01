import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function CreerBoutique() {
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [exportType, setExportType] = useState('wordpress')

  // Fonction pour charger les produits depuis localStorage
  const chargerProduits = () => {
    const produitsSauvegardes = localStorage.getItem('boutique_produits')
    if (produitsSauvegardes) {
      try {
        const produitsParses = JSON.parse(produitsSauvegardes)
        setProduits(produitsParses)
      } catch (e) {
        console.error('Erreur chargement produits:', e)
      }
    } else {
      setProduits([])
    }
  }

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
      chargerProduits()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('boutique-produits-updated', handleBoutiqueUpdate)

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
    }
  }, [])

  // Sauvegarder dans localStorage quand les produits changent
  useEffect(() => {
    if (produits.length > 0) {
      localStorage.setItem('boutique_produits', JSON.stringify(produits))
    } else {
      localStorage.removeItem('boutique_produits')
    }
  }, [produits])

  const supprimerProduit = (index) => {
    const nouveauxProduits = produits.filter((_, i) => i !== index)
    setProduits(nouveauxProduits)
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
      const response = await axios.post(
        `${API_BASE_URL}/api/generate-boutique-csv`,
        { 
          produits: produits,
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

  return (
    <div className="app">
      <div className="container">
        <h1>🛍️ Créer une Boutique</h1>
        <p className="subtitle">Sélectionnez des produits depuis Jumia et créez votre boutique de niche</p>

        {produits.length === 0 ? (
          <div className="info-card empty-cart">
            <h2>Votre sélection est vide</h2>
            <p>Pour ajouter des produits :</p>
            <ol>
              <li>Allez sur la page <strong>Veille Concurrentielle</strong></li>
              <li>Sélectionnez une catégorie et analysez</li>
              <li>Cliquez sur <strong>"Ajouter à la boutique"</strong> sur les produits qui vous intéressent</li>
            </ol>
            <p className="tip">💡 L'idée : créer une boutique entière sur une niche spécifique</p>
          </div>
        ) : (
          <>
            {/* Résumé */}
            <div className="boutique-summary">
              <div className="summary-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>📊 Résumé de votre boutique</h3>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={chargerProduits}
                    title="Rafraîchir la liste"
                  >
                    🔄 Actualiser
                  </button>
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
                <button
                  className="btn btn-danger"
                  onClick={viderPanier}
                  disabled={produits.length === 0}
                >
                  🗑️ Vider la sélection
                </button>
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

