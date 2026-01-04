import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';

function GoogleTrends() {
  const [keywords, setKeywords] = useState(['']);
  const [timeframe, setTimeframe] = useState('today 12-m');
  const [geo, setGeo] = useState('SN');
  const [loading, setLoading] = useState(false);
  const [trendsData, setTrendsData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trends');

  const addKeyword = () => {
    if (keywords.length < 5) {
      setKeywords([...keywords, '']);
    }
  };

  const removeKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords.length > 0 ? newKeywords : ['']);
  };

  const updateKeyword = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const getTrends = async () => {
    const validKeywords = keywords.filter(k => k.trim() !== '');
    if (validKeywords.length === 0) {
      setError('Veuillez entrer au moins un mot-clé');
      return;
    }

    setLoading(true);
    setError(null);
    setTrendsData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/trends`, {
        keywords: validKeywords,
        timeframe: timeframe,
        geo: geo
      });

      if (response.data.success) {
        setTrendsData(response.data);
      } else {
        setError(response.data.error || 'Erreur lors de la récupération des tendances');
      }
    } catch (err) {
      console.error('Erreur:', err);
      if (err.response?.status === 503) {
        setError('Google Trends API non disponible. Installez pytrends sur le serveur: pip install pytrends');
      } else {
        setError(err.response?.data?.detail || 'Erreur lors de la récupération des tendances');
      }
    } finally {
      setLoading(false);
    }
  };

  const compareKeywords = async () => {
    const validKeywords = keywords.filter(k => k.trim() !== '');
    if (validKeywords.length < 2) {
      setError('Veuillez entrer au moins 2 mots-clés pour comparer');
      return;
    }

    setLoading(true);
    setError(null);
    setCompareData(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/trends/compare`, {
        keywords: validKeywords,
        timeframe: timeframe,
        geo: geo
      });

      if (response.data.success) {
        setCompareData(response.data);
      } else {
        setError(response.data.error || 'Erreur lors de la comparaison');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.response?.data?.detail || 'Erreur lors de la comparaison');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container">
      <div className="trends-header">
        <h1>📈 Google Trends - Analyse des Tendances</h1>
        <p>Analysez les tendances de recherche pour vos produits et identifiez les opportunités</p>
      </div>

      {/* Configuration */}
      <div className="trends-config">
        <h2>Configuration de la recherche</h2>
        
        <div className="form-section">
          <label>Mots-clés à analyser (max 5):</label>
          {keywords.map((keyword, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                placeholder={`Mot-clé ${index + 1} (ex: perruque, cheveux)`}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
              />
              {keywords.length > 1 && (
                <button
                  onClick={() => removeKeyword(index)}
                  className="btn btn-danger btn-small"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          {keywords.length < 5 && (
            <button onClick={addKeyword} className="btn btn-secondary btn-small">
              + Ajouter un mot-clé
            </button>
          )}
        </div>

        <div className="form-grid" style={{ marginTop: '20px' }}>
          <div>
            <label>Période:</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
            >
              <option value="today 1-m">Dernier mois</option>
              <option value="today 3-m">3 derniers mois</option>
              <option value="today 12-m">12 derniers mois</option>
              <option value="today 5-y">5 dernières années</option>
            </select>
          </div>
          <div>
            <label>Pays/Région:</label>
            <select
              value={geo}
              onChange={(e) => setGeo(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb' }}
            >
              <option value="SN">Sénégal</option>
              <option value="FR">France</option>
              <option value="US">États-Unis</option>
              <option value="GB">Royaume-Uni</option>
              <option value="CM">Cameroun</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="ML">Mali</option>
              <option value="BF">Burkina Faso</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={getTrends}
            disabled={loading || keywords.filter(k => k.trim() !== '').length === 0}
            className="btn btn-primary"
          >
            {loading ? '⏳ Chargement...' : '📊 Analyser les tendances'}
          </button>
          <button
            onClick={compareKeywords}
            disabled={loading || keywords.filter(k => k.trim() !== '').length < 2}
            className="btn btn-success"
          >
            {loading ? '⏳ Chargement...' : '⚖️ Comparer les mots-clés'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Résultats */}
      {trendsData && trendsData.success && (
        <div className="trends-results" style={{ marginTop: '30px' }}>
          <h2>📈 Résultats des tendances</h2>
          
          {trendsData.trends && trendsData.trends.length > 0 && (
            <div className="trends-charts">
              {trendsData.trends.map((trend, index) => (
                <div key={index} className="trend-card" style={{ marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ color: '#667eea', marginBottom: '15px' }}>
                    {trend.keyword}
                  </h3>
                  
                  <div className="trend-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                    <div className="stat-box">
                      <div className="stat-label">Moyenne</div>
                      <div className="stat-value">{trend.average.toFixed(1)}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Maximum</div>
                      <div className="stat-value">{trend.max}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Minimum</div>
                      <div className="stat-value">{trend.min}</div>
                    </div>
                  </div>

                  {/* Graphique simple (barres) */}
                  {trend.data && trend.data.length > 0 && (
                    <div className="trend-chart" style={{ marginTop: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                        {trend.data.slice(-30).map((point, i) => {
                          const height = (point.value / trend.max) * 100;
                          return (
                            <div
                              key={i}
                              style={{
                                flex: 1,
                                height: `${height}%`,
                                background: 'linear-gradient(to top, #667eea, #764ba2)',
                                borderRadius: '2px 2px 0 0',
                                minHeight: height > 0 ? '2px' : '0',
                                title: `${formatDate(point.date)}: ${point.value}`
                              }}
                            />
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.75rem', color: '#6b7280' }}>
                        <span>{formatDate(trend.data[0]?.date)}</span>
                        <span>{formatDate(trend.data[trend.data.length - 1]?.date)}</span>
                      </div>
                    </div>
                  )}

                  {/* Requêtes liées */}
                  {trendsData.related_queries && trendsData.related_queries[trend.keyword] && (
                    <div style={{ marginTop: '20px' }}>
                      <h4 style={{ marginBottom: '10px' }}>🔍 Requêtes liées</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {trendsData.related_queries[trend.keyword].top && trendsData.related_queries[trend.keyword].top.length > 0 && (
                          <div>
                            <strong style={{ color: '#667eea' }}>Top:</strong>
                            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                              {trendsData.related_queries[trend.keyword].top.slice(0, 5).map((item, i) => (
                                <li key={i}>{item.query} ({item.value})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {trendsData.related_queries[trend.keyword].rising && trendsData.related_queries[trend.keyword].rising.length > 0 && (
                          <div>
                            <strong style={{ color: '#10b981' }}>En hausse:</strong>
                            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                              {trendsData.related_queries[trend.keyword].rising.slice(0, 5).map((item, i) => (
                                <li key={i}>{item.query} (+{item.value})</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparaison */}
      {compareData && compareData.success && (
        <div className="compare-results" style={{ marginTop: '30px' }}>
          <h2>⚖️ Comparaison des mots-clés</h2>
          
          <div className="compare-table" style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Mot-clé</th>
                  <th>Intérêt moyen</th>
                  <th>Intérêt max</th>
                  <th>Intérêt actuel</th>
                  <th>Tendance</th>
                </tr>
              </thead>
              <tbody>
                {compareData.comparison.map((item, index) => (
                  <tr key={index}>
                    <td><strong>{item.keyword}</strong></td>
                    <td>{item.average_interest}</td>
                    <td>{item.max_interest}</td>
                    <td>{item.current_interest}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: item.trend === 'up' ? '#d1fae5' : item.trend === 'down' ? '#fee2e2' : '#f3f4f6',
                        color: item.trend === 'up' ? '#065f46' : item.trend === 'down' ? '#991b1b' : '#374151'
                      }}>
                        {item.trend === 'up' ? '📈 Hausse' : item.trend === 'down' ? '📉 Baisse' : '➡️ Stable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleTrends;

