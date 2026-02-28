'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, Grid, List, ChevronRight } from 'lucide-react';
import ProductCard from '../../../components/ui/ProductCard';
import TopBar from '../../../components/layout/TopBar';
import Footer from '../../../components/layout/Footer';

// Mock Data (Expanded)
const allProducts = [
    { id: 101, title: "iPhone 15 Pro Max", price: "950,000 FCFA", image: "https://via.placeholder.com/300?text=iPhone", rating: 5, category: "electronics" },
    { id: 102, title: "Samsung S24 Ultra", price: "890,000 FCFA", image: "https://via.placeholder.com/300?text=Samsung", rating: 5, category: "electronics" },
    { id: 104, title: "Robe de Soirée", price: "35,000 FCFA", image: "https://via.placeholder.com/300?text=Robe", rating: 4.2, category: "fashion" },
    { id: 105, title: "Costume Homme", price: "85,000 FCFA", image: "https://via.placeholder.com/300?text=Costume", rating: 4.8, category: "fashion" },
    { id: 106, title: "Mixeur Inox", price: "15,000 FCFA", image: "https://via.placeholder.com/300?text=Mixeur", rating: 4.0, category: "home" },
];

const categoryNames: Record<string, string> = {
    electronics: "Électronique & Informatique",
    fashion: "Mode & Vêtements",
    home: "Maison & Cuisine",
    beauty: "Santé & Beauté",
    sports: "Sports & Loisirs"
};

export default function CategoryPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const categoryName = categoryNames[slug] || "Catégorie";
    const products = allProducts.filter(p => p.category === slug || slug === 'all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <div className="min-h-screen bg-gray-50 font-rubik">
            <TopBar />
            
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Link href="/" className="hover:text-primary">Accueil</Link>
                        <ChevronRight size={12} />
                        <Link href="/boutique" className="hover:text-primary">Boutique</Link>
                        <ChevronRight size={12} />
                        <span className="text-secondary font-medium capitalize">{categoryName}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold text-primary">{categoryName}</h1>
                        <span className="text-sm text-gray-500">{products.length} résultats</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters (Desktop) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Sous-Catégories</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {['Tout voir', 'Nouveautés', 'Promotions', 'Meilleures ventes'].map(sub => (
                                    <li key={sub} className="cursor-pointer hover:text-secondary hover:font-medium transition-colors">{sub}</li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Prix (FCFA)</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <input type="number" placeholder="Min" className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50" />
                                <input type="number" placeholder="Max" className="w-full px-3 py-2 border rounded-md text-sm bg-gray-50" />
                            </div>
                            <button className="w-full bg-primary text-white py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">Appliquer</button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Toolbar (identical to Boutique) */}
                        <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm sticky top-20 z-10 lg:static">
                             <button className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-md hover:bg-gray-100">
                                <Filter size={18} /> Filtrer
                            </button>

                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm text-gray-500 hidden md:inline">Trier par:</span>
                                <div className="relative">
                                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2 pl-3 pr-8 rounded-lg outline-none">
                                        <option>Pertinence</option>
                                        <option>Prix croissant</option>
                                        <option>Prix décroissant</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 border-l border-gray-200 pl-4 ml-4">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}><Grid size={18} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}><List size={18} /></button>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                            {products.length > 0 ? (
                                products.map(product => <ProductCard key={product.id} product={product} />)
                            ) : (
                                <div className="col-span-full py-12 text-center">
                                    <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
                                    <Link href="/boutique" className="text-secondary font-medium hover:underline mt-2 inline-block">Voir tous les produits</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
