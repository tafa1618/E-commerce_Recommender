'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone, Shirt, Home } from 'lucide-react';
import ProductCard from '../ui/ProductCard';

const mockProducts = {
    electronics: [
        { id: 201, title: "iPhone 15 Pro Max 256GB", price: "950,000 FCFA", oldPrice: "1,100,000 FCFA", image: "https://via.placeholder.com/300?text=iPhone+15", rating: 5, category: "Mobiles" },
        { id: 202, title: "Samsung Galaxy S24 Ultra", price: "890,000 FCFA", image: "https://via.placeholder.com/300?text=Galaxy+S24", rating: 5, category: "Mobiles" },
        { id: 203, title: "MacBook Air M2 13\"", price: "750,000 FCFA", oldPrice: "850,000 FCFA", image: "https://via.placeholder.com/300?text=MacBook+Air", rating: 4.8, category: "Informatique" },
        { id: 204, title: "AirPods Pro 2", price: "165,000 FCFA", image: "https://via.placeholder.com/300?text=AirPods", rating: 4.7, category: "Audio" },
    ],
    fashion: [
        { id: 301, title: "Robe de Soirée Élégante", price: "35,000 FCFA", image: "https://via.placeholder.com/300?text=Robe", rating: 4.5, category: "Femme" },
        { id: 302, title: "Costume Homme Slim Fit", price: "85,000 FCFA", oldPrice: "120,000 FCFA", image: "https://via.placeholder.com/300?text=Costume", rating: 4.2, category: "Homme" },
        { id: 303, title: "Sac à Main Cuir", price: "45,000 FCFA", image: "https://via.placeholder.com/300?text=Sac", rating: 4.6, category: "Accessoires" },
        { id: 304, title: "Montre Chronographe", price: "55,000 FCFA", oldPrice: "75,000 FCFA", image: "https://via.placeholder.com/300?text=Montre", rating: 4.8, category: "Homme" },
    ],
    home: [
        { id: 401, title: "Mixeur Plongeant Inox", price: "15,000 FCFA", oldPrice: "25,000 FCFA", image: "https://via.placeholder.com/300?text=Mixeur", rating: 4.0, category: "Cuisine" },
        { id: 402, title: "Aspirateur Robot Wi-Fi", price: "120,000 FCFA", image: "https://via.placeholder.com/300?text=Robot", rating: 4.5, category: "Ménage" },
        { id: 403, title: "Set de Draps Coton", price: "20,000 FCFA", image: "https://via.placeholder.com/300?text=Draps", rating: 4.3, category: "Chambre" },
        { id: 404, title: "Machine à Café Espresso", price: "65,000 FCFA", oldPrice: "80,000 FCFA", image: "https://via.placeholder.com/300?text=Café", rating: 4.6, category: "Cuisine" },
    ]
};

const icons = {
    electronics: <Smartphone size={24} className="text-secondary" />,
    fashion: <Shirt size={24} className="text-secondary" />,
    home: <Home size={24} className="text-secondary" />
};

interface CategoryShowcaseProps {
    title: string;
    category: 'electronics' | 'fashion' | 'home';
    color?: string; // Header background accent
}

const CategoryShowcase = ({ title, category }: CategoryShowcaseProps) => {
    const products = mockProducts[category] || [];
    const icon = icons[category];

    return (
        <section className="py-6">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="bg-white p-4 rounded-t-lg flex items-center justify-between border-b-2 border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                            {React.cloneElement(icon as React.ReactElement, { className: "text-primary" })}
                        </div>
                        <h2 className="text-xl font-bold text-primary">{title}</h2>
                    </div>
                    <Link href={`/cat/${category}`} className="flex items-center gap-1 text-sm font-bold text-secondary hover:text-secondary-dark transition-colors group">
                        Voir plus
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Grid */}
                <div className="bg-white p-4 rounded-b-lg shadow-sm border border-t-0 border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryShowcase;
