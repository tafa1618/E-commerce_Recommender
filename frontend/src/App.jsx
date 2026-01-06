import React, { useState, useEffect } from 'react'
import axios from 'axios'
import VeilleConcurrentielle from './VeilleConcurrentielle'
import Alibaba from './Alibaba'
import CreerBoutique from './CreerBoutique'
import Marketing from './Marketing'
import JournalVente from './JournalVente'
import GoogleTrends from './GoogleTrends'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function AnalyseProduit() {
  // Charger les données depuis localStorage au montage
  const loadFromStorage = () => {
    try {
      const savedResult = localStorage.getItem('analyse_produit_result')
      const savedNomProduit = localStorage.getItem('analyse_produit_nom')
      const savedLien = localStorage.getItem('analyse_produit_lien')
      
      if (savedResult) {
        return {
          result: JSON.parse(savedResult),
          nomProduit: savedNomProduit || '',
          lien: savedLien || ''
        }
      }
    } catch (e) {
      console.error('Erreur chargement localStorage:', e)
    }
    return { result: null, nomProduit: '', lien: '' }
  }

  const { result: initialResult, nomProduit: initialNomProduit, lien: initialLien } = loadFromStorage()
  
  const [nomProduit, setNomProduit] = useState(initialNomProduit)
  const [lien, setLien] = useState(initialLien)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(initialResult)
  const [error, setError] = useState(null)
  const [csvLoading, setCsvLoading] = useState(false)

  // Sauvegarder dans localStorage quand le résultat change
  useEffect(() => {
    if (result) {
      try {
        localStorage.setItem('analyse_produit_result', JSON.stringify(result))
        localStorage.setItem('analyse_produit_nom', nomProduit)
        localStorage.setItem('analyse_produit_lien', lien)
      } catch (e) {
        console.error('Erreur sauvegarde localStorage:', e)
      }
    }
  }, [result, nomProduit, lien])

  // Recharger depuis localStorage quand on revient sur la page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const { result: savedResult, nomProduit: savedNomProduit, lien: savedLien } = loadFromStorage()
        if (savedResult && !result) {
          setResult(savedResult)
          setNomProduit(savedNomProduit)
          setLien(savedLien)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [result])

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
      const analysisResult = response.data
      setResult(analysisResult)
      
      // Sauvegarder immédiatement
      try {
        localStorage.setItem('analyse_produit_result', JSON.stringify(analysisResult))
        localStorage.setItem('analyse_produit_nom', nomProduit)
        localStorage.setItem('analyse_produit_lien', lien)
      } catch (e) {
        console.error('Erreur sauvegarde localStorage:', e)
      }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>🧠 Analyse Produit E-commerce</h1>
          {result && (
            <button
              className="btn btn-secondary btn-small"
              onClick={() => {
                setResult(null)
                setNomProduit('')
                setLien('')
                localStorage.removeItem('analyse_produit_result')
                localStorage.removeItem('analyse_produit_nom')
                localStorage.removeItem('analyse_produit_lien')
              }}
              title="Effacer le résultat"
            >
              🗑️ Effacer
            </button>
          )}
        </div>

        {result && (
          <div className="alert alert-info" style={{ marginBottom: '20px', padding: '12px', background: '#dbeafe', color: '#1e40af', borderRadius: '8px', fontSize: '0.9rem' }}>
            💾 Résultat sauvegardé - Vous pouvez naviguer vers d'autres pages, le résultat sera conservé
          </div>
        )}

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
                <h2>Produits complémentaires proposés ({result.produits_lookalike.length})</h2>
                
                {/* Affichage en grille de cartes */}
                <div className="produits-lookalike-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {result.produits_lookalike.map((produit, index) => (
                    <div key={index} className="produit-lookalike-card" style={{
                      background: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: '2px solid #e5e7eb',
                      transition: 'all 0.3s',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)'
                      e.currentTarget.style.borderColor = '#667eea'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                    }}
                    >
                      {/* Image du produit */}
                      {produit.image ? (
                        <img 
                          src={produit.image} 
                          alt={produit.nom}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            background: '#f3f4f6'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '8px',
                          marginBottom: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '3rem'
                        }}>
                          🛍️
                        </div>
                      )}
                      
                      {/* Nom du produit */}
                      <h3 style={{
                        margin: '0 0 10px 0',
                        color: '#1f2937',
                        fontSize: '1.2rem',
                        fontWeight: '600'
                      }}>
                        {produit.nom}
                      </h3>
                      
                      {/* Description */}
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        margin: '0 0 15px 0',
                        flex: 1
                      }}>
                        {produit.description}
                      </p>
                      
                      {/* Prix et Type */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #e5e7eb'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px' }}>Prix recommandé</div>
                          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#667eea' }}>
                            {produit.prix_recommande.toLocaleString('fr-FR')} FCFA
                          </div>
                        </div>
                        <span className="type-badge" style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: '#dbeafe',
                          color: '#1e40af'
                        }}>
                          {produit.type}
                        </span>
                      </div>
                      
                      {/* Lien Jumia */}
                      {produit.lien_jumia && (
                        <a
                          href={produit.lien_jumia}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: '#10b981',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#059669'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#10b981'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <span>🛒</span>
                          Voir sur Jumia →
                        </a>
                      )}
                    </div>
                  ))}
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
  const [currentPage, setCurrentPage] = useState('analyse') // 'analyse', 'veille', 'alibaba', 'boutique', 'marketing', 'journal-vente', 'trends'

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
            <button
              className={`nav-link ${currentPage === 'marketing' ? 'active' : ''}`}
              onClick={() => setCurrentPage('marketing')}
            >
              📢 Marketing
            </button>
            <button
              className={`nav-link ${currentPage === 'journal-vente' ? 'active' : ''}`}
              onClick={() => setCurrentPage('journal-vente')}
            >
              📊 Journal des Ventes
            </button>
            <button
              className={`nav-link ${currentPage === 'trends' ? 'active' : ''}`}
              onClick={() => setCurrentPage('trends')}
            >
              📈 Google Trends
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'analyse' && <AnalyseProduit />}
      {currentPage === 'veille' && <VeilleConcurrentielle />}
      {currentPage === 'alibaba' && <Alibaba />}
      {currentPage === 'boutique' && <CreerBoutique />}
      {currentPage === 'marketing' && <Marketing />}
      {currentPage === 'journal-vente' && <JournalVente />}
      {currentPage === 'trends' && <GoogleTrends />}
    </div>
  )
}

export default App

