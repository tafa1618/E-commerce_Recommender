import React, { useState } from 'react'
import axios from 'axios'
import VeilleConcurrentielle from './VeilleConcurrentielle'
import Alibaba from './Alibaba'
import CreerBoutique from './CreerBoutique'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function AnalyseProduit() {
  const [nomProduit, setNomProduit] = useState('')
  const [lien, setLien] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)

  const handleAnalyse = async () => {
    if (!nomProduit.trim()) {
      setError('Veuillez entrer un nom de produit')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/analyse`, {
        nom_produit: nomProduit,
        lien: lien || null
      })
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCSV = async () => {
    if (!result || !result.produits_lookalike || result.produits_lookalike.length === 0) {
      setError('Aucun produit à exporter')
      return
    }

    setCsvLoading(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/generate-csv`,
        { produits: result.produits_lookalike },
        { responseType: 'blob' }
      )

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `produits_wordpress_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération du CSV')
    } finally {
      setCsvLoading(false)
    }
  }

  const getDecisionColor = (decision) => {
    switch (decision) {
      case 'GO':
        return '#10b981'
      case 'NO_GO':
        return '#ef4444'
      case 'ERREUR':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>🧠 Analyse Produit E-commerce</h1>

        <div className="form-section">
          <div className="input-group">
            <label htmlFor="nom-produit">Nom du produit *</label>
            <input
              id="nom-produit"
              type="text"
              value={nomProduit}
              onChange={(e) => setNomProduit(e.target.value)}
              placeholder="Ex: Téléphone Samsung Galaxy"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="lien">Lien (Jumia / Alibaba)</label>
            <input
              id="lien"
              type="text"
              value={lien}
              onChange={(e) => setLien(e.target.value)}
              placeholder="https://..."
              disabled={loading}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleAnalyse}
            disabled={loading || !nomProduit.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyse en cours...
              </>
            ) : (
              'Analyser'
            )}
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {result && (
          <div className="result-section">
            <div className="decision-card">
              <div className="decision-header">
                <h2>Décision</h2>
                <span
                  className="decision-badge"
                  style={{ backgroundColor: getDecisionColor(result.decision) }}
                >
                  {result.decision}
                </span>
              </div>
              <p className="raison">{result.raison}</p>
              {result.categorie && (
                <p className="categorie">Catégorie: {result.categorie}</p>
              )}
            </div>

            {result.decision === 'GO' && result.produits_lookalike && result.produits_lookalike.length > 0 && (
              <div className="produits-section">
                <h2>Produits complémentaires proposés</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Prix (FCFA)</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.produits_lookalike.map((produit, index) => (
                        <tr key={index}>
                          <td><strong>{produit.nom}</strong></td>
                          <td>{produit.description}</td>
                          <td>{produit.prix_recommande.toLocaleString('fr-FR')}</td>
                          <td>
                            <span className="type-badge">{produit.type}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  className="btn btn-success"
                  onClick={handleGenerateCSV}
                  disabled={csvLoading}
                >
                  {csvLoading ? (
                    <>
                      <span className="spinner"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      📥 Générer le CSV WooCommerce
                    </>
                  )}
                </button>
              </div>
            )}

            {result.decision === 'NO_GO' && (
              <div className="info-message">
                ℹ️ Décision IA : pas de génération de produits complémentaires.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant principal avec navigation
function App() {
  const [currentPage, setCurrentPage] = useState('analyse') // 'analyse', 'veille', 'alibaba' ou 'boutique'

  return (
    <div>
      <nav className="main-nav">
        <div className="nav-container">
          <h2 className="nav-logo">🚀 E-commerce Recommender</h2>
          <div className="nav-links">
            <button
              className={`nav-link ${currentPage === 'analyse' ? 'active' : ''}`}
              onClick={() => setCurrentPage('analyse')}
            >
              📊 Analyse Produit
            </button>
            <button
              className={`nav-link ${currentPage === 'veille' ? 'active' : ''}`}
              onClick={() => setCurrentPage('veille')}
            >
              🔍 Veille Jumia
            </button>
            <button
              className={`nav-link ${currentPage === 'alibaba' ? 'active' : ''}`}
              onClick={() => setCurrentPage('alibaba')}
            >
              🏭 Veille Alibaba
            </button>
            <button
              className={`nav-link ${currentPage === 'boutique' ? 'active' : ''}`}
              onClick={() => setCurrentPage('boutique')}
            >
              🛍️ Créer une Boutique
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'analyse' && <AnalyseProduit />}
      {currentPage === 'veille' && <VeilleConcurrentielle />}
      {currentPage === 'alibaba' && <Alibaba />}
      {currentPage === 'boutique' && <CreerBoutique />}
    </div>
  )
}

export default App

