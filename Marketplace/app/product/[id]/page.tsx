'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Truck, RotateCcw, Heart, Share2, Minus, Plus, ShoppingCart, ChevronRight } from 'lucide-react';
import TopBar from '../../../components/layout/TopBar';
import Footer from '../../../components/layout/Footer';
import ProductCard from '../../../components/ui/ProductCard';

export default function ProductPage({ params }: { params: { id: string } }) {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Mock Product Data
    const product = {
        id: params.id,
        title: "iPhone 15 Pro Max 256GB - Titane Naturel",
        price: 950000,
        oldPrice: 1100000,
        sku: "APP-IP15PM-256",
        rating: 4.8,
        reviewsCount: 124,
        description: "L'iPhone 15 Pro Max est conçu en titane de qualité aérospatiale, ce qui le rend à la fois léger et résistant. Il est doté de la puce A17 Pro, un monstre de puissance pour le gaming et les tâches pro.",
        images: [
            "https://via.placeholder.com/600x600?text=iPhone+Front",
            "https://via.placeholder.com/600x600?text=iPhone+Back",
            "https://via.placeholder.com/600x600?text=iPhone+Side"
        ],
        specs: [
            { label: "Marque", value: "Apple" },
            { label: "Modèle", value: "iPhone 15 Pro Max" },
            { label: "Stockage", value: "256 Go" },
            { label: "Couleur", value: "Titane Naturel" },
            { label: "Garantie", value: "1 An Apple Care" }
        ]
    };

    const [mainImage, setMainImage] = useState(product.images[0]);

    return (
        <div className="min-h-screen bg-gray-50 font-rubik">
            <TopBar />

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200 py-4">
                <div className="container mx-auto px-4 text-xs text-gray-500 flex items-center gap-2">
                    <Link href="/" className="hover:text-primary">Accueil</Link> <ChevronRight size={12}/>
                    <Link href="/cat/electronics" className="hover:text-primary">Électronique</Link> <ChevronRight size={12}/>
                    <span className="text-gray-800 line-clamp-1">{product.title}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-0 md:gap-8">
                        
                        {/* 1. Image Gallery (5 cols) */}
                        <div className="lg:col-span-5 p-4 md:p-8">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4 relative group">
                                <img src={mainImage} alt={product.title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-3 py-1 rounded shadow-md">-25%</div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {product.images.map((img, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setMainImage(img)}
                                        className={`w-20 h-20 rounded-md border-2 flex-shrink-0 p-1 ${mainImage === img ? 'border-secondary' : 'border-transparent hover:border-gray-200 bg-gray-50'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Product Info (4 cols) */}
                        <div className="lg:col-span-4 p-4 md:p-8 md:border-l border-gray-100">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{product.title}</h1>
                            
                            <div className="flex items-center gap-4 mb-4 text-sm">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />)}
                                </div>
                                <span className="text-blue-600 hover:underline cursor-pointer">{product.reviewsCount} avis</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-green-600 font-medium flex items-center gap-1"><ShieldCheck size={16}/> Vendeur Certifié</span>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-[#131f35]">{product.price.toLocaleString()} FCFA</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-400 line-through text-lg">{product.oldPrice.toLocaleString()} FCFA</span>
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">Économisez {(product.oldPrice - product.price).toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                            </div>

                            {/* Variant Selectors (Mock) */}
                            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
                                <div>
                                    <span className="text-sm font-bold text-gray-800 block mb-2">Couleur: <span className="text-gray-500 font-normal">Titane Naturel</span></span>
                                    <div className="flex gap-2">
                                        {['bg-gray-400', 'bg-gray-800', 'bg-blue-900', 'bg-white border border-gray-200'].map((color, i) => (
                                            <button key={i} className={`w-8 h-8 rounded-full ${color} ring-2 ring-offset-2 ${i === 0 ? 'ring-secondary' : 'ring-transparent hover:ring-gray-300'}`}></button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Buy Box / Actions (3 cols) */}
                        <div className="lg:col-span-3 p-4 md:p-8 bg-gray-50 h-full border-l border-gray-100">
                             <div className="sticky top-24 space-y-6">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="mb-4">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantité</label>
                                        <div className="flex items-center border border-gray-300 rounded-lg w-full">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-100 text-gray-600"><Minus size={16}/></button>
                                            <input type="text" value={quantity} readOnly className="w-full text-center font-bold text-gray-800 outline-none" />
                                            <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-100 text-gray-600"><Plus size={16}/></button>
                                        </div>
                                    </div>

                                    <button className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3.5 rounded-lg shadow-lg shadow-orange-500/20 mb-3 flex items-center justify-center gap-2 transform active:scale-95 transition-all">
                                        <ShoppingCart size={20} />
                                        Ajouter au panier
                                    </button>
                                    <button className="w-full bg-[#131f35] hover:bg-black text-white font-bold py-3.5 rounded-lg shadow-lg transition-colors">
                                        Acheter maintenant
                                    </button>

                                    <div className="flex justify-center gap-4 mt-4">
                                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"><Heart size={14}/> Favoris</button>
                                        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"><Share2 size={14}/> Partager</button>
                                    </div>
                                </div>

                                {/* Trust Badges */}
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <Truck className="text-secondary shrink-0" size={20} />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Livraison Rapide</p>
                                            <p className="text-[10px] text-gray-500">Dakar: 24h / Régions: 48h</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                        <RotateCcw className="text-secondary shrink-0" size={20} />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">Retour Gratuit</p>
                                            <p className="text-[10px] text-gray-500">Sous 7 jours après réception</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>

                    </div>
                    
                    {/* Tabs Section */}
                    <div className="border-t border-gray-100 mt-8">
                        <div className="flex border-b border-gray-200 bg-gray-50 px-8">
                            {['description', 'specs', 'avis'].map(tab => (
                                <button 
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-6 py-4 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab === 'specs' ? 'Fiche Technique' : tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-8 bg-white min-h-[200px]">
                            {activeTab === 'description' && (
                                <div className="prose max-w-none text-gray-600">
                                    <p>Description détaillée générée par l'IA...</p>
                                </div>
                            )}
                            {activeTab === 'specs' && (
                                <table className="w-full max-w-lg text-sm">
                                    <tbody>
                                        {product.specs.map((item, i) => (
                                            <tr key={i} className="border-b border-gray-100">
                                                <td className="py-2 text-gray-500 w-1/3">{item.label}</td>
                                                <td className="py-2 font-medium text-gray-900">{item.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'avis' && (
                                <p className="text-gray-500 italic">Aucun avis pour le moment.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-primary mb-6">Vous aimerez aussi</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => (
                            <ProductCard key={i} product={{id: i, title: "Produit Similaire " + i, price: "50,000 FCFA", image: "https://via.placeholder.com/300", rating: 4.5, category: "tech"}} />
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
