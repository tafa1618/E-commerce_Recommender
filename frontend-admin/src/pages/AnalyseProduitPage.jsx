import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../App.css' // Import existing styles

const API_BASE_URL = 'http://localhost:8000'

function AnalyseProduitPage() {
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
        <div className="analyse-page">
            <div className="page-header">
                <h1>🧠 Analyse Produit IA</h1>
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
                    💾 Résultat sauvegardé
                </div>
            )}

            <div className="form-section card-box">
                <div className="input-group">
                    <label htmlFor="nom-produit">Nom du produit *</label>
                    <input
                        id="nom-produit"
                        type="text"
                        value={nomProduit}
                        onChange={(e) => setNomProduit(e.target.value)}
                        placeholder="Ex: Téléphone Samsung Galaxy"
                        disabled={loading}
                        className="form-input"
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
                        className="form-input"
                    />
                </div>

                <button
                    className="btn btn-primary full-width"
                    onClick={handleAnalyse}
                    disabled={loading || !nomProduit.trim()}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Analyse en cours...
                        </>
                    ) : (
                        'Analyser avec GPT-4o'
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

                            <div className="produits-lookalike-grid">
                                {result.produits_lookalike.map((produit, index) => (
                                    <div key={index} className="produit-lookalike-card">
                                        {/* Image du produit */}
                                        {produit.image ? (
                                            <img
                                                src={produit.image}
                                                alt={produit.nom}
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }}
                                            />
                                        ) : (
                                            <div className="product-image-placeholder">
                                                🛍️
                                            </div>
                                        )}

                                        <h3>{produit.nom}</h3>

                                        <p className="product-desc">{produit.description}</p>

                                        <div className="product-footer">
                                            <div>
                                                <div className="price-label">Prix recommandé</div>
                                                <div className="price-value">
                                                    {produit.prix_recommande.toLocaleString('fr-FR')} FCFA
                                                </div>
                                            </div>
                                            <span className="type-badge">
                                                {produit.type}
                                            </span>
                                        </div>

                                        {produit.lien_jumia && (
                                            <a
                                                href={produit.lien_jumia}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="jumia-link"
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
    )
}

export default AnalyseProduitPage
