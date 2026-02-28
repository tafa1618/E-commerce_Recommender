'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Phone, HelpCircle, RotateCcw, Monitor, Shirt, Home, Sparkles, Baby, Dumbbell, Car } from 'lucide-react';

const categories = [
    { name: "Électronique & Info", icon: <Monitor size={18} /> },
    { name: "Mode Homme & Femme", icon: <Shirt size={18} /> },
    { name: "Maison & Cuisine", icon: <Home size={18} /> },
    { name: "Santé & Beauté", icon: <Sparkles size={18} /> },
    { name: "Bébé & Jouets", icon: <Baby size={18} /> },
    { name: "Sports & Loisirs", icon: <Dumbbell size={18} /> },
    { name: "Auto & Moto", icon: <Car size={18} /> },
];

const slides = [
    {
        bg: "bg-gradient-to-r from-blue-600 to-blue-800",
        title: "Tafa Week",
        subtitle: "Jusqu'à -50% sur l'électronique",
        image: "https://via.placeholder.com/800x400?text=Promo+Appareils",
        cta: "J'en profite"
    },
    {
        bg: "bg-gradient-to-r from-orange-500 to-red-600",
        title: "Mode Festival",
        subtitle: "La nouvelle collection est arrivée",
        image: "https://via.placeholder.com/800x400?text=Mode+Collection",
        cta: "Voir la boutique"
    }
];

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="bg-gray-100 py-4">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-12 gap-4 h-[380px]">
                    {/* Left Sidebar Menu (2 cols) */}
                    <div className="hidden lg:block col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 py-2 h-full">
                        <ul className="flex flex-col h-full justify-between">
                            {categories.map((cat, idx) => (
                                <li key={idx}>
                                    <Link href="#" className="flex items-center justify-between px-3 py-2.5 hover:bg-orange-50 hover:text-secondary text-gray-700 text-sm transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 group-hover:text-secondary">{cat.icon}</span>
                                            <span>{cat.name}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-secondary opacity-0 group-hover:opacity-100" />
                                    </Link>
                                </li>
                            ))}
                            <li className="border-t border-gray-100 mt-auto pt-2">
                                <Link href="#" className="flex items-center gap-3 px-3 py-2.5 text-secondary hover:underline text-sm font-medium">
                                    <span className="text-xl">🔥</span>
                                    Offres du jour
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Center Slider (8 cols) */}
                    <div className="col-span-12 lg:col-span-8 bg-white rounded-lg shadow-sm overflow-hidden relative group">
                        <div className="h-full relative">
                            {slides.map((slide, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100' : 'opacity-0'} ${slide.bg}`}
                                >
                                    <div className="h-full flex items-center p-8 md:p-12">
                                        <div className="w-1/2 space-y-4 z-10">
                                            <span className="inline-block bg-white/20 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide backdrop-blur-sm border border-white/20">
                                                Offre Spéciale
                                            </span>
                                            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
                                                {slide.title}
                                            </h2>
                                            <p className="text-white/90 text-lg font-medium">{slide.subtitle}</p>
                                            <button className="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-1 mt-4">
                                                {slide.cta}
                                            </button>
                                        </div>
                                        {/* Image would go here on the right side of the slide */}
                                    </div>
                                </div>
                            ))}

                            {/* Slider Dots */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {slides.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Banners (2 cols) */}
                    <div className="hidden lg:flex col-span-2 flex-col gap-4 h-full">
                        {/* Help Center Card */}
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-center items-center text-center border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <HelpCircle size={24} className="text-secondary" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">Besoin d'aide ?</h3>
                            <p className="text-xs text-gray-500 mb-2">Guide d'achat & FAQ</p>
                        </div>

                        {/* Returns Card */}
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 flex flex-col justify-center items-center text-center border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <RotateCcw size={24} className="text-primary" />
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm mb-1">Retour Facile</h3>
                            <p className="text-xs text-gray-500 mb-2">Sous 7 jours</p>
                        </div>

                        {/* Sell on Tafa Card */}
                        <div className="flex-1 bg-[url('https://via.placeholder.com/300x150')] bg-cover bg-center rounded-lg shadow-sm relative overflow-hidden group cursor-pointer">
                            <div className="absolute inset-0 bg-primary/90 flex flex-col justify-center items-center text-center p-3 transition-colors group-hover:bg-primary/95">
                                <span className="text-orange-400 font-bold text-xs uppercase mb-1">Vendez sur Tafa</span>
                                <p className="text-white text-xs leading-tight">Gagnez de l'argent dès aujourd'hui</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
