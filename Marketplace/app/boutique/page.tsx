'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import ProductCard from '../../components/ui/ProductCard';
import TopBar from '../../components/layout/TopBar';
import Footer from '../../components/layout/Footer';
import CategoryShowcase from '../../components/home/CategoryShowcase';

export default function Boutique() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Mock Products (Extended list)
    const products = [
        { id: 101, title: "iPhone 15 Pro Max", price: "950,000 FCFA", image: "https://via.placeholder.com/300?text=iPhone", rating: 5, category: "Mobile" },
        { id: 102, title: "Samsung S24 Ultra", price: "890,000 FCFA", image: "https://via.placeholder.com/300?text=Samsung", rating: 5, category: "Mobile" },
        { id: 103, title: "AirPods Pro 2", price: "165,000 FCFA", image: "https://via.placeholder.com/300?text=AirPods", rating: 4.5, category: "Audio" },
        { id: 104, title: "Robe de Soirée", price: "35,000 FCFA", image: "https://via.placeholder.com/300?text=Robe", rating: 4.2, category: "Mode" },
        { id: 105, title: "Costume Homme", price: "85,000 FCFA", image: "https://via.placeholder.com/300?text=Costume", rating: 4.8, category: "Mode" },
        { id: 106, title: "Mixeur Inox", price: "15,000 FCFA", image: "https://via.placeholder.com/300?text=Mixeur", rating: 4.0, category: "Maison" },
        { id: 107, title: "Montre Luxe", price: "120,000 FCFA", image: "https://via.placeholder.com/300?text=Montre", rating: 4.9, category: "Accessoires" },
        { id: 108, title: "Chaussures Sport", price: "25,000 FCFA", image: "https://via.placeholder.com/300?text=Chaussures", rating: 4.3, category: "Mode" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-rubik">
            <TopBar />

            {/* Breadcrumb & Header */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4">
                    <p className="text-xs text-gray-400 mb-2">Accueil / Boutique / Tous les produits</p>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-primary">Toute la Boutique</h1>
                        <span className="text-sm text-gray-500">{products.length} produits trouvés</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (Desktop) - Hidden on Mobile for now */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Catégories</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {['Électronique', 'Mode', 'Maison', 'Beauté', 'Sports'].map(cat => (
                                    <li key={cat} className="flex items-center gap-2 hover:text-secondary cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-secondary focus:ring-secondary" />
                                        {cat}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-800 mb-4">Prix</h3>
                            <div className="flex items-center gap-2">
                                <input type="number" placeholder="Min" className="w-20 px-2 py-1 border rounded text-sm" />
                                <span>-</span>
                                <input type="number" placeholder="Max" className="w-20 px-2 py-1 border rounded text-sm" />
                                <button className="bg-secondary text-white px-2 py-1 rounded text-sm">OK</button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar (Mobile Filters + Sort) */}
                        <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm sticky top-20 z-10 lg:static">
                            {/* Mobile Filter Trigger */}
                            <button className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-md hover:bg-gray-100">
                                <Filter size={18} />
                                Filtrer
                            </button>

                            {/* Sort */}
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm text-gray-500 hidden md:inline">Trier par:</span>
                                <div className="relative">
                                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-secondary">
                                        <option>Pertinence</option>
                                        <option>Prix croissant</option>
                                        <option>Prix décroissant</option>
                                        <option>Nouveautés</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-4">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="mt-8 text-center">
                            <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-secondary hover:text-secondary transition-colors">
                                Charger plus de produits
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
