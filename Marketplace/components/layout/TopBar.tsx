'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Phone, Heart } from 'lucide-react';
import MobileMenu from './MobileMenu';

const TopBar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white shadow-md font-rubik">
            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

            {/* Top Strip */}
            <div className="bg-[#0a1120] text-gray-400 text-[11px] py-1.5 border-b border-white/5">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
                            <Phone size={12} /> +221 77 123 45 67
                        </span>
                        <span className="hidden sm:inline">Livraison partout au Sénégal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/vendre" className="hover:text-secondary transition-colors font-medium">Vendre sur Tafa</Link>
                        <span className="w-px h-3 bg-gray-700"></span>
                        <Link href="/aide" className="hover:text-white transition-colors">Aide</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-6 md:gap-8">
                    {/* Mobile Menu Trigger & Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                            <img
                                src="/logo-Tafa.png"
                                alt="Tafa Business Marketplace"
                                className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                        </Link>
                    </div>

                    {/* Search Bar (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400 group-focus-within:text-secondary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un produit, une marque, une catégorie..."
                            className="w-full h-12 pl-11 pr-32 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all placeholder:text-gray-400 text-sm"
                        />
                        <button className="absolute right-1 top-1 bottom-1 px-5 bg-[#131f35] hover:bg-black text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                            Rechercher
                        </button>
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center gap-4 lg:gap-8">
                        <Link href="/connexion" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-blue-50 transition-colors">
                                <User size={22} className="text-gray-600 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="hidden lg:flex flex-col text-sm">
                                <span className="text-[11px] text-gray-500 leading-tight">Mon Compte</span>
                                <span className="font-bold text-gray-800 group-hover:text-primary transition-colors">Se connecter</span>
                            </div>
                        </Link>

                        <Link href="/panier" className="flex items-center gap-3 group relative">
                            <div className="p-2 rounded-full bg-gray-50 group-hover:bg-orange-50 transition-colors relative">
                                <ShoppingCart size={22} className="text-gray-600 group-hover:text-secondary transition-colors" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm transform group-hover:scale-110 transition-transform">
                                    3
                                </span>
                            </div>
                            <div className="hidden lg:flex flex-col text-sm">
                                <span className="text-[11px] text-gray-500 leading-tight">Mon Panier</span>
                                <span className="font-bold text-gray-800 group-hover:text-secondary transition-colors">45,000 FCFA</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Bar (Desktop) */}
            <div className="border-t border-gray-100 bg-white hidden md:block">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center gap-8 text-[13px] font-medium py-0 h-12">
                        <div className="h-full flex items-center gap-2 px-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors font-bold mr-2 border-r border-gray-200">
                            <Menu size={18} />
                            <span>Toutes les catégories</span>
                        </div>
                        {['Nouveautés', 'Meilleures Ventes', 'Électronique', 'Maison & Bureau', 'Mode', 'Santé & Beauté'].map((item) => (
                            <Link key={item} href={`/${item.toLowerCase()}`} className="h-full flex items-center hover:text-secondary hover:border-b-2 hover:border-secondary transition-all px-1">
                                {item}
                            </Link>
                        ))}
                        <Link href="/deals" className="ml-auto flex items-center gap-2 text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-full text-xs font-bold transition-transform hover:scale-105 shadow-md shadow-red-500/20">
                            <Heart size={12} fill="currentColor" />
                            Flash Deals
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
