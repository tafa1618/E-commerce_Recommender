import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function VeilleConcurrentielle() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const handleLoadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${API_BASE_URL}/api/veille-concurrentielle`)
      setData(response.data)
    } catch (err) {
      console.error('Erreur API:', err)
      if (err.response) {
        // Erreur HTTP (404, 500, etc.)
        setError(`Erreur ${err.response.status}: ${err.response.data?.detail || err.response.statusText || 'Endpoint non trouvé'}`)
      } else if (err.request) {
        // Pas de réponse du serveur
        setError('Le serveur backend ne répond pas. Vérifiez qu\'il est bien lancé sur http://localhost:8000')
      } else {
        // Autre erreur
        setError(`Erreur: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Charger les données au montage du composant
    handleLoadData()
  }, [])

  return (
    <div className="app">
      <div className="container">
        <h1>🔍 Veille Concurrentielle</h1>
        <p className="subtitle">Analysez les meilleurs articles de Jumia Sénégal</p>

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
              {data.articles && data.articles.length > 0 && (
                <div className="articles-list">
                  <h3>Meilleurs Articles Jumia</h3>
                  <ul>
                    {data.articles.map((article, index) => (
                      <li key={index}>{article}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && !data && !error && (
          <div className="info-message">
            <p>Cliquez sur "Charger les données" pour commencer l'analyse</p>
            <button className="btn btn-primary" onClick={handleLoadData}>
              Charger les données
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VeilleConcurrentielle

