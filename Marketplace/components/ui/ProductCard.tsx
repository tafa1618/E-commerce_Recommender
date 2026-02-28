'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';

interface ProductProps {
    id: number | string;
    title: string;
    price: string;
    oldPrice?: string;
    image: string;
    category?: string;
    rating?: number;
}

const ProductCard = ({ product }: { product: ProductProps }) => {
    return (
        <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 relative">
            {/* Image Container */}
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                    {/* Placeholder or Image */}
                    {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <span>No Image</span>
                    )}
                </div>

                {/* Badges */}
                {product.oldPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        PROMO
                    </span>
                )}

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button className="bg-white text-primary hover:bg-secondary hover:text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75" title="Ajouter au panier">
                        <ShoppingCart size={20} />
                    </button>
                    <button className="bg-white text-primary hover:bg-secondary hover:text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100" title="Voir les détails">
                        <Eye size={20} />
                    </button>
                    <button className="bg-white text-primary hover:bg-secondary hover:text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150" title="Ajouter aux favoris">
                        <Heart size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{product.category || 'Général'}</div>
                <h3 className="font-bold text-primary text-base mb-2 truncate group-hover:text-secondary transition-colors">
                    <Link href={`/produit/${product.id}`}>
                        {product.title}
                    </Link>
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400 text-xs">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < (product.rating || 4) ? "currentColor" : "none"} className={i < (product.rating || 4) ? "text-yellow-400" : "text-gray-300"} />
                        ))}
                    </div>
                    <span className="text-xs text-gray-400">(24 avis)</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-primary">{product.price}</span>
                        {product.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">{product.oldPrice}</span>
                        )}
                    </div>
                    <button className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-secondary hover:text-white transition-colors">
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
