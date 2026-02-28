'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Star, ShoppingCart } from 'lucide-react';

const deals = [
    {
        id: 1,
        title: "Smartphone Z-Flip 5G 256GB",
        price: "450,000 FCFA",
        oldPrice: "600,000 FCFA",
        discount: "-25%",
        image: "https://via.placeholder.com/200",
        rating: 4.8,
        reviews: 120
    },
    {
        id: 2,
        title: "Laptop Pro Book 14 Pouces",
        price: "320,000 FCFA",
        oldPrice: "400,000 FCFA",
        discount: "-20%",
        image: "https://via.placeholder.com/200",
        rating: 4.5,
        reviews: 85
    },
    {
        id: 3,
        title: "Écouteurs Sans Fil Noise Cancel",
        price: "25,000 FCFA",
        oldPrice: "45,000 FCFA",
        discount: "-45%",
        image: "https://via.placeholder.com/200",
        rating: 4.2,
        reviews: 230
    },
    {
        id: 4,
        title: "Montre Connectée Sport V2",
        price: "45,000 FCFA",
        oldPrice: "65,000 FCFA",
        discount: "-30%",
        image: "https://via.placeholder.com/200",
        rating: 4.6,
        reviews: 56
    }
];

const FlashDeals = () => {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                <Clock size={12} /> Fin dans 04h 23m 12s
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-primary">Ventes Flash ⚡</h2>
                        <p className="text-text-gray mt-1">Profitez de réductions jusqu'à -70% sur une sélection limitée.</p>
                    </div>
                    <Link href="/deals" className="text-secondary font-bold hover:underline flex items-center gap-1">
                        Voir toutes les offres &rarr;
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {deals.map(deal => (
                        <div key={deal.id} className="bg-white border boundary border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                            {/* Image Wrapper */}
                            <div className="relative aspect-square bg-gray-50 p-4">
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                    {deal.discount}
                                </div>
                                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                                    [Image]
                                </div>
                                {/* Quick Action */}
                                <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:bg-secondary hover:text-white">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-center gap-1 text-yellow-400 text-xs mb-2">
                                    <Star fill="currentColor" size={12} />
                                    <span className="font-bold text-gray-700">{deal.rating}</span>
                                    <span className="text-gray-400">({deal.reviews})</span>
                                </div>
                                <h3 className="font-bold text-primary truncate mb-2 group-hover:text-secondary transition-colors" title={deal.title}>
                                    {deal.title}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-lg text-primary">{deal.price}</span>
                                    <span className="text-sm text-gray-400 line-through">{deal.oldPrice}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlashDeals;
