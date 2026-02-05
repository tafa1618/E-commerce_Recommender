import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Activity, ShoppingBag, Search, Megaphone, CheckCircle, AlertTriangle, Terminal, Archive, Check, Loader } from 'lucide-react';
import './AgentsDashboard.css';

const API_URL = 'http://localhost:8000';

export default function AgentsDashboard() {
    const [activeAgent, setActiveAgent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [lastResult, setLastResult] = useState(null);

    // State pour la Validation
    const [drafts, setDrafts] = useState([]);
    const [loadingDrafts, setLoadingDrafts] = useState(false);

    useEffect(() => {
        fetchDrafts();
    }, []);

    const addLog = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
    };

    const fetchDrafts = async () => {
        setLoadingDrafts(true);
        try {
            const res = await axios.get(`${API_URL}/api/products/drafts`);
            setDrafts(res.data);
        } catch (e) {
            console.error("Erreur chargement drafts", e);
        } finally {
            setLoadingDrafts(false);
        }
    };

    const handleValidate = async (productId, action) => {
        try {
            await axios.post(`${API_URL}/api/products/${productId}/validate`, { action }, { params: { action } });
            addLog(`Produit ${productId} ${action === 'publish' ? 'validé' : 'rejeté'}`, 'success');
            fetchDrafts(); // Refresh list
        } catch (e) {
            addLog(`Erreur validation ${productId}: ${e.message}`, 'error');
        }
    };

    const runAgent = async (name, endpoint, params = {}) => {
        if (loading) return;

        setLoading(true);
        setActiveAgent(name);
        setLastResult(null);
        addLog(`🚀 Démarrage de l'agent ${name}...`, 'info');

        try {
            const response = await axios.post(`${API_URL}${endpoint}`, params);
            addLog(`✅ Agent ${name} terminé avec succès.`, 'success');
            setLastResult(response.data);
            if (name.includes('Sourcing')) fetchDrafts(); // Refresh drafts if sourcing run
        } catch (error) {
            console.error(error);
            addLog(`❌ Erreur Agent ${name}: ${error.message}`, 'error');
            if (error.response) {
                addLog(`Détails: ${JSON.stringify(error.response.data)}`, 'error');
            }
        } finally {
            setLoading(false);
            setActiveAgent(null);
        }
    };

    const agents = [
        {
            id: 'seo',
            name: 'Agent SEO & Contenu',
            description: 'Scanne les produits sans description, génère du contenu SEO optimisé.',
            icon: <Search className="w-8 h-8 text-blue-500" />,
            endpoint: '/api/agents/seo/run',
            params: { limit: 5 },
            color: 'border-blue-500'
        },
        {
            id: 'price',
            name: 'Agent Price Watch',
            description: 'Compare nos prix avec Jumia (Local).',
            icon: <Activity className="w-8 h-8 text-green-500" />,
            endpoint: '/api/agents/price/run',
            params: { limit: 10 },
            color: 'border-green-500'
        },
        {
            id: 'marketing',
            name: 'Agent Marketing',
            description: 'Crée des campagnes pubs pour les produits compétitifs.',
            icon: <Megaphone className="w-8 h-8 text-purple-500" />,
            endpoint: '/api/agents/marketing/run',
            params: {},
            color: 'border-purple-500'
        },
        {
            id: 'sourcing',
            name: 'Agent Sourcing (Smart)',
            description: 'Scanne historique ventes -> Jumia -> Trends -> Drafts.',
            icon: <ShoppingBag className="w-8 h-8 text-orange-500" />,
            endpoint: '/api/agents/sourcing/run',
            params: { limit: 5 },
            color: 'border-orange-500'
        }
    ];

    return (
        <div className="agents-dashboard container">
            <header className="dashboard-header">
                <h1>🤖 Control Station IA</h1>
                <p>Gérez vos agents et validez les produits sourcés.</p>
            </header>

            {/* Validation Section (Human in the Loop) */}
            <section className="validation-section mb-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="text-orange-500" />
                    Waiting Room (Validation Sourcing)
                    {loadingDrafts && <Loader className="animate-spin" size={16} />}
                </h2>

                {drafts.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded text-center text-gray-500">
                        Aucun produit en attente de validation. Lancez l'Agent Sourcing !
                    </div>
                ) : (
                    <div className="drafts-grid">
                        {drafts.map(product => (
                            <div key={product.product_id} className="draft-card">
                                <img src={product.image} alt={product.nom} className="draft-img" />
                                <div className="draft-info">
                                    <h4>{product.nom}</h4>
                                    <div className="draft-meta">
                                        <span className="price">{product.prix} FCFA</span>
                                        <span className="score">Trend: {product.validation_score}/100</span>
                                    </div>
                                </div>
                                <div className="draft-actions">
                                    <button
                                        onClick={() => handleValidate(product.product_id, 'reject')}
                                        className="btn-reject" title="Rejeter"
                                    >
                                        <Archive size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleValidate(product.product_id, 'publish')}
                                        className="btn-validate" title="Valider & Publier"
                                    >
                                        <Check size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="agents-grid">
                {agents.map(agent => (
                    <div key={agent.id} className={`agent-card ${agent.color}`}>
                        <div className="agent-icon">
                            {agent.icon}
                        </div>
                        <div className="agent-info">
                            <h3>{agent.name}</h3>
                            <p>{agent.description}</p>
                        </div>
                        <button
                            className={`btn-run ${loading ? 'disabled' : ''}`}
                            onClick={() => runAgent(agent.name, agent.endpoint, agent.params)}
                            disabled={loading}
                        >
                            {loading && activeAgent === agent.name ? (
                                <span className="spinner">⌛ ...</span>
                            ) : (
                                <>
                                    <Play size={16} /> Run
                                </>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <div className="dashboard-console">
                <div className="console-section logs">
                    <h3><Terminal size={18} /> Journal d'activités</h3>
                    <div className="logs-container">
                        {logs.map((log, index) => (
                            <div key={index} className="log-entry">{log}</div>
                        ))}
                    </div>
                </div>

                <div className="console-section results">
                    <h3>📊 Résultats Dernier Run</h3>
                    <div className="results-container">
                        {lastResult ? (
                            <pre>{JSON.stringify(lastResult, null, 2)}</pre>
                        ) : (
                            <span className="text-muted">Aucun résultat.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
