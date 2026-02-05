import React, { useState, useEffect } from 'react';
import { BarChart2, ShoppingBag, Activity, Megaphone, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './DashboardHome.css';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        products_total: 0,
        products_draft: 0,
        jumia_alerts: 0,
        campaigns_active: 0
    });

    useEffect(() => {
        // Fetch stats from backend (Mocking for now as endpoints might need update)
        // In real scenario: axios.get('http://localhost:8000/api/dashboard/stats')
        setStats({
            products_total: 124,
            products_draft: 5,
            jumia_alerts: 12,
            campaigns_active: 2
        });
    }, []);

    const cards = [
        {
            title: "Produits en Boutique",
            value: stats.products_total,
            icon: <ShoppingBag className="text-blue-600" size={24} />,
            color: "bg-blue-50",
            link: "/analyse"
        },
        {
            title: "En Attente (Draft)",
            value: stats.products_draft,
            icon: <AlertTriangle className="text-orange-600" size={24} />,
            color: "bg-orange-50",
            link: "/agents",
            desc: "Nécessitent validation"
        },
        {
            title: "Alertes Prix Jumia",
            value: stats.jumia_alerts,
            icon: <Activity className="text-red-600" size={24} />,
            color: "bg-red-50",
            link: "/veille",
            desc: "Prix à ajuster"
        },
        {
            title: "Campagnes Marketing",
            value: stats.campaigns_active,
            icon: <Megaphone className="text-purple-600" size={24} />,
            color: "bg-purple-50",
            link: "/marketing"
        }
    ];

    return (
        <div className="dashboard-home container">
            <header className="page-header">
                <div>
                    <h1>Tableau de Bord</h1>
                    <p className="text-muted">Bienvenue, Administrateur. Voici la situation aujourd'hui.</p>
                </div>
                <div className="header-actions">
                    <Link to="/agents" className="btn btn-primary">
                        <ArrowRight size={16} /> Lancer un Agent
                    </Link>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="kpi-grid">
                {cards.map((card, index) => (
                    <Link to={card.link} key={index} className="kpi-card no-underline">
                        <div className={`icon-wrapper ${card.color}`}>
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

            {/* Recent Activity & Quick Actions */}
            <section className="dashboard-content">
                <div className="content-card recent-activity">
                    <h2>Dernières Activités</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <CheckCircle size={16} className="text-green-500" />
                            <div>
                                <span className="font-medium">Produit Validé</span>
                                <p className="text-sm text-gray-500">Hachoir Électrique 3L a été publié.</p>
                            </div>
                            <span className="date">14:30</span>
                        </div>
                        <div className="activity-item">
                            <Activity size={16} className="text-blue-500" />
                            <div>
                                <span className="font-medium">Agent Price Watch</span>
                                <p className="text-sm text-gray-500">Analyse de 50 produits terminée.</p>
                            </div>
                            <span className="date">12:15</span>
                        </div>
                        <div className="activity-item">
                            <Megaphone size={16} className="text-purple-500" />
                            <div>
                                <span className="font-medium">Campagne Créée</span>
                                <p className="text-sm text-gray-500">"Promo Tabaski" générée pour 5 produits.</p>
                            </div>
                            <span className="date">Hier</span>
                        </div>
                    </div>
                </div>

                <div className="content-card quick-actions">
                    <h2>Actions Rapides</h2>
                    <div className="action-buttons">
                        <Link to="/agents" className="action-btn">
                            <span>🤖</span>
                            <div>
                                <strong>Nouveau Sourcing</strong>
                                <small>Lancer l'agent d'import</small>
                            </div>
                        </Link>
                        <Link to="/analyse" className="action-btn">
                            <span>📦</span>
                            <div>
                                <strong>Ajouter Produit</strong>
                                <small>Création manuelle</small>
                            </div>
                        </Link>
                        <Link to="/marketing" className="action-btn">
                            <span>✨</span>
                            <div>
                                <strong>Générer Pub</strong>
                                <small>Créer un post Facebook</small>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardHome;
