'use client';

import React from 'react';
import Link from 'next/link';
import { X, ChevronRight, User, Package, Heart, LogOut } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
    const categories = [
        { name: 'Électronique & Info', slug: 'electronics' },
        { name: 'Mode Homme & Femme', slug: 'fashion' },
        { name: 'Maison & Cuisine', slug: 'home' },
        { name: 'Santé & Beauté', slug: 'beauty' },
        { name: 'Bébé & Jouets', slug: 'kids' },
        { name: 'Sports & Loisirs', slug: 'sports' },
        { name: 'Auto & Moto', slug: 'auto' },
    ];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={`fixed top-0 left-0 w-[80%] max-w-sm h-full bg-white z-50 transform transition-transform duration-300 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Header */}
                <div className="bg-[#131f35] p-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                            <User size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Bienvenue !</p>
                            <Link href="/connexion" className="text-sm font-bold hover:text-secondary underline decoration-secondary decoration-2 underline-offset-2" onClick={onClose}>
                                Se connecter / S'inscrire
                            </Link>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 p-4 border-b border-gray-100">
                        <Link href="/commandes" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" onClick={onClose}>
                            <Package size={20} className="text-primary mb-1" />
                            <span className="text-xs font-medium text-gray-700">Mes Commandes</span>
                        </Link>
                        <Link href="/favoris" className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" onClick={onClose}>
                            <Heart size={20} className="text-secondary mb-1" />
                            <span className="text-xs font-medium text-gray-700">Favoris</span>
                        </Link>
                    </div>

                    {/* Categories */}
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Nos Rayons</h3>
                        <ul className="space-y-1">
                            {categories.map((cat, idx) => (
                                <li key={idx}>
                                    <Link
                                        href={`/cat/${cat.slug}`}
                                        className="flex items-center justify-between px-3 py-3 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors group"
                                        onClick={onClose}
                                    >
                                        {cat.name}
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-secondary" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Help & Links */}
                    <div className="p-4 border-t border-gray-100">
                        <ul className="space-y-3">
                            <li><Link href="/aide" className="text-sm text-gray-600 hover:text-primary" onClick={onClose}>Centre d'aide</Link></li>
                            <li><Link href="/vendre" className="text-sm text-gray-600 hover:text-primary" onClick={onClose}>Vendre sur Tafa</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileMenu;
