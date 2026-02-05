import React from 'react';
import { BarChart2, Search as SearchIcon, Globe, ShoppingBag, Megaphone, FileText, TrendingUp, LayoutGrid, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'sidebar-link active' : 'sidebar-link';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link to="/" className="brand-logo-sidebar">
                    <div className="logo-circle-sm">TB</div>
                    <div className="logo-text">
                        <span className="logo-title">Tafa Business</span>
                        <span className="logo-subtitle">Admin Dashboard</span>
                    </div>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-group">
                    <span className="nav-label">Général</span>
                    <Link to="/" className={isActive('/')}>
                        <Home size={20} />
                        <span>Tableau de Bord</span>
                    </Link>
                    <Link to="/agents" className={isActive('/agents')}>
                        <LayoutGrid size={20} />
                        <span>Agents IA</span>
                    </Link>
                </div>

                <div className="nav-group">
                    <span className="nav-label">Sourcing & Veille</span>
                    <Link to="/analyse" className={isActive('/analyse')}>
                        <BarChart2 size={20} />
                        <span>Analyse Produit</span>
                    </Link>
                    <Link to="/veille" className={isActive('/veille')}>
                        <SearchIcon size={20} />
                        <span>Veille Jumia</span>
                    </Link>
                    <Link to="/alibaba" className={isActive('/alibaba')}>
                        <Globe size={20} />
                        <span>Veille Alibaba</span>
                    </Link>
                    <Link to="/trends" className={isActive('/trends')}>
                        <TrendingUp size={20} />
                        <span>Google Trends</span>
                    </Link>
                </div>

                <div className="nav-group">
                    <span className="nav-label">Gestion</span>
                    <Link to="/boutique" className={isActive('/boutique')}>
                        <ShoppingBag size={20} />
                        <span>Ma Boutique</span>
                    </Link>
                    <Link to="/marketing" className={isActive('/marketing')}>
                        <Megaphone size={20} />
                        <span>Marketing</span>
                    </Link>
                    <Link to="/journal-vente" className={isActive('/journal-vente')}>
                        <FileText size={20} />
                        <span>Journal des Ventes</span>
                    </Link>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="version-tag">
                    v1.0.0
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
