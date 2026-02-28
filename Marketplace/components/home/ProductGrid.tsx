'use client';

import React from 'react';
import ProductCard from '../ui/ProductCard';

const mockProducts = [
    { id: 101, title: "Montre de Luxe Homme Argent", price: "25,000 FCFA", category: "Mode", image: "https://via.placeholder.com/300", rating: 5 },
    { id: 102, title: "Sac à Main Cuir Véritable", price: "45,000 FCFA", oldPrice: "60,000 FCFA", category: "Accessoires", image: "https://via.placeholder.com/300", rating: 4 },
    { id: 103, title: "Écouteurs Bluetooth Pro 2", price: "15,000 FCFA", category: "Électronique", image: "https://via.placeholder.com/300", rating: 4 },
    { id: 104, title: "Basket Running Sport X", price: "35,000 FCFA", category: "Sport", image: "https://via.placeholder.com/300", rating: 5 },
    { id: 105, title: "Ensemble Bureau Design", price: "120,000 FCFA", category: "Maison", image: "https://via.placeholder.com/300", rating: 5 },
    { id: 106, title: "Robot Mixeur 500W", price: "22,000 FCFA", oldPrice: "30,000 FCFA", category: "Cuisine", image: "https://via.placeholder.com/300", rating: 3 },
    { id: 107, title: "Parfum Homme Sauvage", price: "55,000 FCFA", category: "Beauté", image: "https://via.placeholder.com/300", rating: 4 },
    { id: 108, title: "Kit Solaire Portable 100W", price: "85,000 FCFA", category: "Énergie", image: "https://via.placeholder.com/300", rating: 5 },
];

const ProductGrid = ({ title, products = mockProducts }: { title: string, products?: any[] }) => {
    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-primary relative px-4">
                        <span className="absolute left-0 top-1 bottom-1 w-1 bg-secondary rounded-full"></span>
                        {title}
                    </h2>
                    <a href="#" className="font-bold text-secondary hover:text-secondary-dark transition-colors">
                        Voir tout
                    </a>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-bold transition-all duration-300">
                        Charger plus de produits
                    </button>
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
