import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function JournalVente() {
  const [ventes, setVentes] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVente, setEditingVente] = useState(null);
  
  // Boutiques
  const [boutiques, setBoutiques] = useState([]);
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState(null);
  const [showBoutiqueForm, setShowBoutiqueForm] = useState(false);
  const [editingBoutique, setEditingBoutique] = useState(null);
  const [boutiqueFormData, setBoutiqueFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    contact: ''
  });
  
  // Formulaire
  const [formData, setFormData] = useState({
    boutique_id: null,
    date_vente: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD
    produit_nom: '',
    prix: '',
    quantite: 1,
    localisation: '',
    client_info: '',
    notes: ''
  });
  
  // Filtres
  const [filtres, setFiltres] = useState({
    boutique_id: null,
    date_debut: '',
    date_fin: '',
    produit_nom: '',
    localisation: ''
  });
  
  // Période de comparaison
  const [anneeComparee, setAnneeComparee] = useState(() => {
    const saved = localStorage.getItem('journal_anneeComparee')
    return saved ? Number(saved) : new Date().getFullYear()
  });
  const [moisCompare, setMoisCompare] = useState(() => {
    const saved = localStorage.getItem('journal_moisCompare')
    return saved ? Number(saved) : null
  });

  // Charger les paramètres sauvegardés au montage
  useEffect(() => {
    try {
      const savedBoutiqueId = localStorage.getItem('journal_selectedBoutiqueId')
      const savedFiltres = localStorage.getItem('journal_filtres')
      
      if (savedBoutiqueId !== null && savedBoutiqueId !== 'null') {
        setSelectedBoutiqueId(Number(savedBoutiqueId))
      }
      if (savedFiltres) {
        try {
          setFiltres(JSON.parse(savedFiltres))
        } catch (e) {
          console.error('Erreur parsing journal_filtres:', e)
        }
      }
    } catch (e) {
      console.error('Erreur chargement localStorage JournalVente:', e)
    }
  }, [])

  // Sauvegarder les paramètres
  useEffect(() => {
    if (selectedBoutiqueId !== null) {
      localStorage.setItem('journal_selectedBoutiqueId', selectedBoutiqueId.toString())
    }
    localStorage.setItem('journal_filtres', JSON.stringify(filtres))
    localStorage.setItem('journal_anneeComparee', anneeComparee.toString())
    if (moisCompare !== null) {
      localStorage.setItem('journal_moisCompare', moisCompare.toString())
    }
  }, [selectedBoutiqueId, filtres, anneeComparee, moisCompare])

  useEffect(() => {
    chargerBoutiques();
  }, []);

  useEffect(() => {
    if (boutiques.length > 0 && !selectedBoutiqueId) {
      setSelectedBoutiqueId(boutiques[0].id);
      setFiltres({ ...filtres, boutique_id: boutiques[0].id });
    }
  }, [boutiques]);

  useEffect(() => {
    if (selectedBoutiqueId) {
      chargerVentes();
      chargerStatistiques();
    }
  }, [selectedBoutiqueId, filtres]);

  const chargerBoutiques = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/boutiques`);
      setBoutiques(response.data.boutiques || []);
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error);
      alert('Erreur lors du chargement des boutiques');
    }
  };

  const chargerVentes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtres.boutique_id) params.boutique_id = filtres.boutique_id;
      if (filtres.date_debut) params.date_debut = filtres.date_debut;
      if (filtres.date_fin) params.date_fin = filtres.date_fin;
      if (filtres.produit_nom) params.produit_nom = filtres.produit_nom;
      if (filtres.localisation) params.localisation = filtres.localisation;
      
      const response = await axios.get(`${API_BASE_URL}/api/journal-vente`, { params });
      setVentes(response.data.ventes || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      alert('Erreur lors du chargement des ventes');
    } finally {
      setLoading(false);
    }
  };

  const chargerStatistiques = async () => {
    try {
      const params = {};
      if (filtres.boutique_id) params.boutique_id = filtres.boutique_id;
      if (filtres.date_debut) params.date_debut = filtres.date_debut;
      if (filtres.date_fin) params.date_fin = filtres.date_fin;
      
      const response = await axios.get(`${API_BASE_URL}/api/journal-vente/statistiques`, { params });
      setStatistiques(response.data.statistiques);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const chargerVentesPeriode = async (annee, mois = null) => {
    setLoading(true);
    try {
      const url = mois 
        ? `${API_BASE_URL}/api/journal-vente/periode/${annee}?mois=${mois}`
        : `${API_BASE_URL}/api/journal-vente/periode/${annee}`;
      const response = await axios.get(url);
      setVentes(response.data.ventes || []);
      setStatistiques(null);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes de la période:', error);
      alert('Erreur lors du chargement des ventes de la période');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        boutique_id: parseInt(formData.boutique_id) || selectedBoutiqueId,
        prix: parseFloat(formData.prix),
        quantite: parseInt(formData.quantite) || 1
      };
      
      if (editingVente) {
        await axios.put(`${API_BASE_URL}/api/journal-vente/${editingVente.id}`, data);
        alert('Vente mise à jour avec succès');
      } else {
        await axios.post(`${API_BASE_URL}/api/journal-vente`, data);
        alert('Vente enregistrée avec succès');
      }
      
      setShowForm(false);
      setEditingVente(null);
      resetForm();
      chargerVentes();
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vente) => {
    setEditingVente(vente);
    setFormData({
      boutique_id: vente.boutique_id,
      date_vente: vente.date_vente,
      produit_nom: vente.produit_nom,
      prix: vente.prix.toString(),
      quantite: vente.quantite,
      localisation: vente.localisation || '',
      client_info: vente.client_info || '',
      notes: vente.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/journal-vente/${id}`);
      alert('Vente supprimée avec succès');
      chargerVentes();
      chargerStatistiques();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      boutique_id: selectedBoutiqueId,
      date_vente: new Date().toISOString().split('T')[0],
      produit_nom: '',
      prix: '',
      quantite: 1,
      localisation: '',
      client_info: '',
      notes: ''
    });
  };

  // Gestion des boutiques
  const handleBoutiqueSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingBoutique) {
        await axios.put(`${API_BASE_URL}/api/boutiques/${editingBoutique.id}`, boutiqueFormData);
        alert('Boutique mise à jour avec succès');
      } else {
        await axios.post(`${API_BASE_URL}/api/boutiques`, boutiqueFormData);
        alert('Boutique créée avec succès');
      }
      
      setShowBoutiqueForm(false);
      setEditingBoutique(null);
      setBoutiqueFormData({ nom: '', description: '', adresse: '', contact: '' });
      chargerBoutiques();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleBoutiqueEdit = (boutique) => {
    setEditingBoutique(boutique);
    setBoutiqueFormData({
      nom: boutique.nom,
      description: boutique.description || '',
      adresse: boutique.adresse || '',
      contact: boutique.contact || ''
    });
    setShowBoutiqueForm(true);
  };

  const handleBoutiqueDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ? Toutes ses ventes seront également supprimées.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/boutiques/${id}`);
      alert('Boutique supprimée avec succès');
      chargerBoutiques();
      if (selectedBoutiqueId === id && boutiques.length > 1) {
        const newBoutique = boutiques.find(b => b.id !== id);
        if (newBoutique) {
          setSelectedBoutiqueId(newBoutique.id);
          setFiltres({ ...filtres, boutique_id: newBoutique.id });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleBoutiqueChange = (boutiqueId) => {
    setSelectedBoutiqueId(boutiqueId);
    setFiltres({ ...filtres, boutique_id: boutiqueId });
  };

  const handleFiltresChange = () => {
    chargerVentes();
    chargerStatistiques();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrix = (prix) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(prix);
  };

  const anneeActuelle = new Date().getFullYear();
  const anneesDisponibles = Array.from({ length: 5 }, (_, i) => anneeActuelle - i);

  return (
    <div className="journal-vente-container">
      <div className="journal-header">
        <h1>📊 Journal des Ventes</h1>
        <p>Enregistrez et suivez vos ventes pour analyser les tendances saisonnières</p>
      </div>

      {/* Sélection de boutique - Améliorée */}
      <div className="boutique-selector-container">
        <div className="boutique-selector-header">
          <h2>🏪 Sélectionner une Boutique</h2>
          <p className="boutique-selector-subtitle">Choisissez la boutique pour laquelle vous souhaitez consulter ou enregistrer des ventes</p>
        </div>
        <div className="boutique-selector-main">
          <div className="boutique-select-wrapper">
            <label className="boutique-select-label">
              <span className="boutique-icon">🏪</span>
              Boutique active:
            </label>
            <select 
              value={selectedBoutiqueId || ''} 
              onChange={(e) => handleBoutiqueChange(parseInt(e.target.value))}
              className="boutique-select-large"
            >
              {boutiques.length === 0 ? (
                <option value="">Aucune boutique disponible</option>
              ) : (
                boutiques.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.nom} {b.adresse ? `- ${b.adresse}` : ''}
                  </option>
                ))
              )}
            </select>
            {selectedBoutiqueId && (
              <div className="selected-boutique-info">
                {(() => {
                  const boutique = boutiques.find(b => b.id === selectedBoutiqueId);
                  return boutique ? (
                    <>
                      {boutique.description && <span className="boutique-desc">{boutique.description}</span>}
                      {boutique.contact && <span className="boutique-contact">📞 {boutique.contact}</span>}
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              setShowBoutiqueForm(true);
              setEditingBoutique(null);
              setBoutiqueFormData({ nom: '', description: '', adresse: '', contact: '' });
            }}
            className="btn-boutique-new"
          >
            <span>➕</span> Nouvelle boutique
          </button>
        </div>
        {!selectedBoutiqueId && boutiques.length > 0 && (
          <div className="boutique-warning">
            ⚠️ Veuillez sélectionner une boutique pour continuer
          </div>
        )}
      </div>

      {/* Formulaire boutique */}
      {showBoutiqueForm && (
        <div className="form-container">
          <h2>{editingBoutique ? 'Modifier la boutique' : 'Nouvelle boutique'}</h2>
          <form onSubmit={handleBoutiqueSubmit}>
            <div className="form-grid">
              <div>
                <label>Nom de la boutique *</label>
                <input
                  type="text"
                  value={boutiqueFormData.nom}
                  onChange={(e) => setBoutiqueFormData({ ...boutiqueFormData, nom: e.target.value })}
                  required
                  placeholder="Ex: Boutique Dakar Centre"
                />
              </div>
              <div>
                <label>Description</label>
                <input
                  type="text"
                  value={boutiqueFormData.description}
                  onChange={(e) => setBoutiqueFormData({ ...boutiqueFormData, description: e.target.value })}
                  placeholder="Description de la boutique"
                />
              </div>
              <div>
                <label>Adresse</label>
                <input
                  type="text"
                  value={boutiqueFormData.adresse}
                  onChange={(e) => setBoutiqueFormData({ ...boutiqueFormData, adresse: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>
              <div>
                <label>Contact</label>
                <input
                  type="text"
                  value={boutiqueFormData.contact}
                  onChange={(e) => setBoutiqueFormData({ ...boutiqueFormData, contact: e.target.value })}
                  placeholder="Téléphone, email..."
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : (editingBoutique ? 'Modifier' : 'Créer')}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowBoutiqueForm(false);
                  setEditingBoutique(null);
                  setBoutiqueFormData({ nom: '', description: '', adresse: '', contact: '' });
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des boutiques (pour gestion) */}
      {boutiques.length > 0 && (
        <div className="boutiques-list">
          <h3>Gérer les boutiques</h3>
          <div className="boutiques-grid">
            {boutiques.map(boutique => (
              <div key={boutique.id} className="boutique-card">
                <h4>{boutique.nom}</h4>
                {boutique.description && <p>{boutique.description}</p>}
                {boutique.adresse && <p className="boutique-info">📍 {boutique.adresse}</p>}
                {boutique.contact && <p className="boutique-info">📞 {boutique.contact}</p>}
                <div className="boutique-actions">
                  <button onClick={() => handleBoutiqueEdit(boutique)} className="btn-edit">Modifier</button>
                  {boutiques.length > 1 && (
                    <button onClick={() => handleBoutiqueDelete(boutique.id)} className="btn-delete">Supprimer</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      {statistiques && selectedBoutiqueId && (
        <div className="stats-container">
          <h2>Statistiques</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Nombre de ventes</div>
              <div className="stat-value">{statistiques.nb_ventes}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">CA Total</div>
              <div className="stat-value">{formatPrix(statistiques.ca_total)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Prix moyen</div>
              <div className="stat-value">{formatPrix(statistiques.prix_moyen)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Quantité totale</div>
              <div className="stat-value">{statistiques.quantite_totale}</div>
            </div>
          </div>
          
          {statistiques.top_produits && statistiques.top_produits.length > 0 && (
            <div className="top-list">
              <h3>Top 10 Produits</h3>
              <ul>
                {statistiques.top_produits.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.produit}</span>
                    <span>{formatPrix(item.ca)} ({item.quantite} unités)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {statistiques.top_localisations && statistiques.top_localisations.length > 0 && (
            <div className="top-list">
              <h3>Top 10 Localisations</h3>
              <ul>
                {statistiques.top_localisations.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.localisation}</span>
                    <span>{formatPrix(item.ca)} ({item.nb_ventes} ventes)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Filtres */}
      {selectedBoutiqueId && (
      <div className="filtres-container">
        <h2>Filtres de Recherche</h2>
        <div className="filtres-info">
          <p className="filtres-boutique-info">
            📍 Boutique active: <strong>{boutiques.find(b => b.id === selectedBoutiqueId)?.nom || 'Aucune'}</strong>
            {selectedBoutiqueId && (
              <button 
                onClick={() => {
                  setFiltres({ ...filtres, boutique_id: null });
                  handleFiltresChange();
                }}
                className="btn-link-small"
              >
                Voir toutes les boutiques
              </button>
            )}
          </p>
        </div>
        <div className="filtres-grid">
          <div>
            <label>Date début:</label>
            <input
              type="date"
              value={filtres.date_debut}
              onChange={(e) => setFiltres({ ...filtres, date_debut: e.target.value })}
            />
          </div>
          <div>
            <label>Date fin:</label>
            <input
              type="date"
              value={filtres.date_fin}
              onChange={(e) => setFiltres({ ...filtres, date_fin: e.target.value })}
            />
          </div>
          <div>
            <label>Produit:</label>
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={filtres.produit_nom}
              onChange={(e) => setFiltres({ ...filtres, produit_nom: e.target.value })}
            />
          </div>
          <div>
            <label>Localisation:</label>
            <input
              type="text"
              placeholder="Ville/Région..."
              value={filtres.localisation}
              onChange={(e) => setFiltres({ ...filtres, localisation: e.target.value })}
            />
          </div>
        </div>
        <div className="filtres-actions">
          <button onClick={handleFiltresChange} className="btn-primary">Appliquer les filtres</button>
          <button onClick={() => {
            setFiltres({ boutique_id: selectedBoutiqueId, date_debut: '', date_fin: '', produit_nom: '', localisation: '' });
            chargerVentes();
            chargerStatistiques();
          }} className="btn-secondary">Réinitialiser</button>
        </div>
      </div>
      )}

      {/* Comparaison par période */}
      {selectedBoutiqueId && (
      <div className="periode-container">
        <h2>Comparaison par Période</h2>
        <p>Consultez les ventes d'une année/mois spécifique pour comparer avec l'année prochaine</p>
        <div className="periode-selectors">
          <select value={anneeComparee} onChange={(e) => setAnneeComparee(parseInt(e.target.value))}>
            {anneesDisponibles.map(annee => (
              <option key={annee} value={annee}>{annee}</option>
            ))}
          </select>
          <select 
            value={moisCompare || ''} 
            onChange={(e) => setMoisCompare(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Toute l'année</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(mois => (
              <option key={mois} value={mois}>
                {new Date(2024, mois - 1).toLocaleDateString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
          <button 
            onClick={() => chargerVentesPeriode(anneeComparee, moisCompare)}
            className="btn-primary"
          >
            Charger la période
          </button>
          <button 
            onClick={() => {
              setAnneeComparee(anneeActuelle);
              setMoisCompare(null);
              chargerVentes();
              chargerStatistiques();
            }}
            className="btn-secondary"
          >
            Voir toutes les ventes
          </button>
        </div>
      </div>
      )}

      {/* Bouton Ajouter */}
      <div className="actions-header">
        <button 
          onClick={() => {
            if (!selectedBoutiqueId) {
              alert('⚠️ Veuillez d\'abord sélectionner une boutique');
              return;
            }
            setShowForm(!showForm);
            if (!showForm) {
              setEditingVente(null);
              resetForm();
            }
          }}
          className="btn-primary"
          disabled={!selectedBoutiqueId}
          title={!selectedBoutiqueId ? 'Sélectionnez d\'abord une boutique' : ''}
        >
          {showForm ? 'Annuler' : '+ Ajouter une vente'}
        </button>
        {!selectedBoutiqueId && (
          <p className="form-help-text" style={{ marginTop: '10px' }}>
            ⚠️ Sélectionnez une boutique pour pouvoir ajouter des ventes
          </p>
        )}
      </div>

      {/* Formulaire */}
      {showForm && selectedBoutiqueId && (
        <div className="form-container">
          <h2>{editingVente ? 'Modifier la vente' : 'Nouvelle vente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-boutique-field">
                <label>
                  <span className="form-icon">🏪</span> Boutique *
                </label>
                <select
                  value={formData.boutique_id || selectedBoutiqueId || ''}
                  onChange={(e) => setFormData({ ...formData, boutique_id: parseInt(e.target.value) })}
                  required
                  className="form-select-boutique"
                >
                  {boutiques.length === 0 ? (
                    <option value="">Aucune boutique disponible</option>
                  ) : (
                    boutiques.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.nom} {b.adresse ? `- ${b.adresse}` : ''}
                      </option>
                    ))
                  )}
                </select>
                {!formData.boutique_id && !selectedBoutiqueId && (
                  <p className="form-help-text">⚠️ Vous devez sélectionner une boutique</p>
                )}
              </div>
              <div>
                <label>Date de vente *</label>
                <input
                  type="date"
                  value={formData.date_vente}
                  onChange={(e) => setFormData({ ...formData, date_vente: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Nom du produit *</label>
                <input
                  type="text"
                  value={formData.produit_nom}
                  onChange={(e) => setFormData({ ...formData, produit_nom: e.target.value })}
                  required
                  placeholder="Ex: Perruque longue cheveux"
                />
              </div>
              <div>
                <label>Prix unitaire (FCFA) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  required
                  placeholder="Ex: 15000"
                />
              </div>
              <div>
                <label>Quantité</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantite}
                  onChange={(e) => setFormData({ ...formData, quantite: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label>Localisation</label>
                <input
                  type="text"
                  value={formData.localisation}
                  onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                  placeholder="Ex: Dakar, Sénégal"
                />
              </div>
              <div>
                <label>Informations client</label>
                <input
                  type="text"
                  value={formData.client_info}
                  onChange={(e) => setFormData({ ...formData, client_info: e.target.value })}
                  placeholder="Nom, email, téléphone..."
                />
              </div>
            </div>
            <div>
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enregistrement...' : (editingVente ? 'Modifier' : 'Enregistrer')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des ventes */}
      {!selectedBoutiqueId ? (
        <div className="empty-state">
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>👆 Veuillez sélectionner une boutique ci-dessus pour voir les ventes</p>
        </div>
      ) : (
        <div className="ventes-list">
          <h2>Liste des ventes ({ventes.length})</h2>
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : ventes.length === 0 ? (
            <div className="empty-state">Aucune vente enregistrée pour cette boutique</div>
          ) : (
          <div className="ventes-table">
            <table>
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Prix unitaire</th>
                  <th>Qté</th>
                  <th>Total</th>
                  <th>Localisation</th>
                  <th>Client</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ventes.map((vente) => (
                  <tr key={vente.id}>
                    <td>{vente.boutique_nom || 'N/A'}</td>
                    <td>{formatDate(vente.date_vente)}</td>
                    <td>{vente.produit_nom}</td>
                    <td>{formatPrix(vente.prix)}</td>
                    <td>{vente.quantite}</td>
                    <td><strong>{formatPrix(vente.total)}</strong></td>
                    <td>{vente.localisation || '-'}</td>
                    <td>{vente.client_info || '-'}</td>
                    <td className="actions-cell">
                      <button onClick={() => handleEdit(vente)} className="btn-edit">Modifier</button>
                      <button onClick={() => handleDelete(vente.id)} className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}
    </div>
  );
}

export default JournalVente;

