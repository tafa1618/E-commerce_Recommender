import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Play, Activity, ShoppingBag, Search,
    Megaphone, CheckCircle, AlertTriangle,
    Terminal, Archive, Check, Loader, Sparkles, Brain
} from 'lucide-react';
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
        addLog(`🚀 Module IA ${name} en cours...`, 'info');

        try {
            const response = await axios.post(`${API_URL}${endpoint}`, params);
            addLog(`✅ Module ${name} opérationnel.`, 'success');
            setLastResult(response.data);
            if (name.includes('Sourcing')) fetchDrafts();
        } catch (error) {
            addLog(`❌ Échec Module ${name}: ${error.message}`, 'error');
        } finally {
            setLoading(false);
            setActiveAgent(null);
        }
    };

    const agents = [
        {
            id: 'sourcing',
            name: 'Sourcing Prédictif',
            description: 'Scanne Jumia & Trends pour trouver les pépites de demain au Sénégal.',
            icon: <ShoppingBag className="w-8 h-8 text-orange-400" />,
            endpoint: '/api/agents/sourcing/run',
            params: { limit: 5 },
            color: 'card-orange'
        },
        {
            id: 'seo',
            name: 'Intelligence Contenu',
            description: 'Génère des descriptions SEO premium et fiches techniques WordPress.',
            icon: <Search className="w-8 h-8 text-blue-400" />,
            endpoint: '/api/agents/seo/run',
            params: { limit: 5 },
            color: 'card-blue'
        },
        {
            id: 'marketing',
            name: 'Creative Ad Agent',
            description: 'Génère les visuels et textes publicitaires Meta Ads (Brouillons).',
            icon: <Megaphone className="w-8 h-8 text-indigo-400" />,
            endpoint: '/api/agents/marketing/run',
            params: {},
            color: 'card-indigo'
        },
        {
            id: 'price',
            name: 'Market Watcher',
            description: 'Surveille les prix concurrents et suggère des ajustements dynamiques.',
            icon: <Activity className="w-8 h-8 text-emerald-400" />,
            endpoint: '/api/agents/price/run',
            params: { limit: 10 },
            color: 'card-emerald'
        }
    ];

    return (
        <div className="agents-dashboard container">
            <header className="page-header premium-header-mini">
                <div className="header-info">
                    <span className="badge-ai">IA ORCHESTRATION</span>
                    <h1>Station de Contrôle Agents</h1>
                    <p className="text-muted">Supervisez l'intelligence autonome de votre commerce.</p>
                </div>
            </header>

            <div className="agents-layout">
                {/* Main Control Panel */}
                <div className="agents-main">
                    <section className="agents-grid">
                        {agents.map(agent => (
                            <div key={agent.id} className={`agent-premium-card ${agent.color}`}>
                                <div className="agent-icon-wrapper">
                                    {agent.icon}
                                </div>
                                <div className="agent-body">
                                    <h3>{agent.name}</h3>
                                    <p>{agent.description}</p>
                                </div>
                                <button
                                    className={`btn-premium-run ${loading ? 'disabled' : ''}`}
                                    onClick={() => runAgent(agent.name, agent.endpoint, agent.params)}
                                    disabled={loading}
                                >
                                    {loading && activeAgent === agent.name ? (
                                        <Loader className="animate-spin" size={18} />
                                    ) : (
                                        <>Lancer <Sparkles size={14} /></>
                                    )}
                                </button>
                            </div>
                        ))}
                    </section>

                    {/* Console Section */}
                    <section className="console-wrapper content-card">
                        <div className="console-header">
                            <h2><Terminal size={18} /> Logs Systèmes</h2>
                            <button onClick={() => setLogs([])} className="text-xs text-muted">Vider</button>
                        </div>
                        <div className="console-body">
                            {logs.length > 0 ? logs.map((log, i) => (
                                <div key={i} className="log-line">{log}</div>
                            )) : (
                                <div className="text-muted italic">En attente d'activité...</div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar Validation Room */}
                <aside className="agents-sidebar">
                    <div className="content-card waiting-room">
                        <div className="card-header">
                            <h2><Brain size={20} className="text-orange-400" /> Validation IA</h2>
                            {loadingDrafts && <Loader className="animate-spin" size={16} />}
                        </div>

                        <div className="drafts-vertical-list">
                            {drafts.length === 0 ? (
                                <div className="empty-drafts">
                                    <ShoppingBag size={32} />
                                    <p>Lancez le Sourcing pour trouver des produits.</p>
                                </div>
                            ) : (
                                drafts.map(product => (
                                    <div key={product.product_id} className="premium-draft-item">
                                        <img src={product.image} alt={product.nom} />
                                        <div className="draft-details">
                                            <h4>{product.nom}</h4>
                                            <div className="draft-badges">
                                                <span className="badge-price">{product.prix} FCFA</span>
                                                <span className="badge-score">Score: {product.validation_score}</span>
                                            </div>
                                            <div className="ai-reasoning-snippet">
                                                💡 IA: Prêt pour le marché sénégalais.
                                            </div>
                                        </div>
                                        <div className="draft-actions-mini">
                                            <button onClick={() => handleValidate(product.product_id, 'reject')} className="btn-icon reject"><Archive size={14} /></button>
                                            <button onClick={() => handleValidate(product.product_id, 'publish')} className="btn-icon validate"><Check size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
