import React, { useState, useEffect } from 'react';
import {
    BarChart2, ShoppingBag, Activity, Megaphone,
    AlertTriangle, CheckCircle, ArrowRight,
    Calendar, TrendingUp, Zap, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DashboardHome.css';

const DashboardHome = () => {
    const [data, setData] = useState({
        stats: {
            products_total: 0,
            products_draft: 0,
            jumia_alerts: 0,
            campaigns_active: 0
        },
        market_context: {
            current_season: "Chargement...",
            is_payday_period: false,
            upcoming_events: []
        },
        marketing_boost: 1.0,
        decisions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, decisionsRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/dashboard/stats'),
                    axios.get('http://localhost:8000/api/brain/decisions')
                ]);
                setData({
                    stats: statsRes.data,
                    market_context: statsRes.data.market_context,
                    marketing_boost: statsRes.data.marketing_boost,
                    decisions: decisionsRes.data
                });
            } catch (error) {
                console.error("Erreur dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const cards = [
        {
            title: "Produits Actifs",
            value: data.stats.products_total,
            icon: <ShoppingBag className="text-blue-400" size={24} />,
            color: "blue",
            link: "/analyse"
        },
        {
            title: "Brouillons IA",
            value: data.stats.products_draft,
            icon: <Zap className="text-amber-400" size={24} />,
            color: "amber",
            link: "/agents",
            desc: "Prêts pour validation"
        },
        {
            title: "Veille Marché",
            value: data.stats.jumia_alerts,
            icon: <Activity className="text-rose-400" size={24} />,
            color: "rose",
            link: "/veille",
            desc: "Alertes prix"
        },
        {
            title: "Ads Automatisées",
            value: data.stats.campaigns_active,
            icon: <Megaphone className="text-indigo-400" size={24} />,
            color: "indigo",
            link: "/marketing"
        }
    ];

    return (
        <div className="dashboard-home container">
            <header className="page-header premium-header">
                <div className="header-content">
                    <span className="badge-ai">AI CONTROL CENTER</span>
                    <h1>Tafa Business Intelligence</h1>
                    <p className="text-muted">Système cognitif de commerce anticipatif v1.0</p>
                </div>

                <div className="market-status-card">
                    <div className="status-item">
                        <Calendar size={18} className="text-blue-400" />
                        <span>Saison: <strong>{data.market_context.current_season}</strong></span>
                    </div>
                    <div className="status-item">
                        <TrendingUp size={18} className={data.market_context.is_payday_period ? "text-emerald-400" : "text-gray-400"} />
                        <span>Période Paie: <strong>{data.market_context.is_payday_period ? "OUI (Boost Active)" : "NON"}</strong></span>
                    </div>
                    <div className="boost-badge">
                        BOOST: x{data.marketing_boost.toFixed(1)}
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="kpi-grid">
                {cards.map((card, index) => (
                    <Link to={card.link} key={index} className={`kpi-card no-underline card-${card.color}`}>
                        <div className="kpi-icon">
                            {card.icon}
                        </div>
                        <div className="kpi-content">
                            <h3>{card.value}</h3>
                            <span className="kpi-title">{card.title}</span>
                            {card.desc && <span className="kpi-desc">{card.desc}</span>}
                        </div>
                    </Link>
                ))}
            </section>

            <section className="dashboard-grid-layout">
                {/* AI DECISION FEED */}
                <div className="content-card ai-feed">
                    <div className="card-header">
                        <h2><Activity size={20} /> Journal de Décision IA</h2>
                        <Link to="/agents" className="text-sm text-blue-400">Voir tout</Link>
                    </div>
                    <div className="decision-list">
                        {data.decisions.length > 0 ? data.decisions.map((dec, i) => (
                            <div key={i} className="decision-item">
                                <div className={`score-ring ${dec.score > 80 ? 'high' : 'medium'}`}>
                                    {Math.round(dec.score)}
                                </div>
                                <div className="decision-info">
                                    <div className="decision-header">
                                        <span className="trend-id">ID: {dec.trend_id}</span>
                                        <span className="action-tag">{dec.action}</span>
                                    </div>
                                    <p className="reasoning">{dec.reasoning}</p>
                                    <div className="timestamp">
                                        <Clock size={12} /> {new Date(dec.timestamp).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-4 text-center text-muted">Aucune décision récente</div>
                        )}
                    </div>
                </div>

                {/* QUICK ACTIONS & NOTIFICATIONS */}
                <div className="side-panel">
                    <div className="content-card next-events">
                        <h2>Événements à Venir (Sénégal)</h2>
                        <div className="event-list">
                            {data.market_context.upcoming_events.length > 0 ? data.market_context.upcoming_events.map((ev, i) => (
                                <div key={i} className="event-item">
                                    <div className="event-date">J-{ev.days_to}</div>
                                    <div className="event-name">{ev.name}</div>
                                </div>
                            )) : (
                                <div className="event-item plain">Aucun événement majeur à 30 jours</div>
                            )}
                        </div>
                    </div>

                    <div className="content-card quick-launch">
                        <h2>Lancement Rapide</h2>
                        <div className="launch-grid">
                            <Link to="/agents" className="launch-btn">🤖 Sourcing</Link>
                            <Link to="/analyse" className="launch-btn">📦 Analyse</Link>
                            <Link to="/marketing" className="launch-btn">✨ Ads Promo</Link>
                            <Link to="/veille" className="launch-btn">🔍 Veille</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardHome;
