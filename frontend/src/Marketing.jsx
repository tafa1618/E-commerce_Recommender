import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

const API_BASE_URL = 'http://localhost:8000'

function Marketing() {
  const [selectedCategorie, setSelectedCategorie] = useState('')
  const [produits, setProduits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [nombreProduits, setNombreProduits] = useState(10)
  const [campagneProduits, setCampagneProduits] = useState([])
  const [descriptifs, setDescriptifs] = useState({})
  const [generatingDescriptifs, setGeneratingDescriptifs] = useState(false)
  const [nomCampagne, setNomCampagne] = useState('')
  const [savingCampagne, setSavingCampagne] = useState(false)
  const [categories, setCategories] = useState([])
  
  // État pour l'ajout manuel
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

  // Charger les catégories au montage
  useEffect(() => {
    loadCategories()
    // Charger les produits de la campagne depuis localStorage
    const saved = localStorage.getItem('campagne_produits')
    if (saved) {
      try {
        setCampagneProduits(JSON.parse(saved))
      } catch (e) {
        console.error('Erreur chargement campagne:', e)
      }
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

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/veille-concurrentielle?categorie=${selectedCategorie}&limit=${nombreProduits}`
      )
      
      if (response.data.produits && response.data.produits.length > 0) {
        setProduits(response.data.produits)
      } else {
        setError('Aucun produit trouvé pour cette catégorie')
        setProduits([])
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des produits')
      setProduits([])
    } finally {
      setLoading(false)
    }
  }

  const ajouterACampagne = (produit) => {
    // Vérifier si le produit n'est pas déjà dans la campagne
    const existe = campagneProduits.some(p => 
      (p.lien && produit.lien && p.lien === produit.lien) || 
      p.nom === produit.nom
    )

    if (existe) {
      setError('Ce produit est déjà dans la campagne')
      return
    }

    const nouveauxProduits = [...campagneProduits, produit]
    setCampagneProduits(nouveauxProduits)
    localStorage.setItem('campagne_produits', JSON.stringify(nouveauxProduits))
    
    // Notification pour rafraîchir si besoin
    window.dispatchEvent(new Event('campagne-produits-updated'))
  }

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
      // Créer une URL locale pour l'aperçu
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target.result)
        // Pour l'instant, on garde l'URL locale, mais on pourrait uploader le fichier
        setManualProduit({ ...manualProduit, image: event.target.result })
      }
      reader.readAsDataURL(imageFile)
    } else {
      // Si c'est du texte (URL collée)
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

    // Créer un produit avec les données manuelles
    const produitManuel = {
      nom: manualProduit.nom.trim(),
      prix_texte: manualProduit.prix_texte.trim() || 'Prix non spécifié',
      prix: 0, // On pourrait parser le prix si nécessaire
      image: manualProduit.image.trim() || '',
      lien: manualProduit.lien.trim() || '',
      categorie: manualProduit.categorie.trim() || 'Manuel',
      marque: manualProduit.marque.trim() || '',
      source: 'Manuel'
    }

    ajouterACampagne(produitManuel)

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

  const retirerDeCampagne = (index) => {
    const nouveauxProduits = campagneProduits.filter((_, i) => i !== index)
    setCampagneProduits(nouveauxProduits)
    localStorage.setItem('campagne_produits', JSON.stringify(nouveauxProduits))
    
    // Retirer aussi le descriptif associé
    const newDescriptifs = { ...descriptifs }
    delete newDescriptifs[index]
    setDescriptifs(newDescriptifs)
    
    window.dispatchEvent(new Event('campagne-produits-updated'))
  }

  const genererDescriptifs = async () => {
    if (campagneProduits.length === 0) {
      setError('Aucun produit dans la campagne')
      return
    }

    setGeneratingDescriptifs(true)
    setError(null)

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/marketing/generate-batch`,
        {
          produits: campagneProduits,
          style: 'attractif'
        }
      )

      if (response.data.success && response.data.resultats) {
        const nouveauxDescriptifs = {}
        response.data.resultats.forEach((resultat, index) => {
          nouveauxDescriptifs[index] = resultat.descriptif
        })
        setDescriptifs(nouveauxDescriptifs)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la génération des descriptifs')
    } finally {
      setGeneratingDescriptifs(false)
    }
  }

  const sauvegarderCampagne = async () => {
    if (!nomCampagne.trim()) {
      setError('Veuillez entrer un nom de campagne')
      return
    }

    if (campagneProduits.length === 0) {
      setError('Aucun produit dans la campagne')
      return
    }

    setSavingCampagne(true)
    setError(null)

    try {
      // Préparer les descriptifs dans le bon format
      const descriptifsArray = campagneProduits.map((_, index) => 
        descriptifs[index] || {
          descriptif: 'Descriptif non généré',
          hashtags: '',
          titre_publicitaire: campagneProduits[index].nom?.substring(0, 30) || 'Produit'
        }
      )

      const response = await axios.post(
        `${API_BASE_URL}/api/marketing/campaign`,
        {
          nom_campagne: nomCampagne.trim(),
          produits: campagneProduits,
          descriptifs: descriptifsArray
        }
      )

      if (response.data.success) {
        alert(`✅ Campagne "${nomCampagne}" sauvegardée avec succès !`)
        // Optionnel: vider la campagne après sauvegarde
        // setCampagneProduits([])
        // setDescriptifs({})
        // localStorage.removeItem('campagne_produits')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde de la campagne')
    } finally {
      setSavingCampagne(false)
    }
  }

  return (
    <div className="app">
      <div className="container">
        <h1>📢 Marketing - Campagnes Facebook Ads</h1>

        {/* Section sélection produits */}
        <div className="marketing-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>1. Sélectionner des produits</h2>
            <button
              className="btn btn-secondary"
              onClick={() => setShowManualAdd(!showManualAdd)}
            >
              {showManualAdd ? '✕ Fermer' : '+ Ajouter manuellement'}
            </button>
          </div>

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
                          <p className="drop-zone-subtext">
                            Formats acceptés: JPG, PNG, GIF, WebP
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
                  ✓ Ajouter à la campagne
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
                <label htmlFor="categorie-marketing">Catégorie Jumia</label>
                <select
                  id="categorie-marketing"
                  value={selectedCategorie}
                  onChange={(e) => setSelectedCategorie(e.target.value)}
                  disabled={loading}
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
                <label htmlFor="nombre-produits-marketing">Nombre de produits</label>
                <input
                  id="nombre-produits-marketing"
                  type="number"
                  min="1"
                  max="100"
                  value={nombreProduits}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 10
                    setNombreProduits(Math.max(1, Math.min(100, value)))
                  }}
                  disabled={loading}
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
              disabled={loading || !selectedCategorie}
            >
              {loading ? (
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
            <div className="alert alert-error">
              ⚠️ {error}
            </div>
          )}

          {/* Liste des produits disponibles */}
          {produits.length > 0 && (
            <div className="produits-grid" style={{ marginTop: '20px' }}>
              <h3>Produits disponibles ({produits.length})</h3>
              {produits.map((produit, index) => (
                <div key={index} className="produit-card">
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
                      onClick={() => ajouterACampagne(produit)}
                      disabled={campagneProduits.some(p => p.lien === produit.lien)}
                    >
                      {campagneProduits.some(p => p.lien === produit.lien) ? '✓ Déjà ajouté' : '+ Ajouter à la campagne'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section campagne */}
        <div className="marketing-section" style={{ marginTop: '40px' }}>
          <h2>2. Ma campagne ({campagneProduits.length} produits)</h2>

          {campagneProduits.length === 0 ? (
            <div className="info-message">
              ℹ️ Aucun produit dans la campagne. Ajoutez des produits depuis la section ci-dessus.
            </div>
          ) : (
            <>
              <div className="campagne-actions">
                <button
                  className="btn btn-primary"
                  onClick={genererDescriptifs}
                  disabled={generatingDescriptifs}
                >
                  {generatingDescriptifs ? (
                    <>
                      <span className="spinner"></span>
                      Génération en cours...
                    </>
                  ) : (
                    '✨ Générer les descriptifs marketing'
                  )}
                </button>
              </div>

              <div className="campagne-produits">
                {campagneProduits.map((produit, index) => (
                  <div key={index} className="campagne-produit-card">
                    <div className="campagne-produit-header">
                      <h4>{produit.nom}</h4>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => retirerDeCampagne(index)}
                      >
                        ✕ Retirer
                      </button>
                    </div>
                    
                    {produit.image && (
                      <img src={produit.image} alt={produit.nom} className="campagne-produit-image" />
                    )}
                    
                    <div className="campagne-produit-info">
                      <p><strong>Prix:</strong> {produit.prix_texte || produit.prix}</p>
                      {produit.categorie && (
                        <p><strong>Catégorie:</strong> {produit.categorie}</p>
                      )}
                    </div>

                    {descriptifs[index] && (
                      <div className="descriptif-marketing">
                        <div className="descriptif-section">
                          <strong>📌 Titre publicitaire:</strong>
                          <p className="descriptif-titre">{descriptifs[index].titre_publicitaire}</p>
                        </div>
                        <div className="descriptif-section">
                          <strong>📝 Descriptif:</strong>
                          <p className="descriptif-texte">{descriptifs[index].descriptif}</p>
                        </div>
                        {descriptifs[index].hashtags && (
                          <div className="descriptif-section">
                            <strong># Hashtags:</strong>
                            <p className="descriptif-hashtags">{descriptifs[index].hashtags}</p>
                          </div>
                        )}
                        {descriptifs[index].from_cache && (
                          <span className="cache-badge">💾 Depuis le cache</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sauvegarder la campagne */}
              <div className="save-campagne-section" style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <label htmlFor="nom-campagne">Nom de la campagne</label>
                  <input
                    id="nom-campagne"
                    type="text"
                    value={nomCampagne}
                    onChange={(e) => setNomCampagne(e.target.value)}
                    placeholder="Ex: Campagne Beauté - Décembre 2024"
                    disabled={savingCampagne}
                  />
                </div>
                <button
                  className="btn btn-success"
                  onClick={sauvegarderCampagne}
                  disabled={savingCampagne || !nomCampagne.trim()}
                >
                  {savingCampagne ? (
                    <>
                      <span className="spinner"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    '💾 Sauvegarder la campagne'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Marketing

